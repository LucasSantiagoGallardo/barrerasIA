from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict
import socket, threading, requests, time, csv
from datetime import datetime
import sqlalchemy as sa

# CONFIGURA ESTO:
DB_URL = "mysql+pymysql://root:@localhost/adeco2"
API_URL = "http://localhost/adeco/api/vtag.php"
COPIA_URL = "http://localhost/adeco/api/vtg.php"
CSV_FILE = "lecturas.csv"

engine = sa.create_engine(DB_URL)
metadata = sa.MetaData()

lectores_tb = sa.Table(
    "lectores", metadata,
    sa.Column("id", sa.Integer, primary_key=True),
    sa.Column("nombre", sa.String(100)),
    sa.Column("ip", sa.String(50)),
    sa.Column("port", sa.Integer),
    sa.Column("rele_on", sa.String(100)),
    sa.Column("rele_off", sa.String(100)),
    sa.Column("rtsp_url", sa.String(255)),
    sa.Column("lectura_auto", sa.Boolean, nullable=True, default=True),
)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class LectorIn(BaseModel):
    nombre: str
    ip: str
    port: int
    rele_on: str
    rele_off: str
    rtsp_url: Optional[str] = None
    lectura_auto: Optional[bool] = True

class LectorOut(LectorIn):
    id: int

estado_lectores: Dict[int, dict] = {}
cache_tags = {}
locks = {}

# --- Funciones de soporte ---

def epc_a_decimal(epc_hex: str) -> str:
    if len(epc_hex) < 24:
        return None
    recorte = epc_hex[18:24]
    decimal = int(recorte, 16)
    return f"{decimal:08d}"

def guardar_en_csv(epc_original, epc_decimal, habilitado, lector, dni):
    with open(CSV_FILE, mode='a', newline='') as file:
        writer = csv.writer(file)
        writer.writerow([datetime.now().isoformat(), lector, epc_original, epc_decimal, habilitado, dni])
      #  registrar_acceso(epc_decimal, habilitado, dni, lector)

def actualizar_copia_local():
    global cache_tags
    while True:
        try:
            response = requests.get(COPIA_URL, timeout=10)
            data = response.json()
            cache_tags.clear()
            for tag in data.get("datos", []):
                clave = str(tag.get("tag") or tag.get("Id_key") or "").strip().upper()
                if clave:
                    cache_tags[clave] = tag
            print(f"🔄 Copia local actualizada con {len(cache_tags)} tags")
        except Exception as e:
            print(f"❌ Error al actualizar copia local: {e}")
        time.sleep(15)

def validar_epc_con_api(epc_hex: str, nombre: str, dni: str, nombreape: str) -> bool:
    try:
        response = requests.post(API_URL, json={
            "epc": epc_hex,
            "nombre": nombre,
            "dni": dni,
            "nombreApe": nombreape
        })
        response.raise_for_status()
        data = response.json()
        return data.get("habilitado", False)
        
    except Exception as e:
        print(f"❌ Error consultando API: {e}")
        return False

# --- Background: Cache y estado de lectores ---

def loop_lector(lector_db: dict):
    lector_id = lector_db["id"]
    nombre = lector_db["nombre"]
    locks[lector_id] = threading.Lock()

    while True:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        try:
            sock.settimeout(5)
            sock.connect((lector_db["ip"], lector_db["port"]))
            print(f"✅ Conectado a {nombre} en {lector_db['ip']}")
            estado_lectores[lector_id] = {"conectado": True, "ultimo_uid": None, "error": False}

            while True:
                with locks[lector_id]:
                    try:
                        # Envío de comando y parseo
                        sock.sendall(bytes.fromhex("7C FF FF 20 00 00 66"))
                        data = sock.recv(1024)
                        hex_data = data.hex().upper()

                        # Decodificación custom
                        if data.startswith(b'\xCC\xFF\xFF') and data[3] == 0x20 and len(data) >= 12:
                            payload = data[7:]
                            if len(payload) >= 18:
                                epc = payload[2:14].hex().upper()
                                epc_decimal = epc_a_decimal(epc)
                                print(f"[{nombre}] 🔖 TAG DETECTADO: {epc} ➜ DECIMAL: {epc_decimal}")

                                tag_data = cache_tags.get(epc_decimal.upper())
                                if tag_data:
                                    nombreape = f"{tag_data.get('Name', '').strip()} {tag_data.get('Last_Name', '').strip()}"
                                    dni = str(tag_data.get("Dni", "")).strip()
                                    habilitado = validar_epc_con_api(epc_decimal, nombre, dni, nombreape)
                                else:
                                    habilitado = validar_epc_con_api(epc_decimal, nombre, 'Desconocido', 'Desconocido')

                                guardar_en_csv(epc, epc_decimal, habilitado, nombreape, dni)
                                estado_lectores[lector_id]["ultimo_uid"] = epc_decimal

                                if habilitado:
                                    print(f"[{nombre}] ✅ EPC habilitado. Activando relé...")
                                    sock.sendall(bytes.fromhex(lector_db["rele_on"]))
                                    time.sleep(2)
                                    sock.sendall(bytes.fromhex(lector_db["rele_off"]))
                                else:
                                    print(f"[{nombre}] ❌ EPC no habilitado.")
                        time.sleep(1)
                    except Exception as e:
                        print(f"[{nombre}] ❌ Error en lectura: {e}")
                        estado_lectores[lector_id]["error"] = True
                        break
        except Exception as e:
            print(f"❌ Error al conectar con {nombre} ({lector_db['ip']}): {e}")
            estado_lectores[lector_id] = {"conectado": False, "ultimo_uid": None, "error": True}
        finally:
            sock.close()
            time.sleep(10) 
            
             # Reintento
def registrar_acceso(epc_decimal, habilitado, dni, barrera):
    from datetime import datetime
    resultado = "permitido" if habilitado else "denegado"
    now = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    with engine.begin() as conn:
        conn.execute(
            sa.text("""
                INSERT INTO hist (timestamp, Id_Key, dni, barrera, resultado)
                VALUES (:timestamp, :Id_Key, :dni, :barrera, :resultado)
            """),
            {
                "timestamp": now,
                "Id_Key": epc_decimal,
                "dni": dni,
                "barrera": barrera,
                "resultado": resultado
            }
        )



def lanzar_lectores():
    # Lanzar hilos solo para lectores con lectura_auto = TRUE (o null, default True)
    with engine.connect() as conn:
        result = conn.execute(lectores_tb.select()).fetchall()
        for row in result:
            lector_db = dict(row._mapping)
            if lector_db.get("lectura_auto", True):  # Default True para los viejos
                estado_lectores[lector_db["id"]] = {"conectado": False, "ultimo_uid": None, "error": True}
                threading.Thread(target=loop_lector, args=(lector_db,), daemon=True).start()

# Lanzar el thread de actualización de copia local al iniciar
threading.Thread(target=actualizar_copia_local, daemon=True).start()
threading.Thread(target=lanzar_lectores, daemon=True).start()

# --- Endpoints REST ---

@app.get("/lectores", response_model=List[LectorOut])
def get_lectores():
    with engine.connect() as conn:
        result = conn.execute(lectores_tb.select()).fetchall()
        return [dict(row._mapping) for row in result]

@app.post("/lectores", response_model=LectorOut)
def add_lector(lector: LectorIn, bg: BackgroundTasks = None):
    with engine.begin() as conn:
        result = conn.execute(lectores_tb.insert().values(**lector.dict()))
        lector_id = result.lastrowid
        new_lector = conn.execute(lectores_tb.select().where(lectores_tb.c.id == lector_id)).fetchone()
        if new_lector is None:
            raise HTTPException(status_code=404, detail="Lector no encontrado")
        # Lanzar el thread para ese lector si querés live reload
        lector_db = dict(new_lector._mapping)
        if lector_db.get("lectura_auto", True):
            threading.Thread(target=loop_lector, args=(lector_db,), daemon=True).start()
        return lector_db

@app.put("/lectores/{lector_id}", response_model=LectorOut)
def update_lector(lector_id: int, lector: LectorIn):
    with engine.begin() as conn:
        result = conn.execute(lectores_tb.update().where(lectores_tb.c.id == lector_id).values(**lector.dict()))
        if result.rowcount == 0:
            raise HTTPException(status_code=404, detail="Lector no encontrado")
        updated_lector = conn.execute(lectores_tb.select().where(lectores_tb.c.id == lector_id)).fetchone()
        return dict(updated_lector._mapping)

@app.delete("/lectores/{lector_id}")
def delete_lector(lector_id: int):
    with engine.begin() as conn:
        result = conn.execute(lectores_tb.delete().where(lectores_tb.c.id == lector_id))
        if result.rowcount == 0:
            raise HTTPException(status_code=404, detail="Lector no encontrado")
        return {"ok": True}

@app.post("/lectores/{lector_id}/abrir")
def abrir_barrera(lector_id: int):
    lock = locks.get(lector_id)
    with engine.connect() as conn:
        lector = conn.execute(lectores_tb.select().where(lectores_tb.c.id == lector_id)).fetchone()
        if lector is None:
            raise HTTPException(status_code=404, detail="Lector no encontrado")
        lector = dict(lector._mapping)
    try:
        with lock:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.connect((lector["ip"], lector["port"]))
            sock.sendall(bytes.fromhex(lector["rele_on"]))
            sock.close()
        return {"ok": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al abrir barrera: {e}")

@app.post("/lectores/{lector_id}/cerrar")
def cerrar_barrera(lector_id: int):
    lock = locks.get(lector_id)
    with engine.connect() as conn:
        lector = conn.execute(lectores_tb.select().where(lectores_tb.c.id == lector_id)).fetchone()
        if lector is None:
            raise HTTPException(status_code=404, detail="Lector no encontrado")
        lector = dict(lector._mapping)
    try:
        with lock:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.connect((lector["ip"], lector["port"]))
            sock.sendall(bytes.fromhex(lector["rele_off"]))
            sock.close()
        return {"ok": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al cerrar barrera: {e}")

@app.get("/lectores/estados")
def estado_todas():
    return estado_lectores

@app.get("/lectores/{lector_id}/leer-tag")
def leer_tag(lector_id: int):
    data = estado_lectores.get(lector_id)
    if not data or not data.get("ultimo_uid"):
        return {"tag_raw": None, "msg": "No se detectó tag"}
    return {"tag_raw": data["ultimo_uid"]}

# NUEVO ENDPOINT: On-demand, solo lee el tag y nada más
@app.get("/lectores/{lector_id}/leer-tag-directo")
def leer_tag_directo(lector_id: int):
    """
    Se conecta al lector, lee una vez y devuelve el tag. No activa relé ni estados.
    """
    with engine.connect() as conn:
        lector = conn.execute(lectores_tb.select().where(lectores_tb.c.id == lector_id)).fetchone()
        if lector is None:
            raise HTTPException(status_code=404, detail="Lector no encontrado")
        lector = dict(lector._mapping)

    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(5)
        sock.connect((lector["ip"], lector["port"]))
        sock.sendall(bytes.fromhex("7C FF FF 20 00 00 66"))
        data = sock.recv(1024)
        sock.close()
        if data.startswith(b'\xCC\xFF\xFF') and data[3] == 0x20 and len(data) >= 12:
            payload = data[7:]
            if len(payload) >= 18:
                epc = payload[2:14].hex().upper()
                epc_decimal = epc_a_decimal(epc)
                return {"tag_hex": epc, "tag_decimal": epc_decimal}
        return {"tag_hex": None, "tag_decimal": None, "msg": "No se detectó tag"}
    except Exception as e:
        return {"error": f"No se pudo leer tag: {e}"}

@app.get("/")
def read_root():
    return {"status": "ok"}
