
// Código React final completo del Perfil del Usuario con edición protegida, documentación, historial y fotos
"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar,
  Box,
  Button,
  TextField,
  Modal,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material";
import DocumentacionPerfil from "./documentacion";

interface Documentacion {
  tipo: string;
  estado: "vigente" | "vencido";
  vencimiento: string;
  archivo_url?: string;
}

interface RegistroAcceso {
  fecha: string;
  hora: string;
  barrera: string;
  sentido: "Entrada" | "Salida";
}

interface PerfilUsuario {
  nombre: string;
  dni: string;
  idKey: string;
  patente: string;
  tag: string;
  telefono: string;
  proveedor: string;
  activo: string;
  permisoHasta: string;
  obs: string;
  fotoPerfilUrl: string;
  fotoVehiculoUrl: string;
  documentacion: Documentacion[];
  historial: RegistroAcceso[];
}

const tiposDocumentos = [
  "CUIL", "DNI", "ART", "Recibo", "Seguro", "Licencia", "Otros"
];

export default function PerfilCompleto({ dni }: { dni: string }) {
  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);
  const [openQR, setOpenQR] = useState(false);
  const [qrTipo, setQrTipo] = useState<string>("perfil");
  const [qrDocIndex, setQrDocIndex] = useState<number | null>(null);
  const [editando, setEditando] = useState(false);

  useEffect(() => {
    const fetchPerfil = () => {
      if (editando) return;
      fetch(`http://localhost/adeco/api/get_perfil.php?dni=${dni}`)
        .then((res) => res.json())
        .then((data) => {
          const nuevo: PerfilUsuario = {
            nombre: data.Name,
            dni: data.Dni?.toString(),
            idKey: data.Id_Key,
            patente: data.patente,
            tag: data.tag,
            telefono: data.Telefono,
            proveedor: data.Id_Customer,
            activo: data.Active,
            permisoHasta: data.Permission_End,
            obs: data.Obs,
            fotoPerfilUrl: data.fotoPerfilUrl || "",
            fotoVehiculoUrl: data.fotoVehiculoUrl || "",
            documentacion: data.documentacion || [],
            historial: data.historial || [],
          };
          setPerfil(nuevo);
        });
    };
    fetchPerfil();
    const i = setInterval(fetchPerfil, 5000);
    return () => clearInterval(i);
  }, [dni, editando]);

  if (!perfil) return <div>Cargando...</div>;

  const guardarCambios = () => {
    fetch("http://localhost/adeco/api/update_perfil.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(perfil),
    })
      .then((res) => res.json())
      .then((data) => {
        alert(data.success ? "Perfil actualizado" : "Error al guardar");
        setEditando(false);
      });
  };

  const generarQR = (tipo: string, index?: number) => {
    setQrTipo(tipo);
    if (index !== undefined) setQrDocIndex(index);
    setOpenQR(true);
  };

  const qrUrl = qrTipo === "perfil" || qrTipo === "vehiculo"
    ? `http://192.168.0.85/adeco/foto/subir_foto_perfil.html?dni=${perfil.dni}&tipo=${qrTipo === "perfil" ? "fotoPerfilUrl" : "fotoVehiculoUrl"}`
    : `http://192.168.0.85/adeco/foto/subir_doc.html?dni=${perfil.dni}&tipo=${encodeURIComponent(qrTipo)}`;

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>Perfil del Usuario</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              {perfil.fotoPerfilUrl ? (
                <Avatar
                  src={`http://192.168.0.85/adeco/api/${perfil.fotoPerfilUrl}?t=${Date.now()}`}
                  sx={{ width: 120, height: 120, margin: "auto" }}
                />
              ) : (
                <Typography align="center" color="text.secondary">Sin foto de perfil</Typography>
              )}
              <Typography align="center" variant="h6">{perfil.nombre}</Typography>
              <Typography align="center" color="textSecondary">DNI: {perfil.dni}</Typography>
              <Button fullWidth sx={{ mt: 2 }} variant="outlined" onClick={() => generarQR("perfil")}>
                📷 Subir/Reemplazar Foto De Perfil
              </Button>
            </CardContent>
          </Card>

          <Card sx={{ mt: 2 }}>
            <CardContent>
              {perfil.fotoVehiculoUrl ? (
                <Image
                  src={`http://192.168.0.85/adeco/api/${perfil.fotoVehiculoUrl}?t=${Date.now()}`}
                  alt="Vehículo"
                  width={200}
                  height={120}
                  style={{ borderRadius: 8, display: "block", margin: "auto" }}
                />
              ) : (
                <Typography align="center" color="text.secondary">Sin foto de vehículo</Typography>
              )}
              <Button fullWidth sx={{ mt: 2 }} variant="outlined" onClick={() => generarQR("vehiculo")}>
                📷 Subir/Reemplazar Foto Vehículo
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card><CardContent>
            <Grid container spacing={2}>
              <Grid item xs={6}><TextField label="ID Key" fullWidth value={perfil.idKey} disabled /></Grid>
              <Grid item xs={6}><TextField label="Tag" fullWidth value={perfil.tag} disabled /></Grid>
              <Grid item xs={6}><TextField label="Patente" fullWidth value={perfil.patente} disabled /></Grid>
              <Grid item xs={6}><TextField label="Teléfono" fullWidth value={perfil.telefono} onChange={(e) => { setEditando(true); setPerfil({ ...perfil, telefono: e.target.value }); }} /></Grid>
              <Grid item xs={6}><TextField label="Proveedor" fullWidth value={perfil.proveedor} onChange={(e) => { setEditando(true); setPerfil({ ...perfil, proveedor: e.target.value }); }} /></Grid>
              <Grid item xs={6}><TextField label="Estado" fullWidth value={perfil.activo} onChange={(e) => { setEditando(true); setPerfil({ ...perfil, activo: e.target.value }); }} /></Grid>
              <Grid item xs={6}><TextField label="Permiso hasta" type="date" fullWidth value={perfil.permisoHasta} onChange={(e) => { setEditando(true); setPerfil({ ...perfil, permisoHasta: e.target.value }); }} /></Grid>
              <Grid item xs={12}><TextField label="Observaciones" fullWidth multiline value={perfil.obs} onChange={(e) => { setEditando(true); setPerfil({ ...perfil, obs: e.target.value }); }} /></Grid>
            </Grid>
          </CardContent></Card>

          <Card sx={{ mt: 2 }}><CardContent>
            <Typography variant="h6">Documentación</Typography>
            {perfil.documentacion.map((doc, index) => {
              const vencimiento = new Date(doc.vencimiento);
              const hoy = new Date();
              const diff = (vencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24);
              const bg = diff < 0 ? '#ffcccc' : diff < 30 ? '#fff3cd' : 'transparent';

              return (
                <Box key={index} display="flex" alignItems="center" gap={1} borderBottom="1px solid #eee" py={1} bgcolor={bg}>
                <DocumentacionPerfil
                
                dni={perfil.dni}
                documentacion={perfil.documentacion}
                setDocumentacion={(docs) => setPerfil({ ...perfil, documentacion: docs })}
                setEditando={setEditando}
                onQR={generarQR}
                />
                </Box>
              );
            })}
            <Box mt={2}><Button variant="outlined" onClick={() => {
              setEditando(true);
              setPerfil({ ...perfil, documentacion: [...perfil.documentacion, { tipo: "", estado: "vigente", vencimiento: "" }] });
            }}>+ Agregar Documento</Button></Box>
          </CardContent></Card>

          <Card sx={{ mt: 2 }}><CardContent>
            <Typography variant="h6">Historial de Accesos</Typography>
            {perfil.historial.length === 0 ? (
              <Typography variant="body2" color="text.secondary">No hay registros aún.</Typography>
            ) : (
              perfil.historial.map((r, i) => (
                <Box key={i} display="flex" justifyContent="space-between" borderBottom="1px solid #eee" py={1}>
                  <Typography>{r.fecha} {r.hora}</Typography>
                  <Typography>{r.barrera}</Typography>
                  <Typography>{r.sentido}</Typography>
                </Box>
              ))
            )}
          </CardContent></Card>

          <Box mt={4}><Button variant="contained" color="primary" onClick={guardarCambios}>Guardar Cambios</Button></Box>
        </Grid>
      </Grid>

      <Modal open={openQR} onClose={() => setOpenQR(false)}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'background.paper', p: 4, borderRadius: 2, boxShadow: 24 }}>
          <Typography variant="h6" mb={2}>Escaneá este QR desde tu celular</Typography>
          <img src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(qrUrl)}`} alt="QR" />
          <Box mt={2}><Button variant="outlined" fullWidth onClick={() => setOpenQR(false)}>Cerrar</Button></Box>
        </Box>
      </Modal>
    </Box>
  );
}
