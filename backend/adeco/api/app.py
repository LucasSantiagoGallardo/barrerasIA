from flask import Flask, request, jsonify
from flask_cors import CORS

from requests.auth import HTTPDigestAuth
import requests

app = Flask(__name__)
CORS(app)
# Configuración de dispositivos Hikvision
DEVICES = {
    "tambo1": {
        "ip": "192.168.182.111",
        "user": "admin",
        "password": "emma2018",
        "door_id": 1
    },
    "tambo2": {
        "ip": "192.168.1.101",
        "user": "admin",
        "door_id": 1
    }
    # Agregá más dispositivos si hace falta
}

@app.route('/barrier', methods=['POST'])
def control_barrier():
    data = request.get_json()
    endpoint = data.get('endpoint')
    action = data.get('action')

    if not endpoint or not action:
        return jsonify({"error": "Faltan parámetros"}), 400

    device = DEVICES.get(endpoint)
    if not device:
        return jsonify({"error": "Dispositivo no encontrado"}), 404

    ip = device['ip']
    user = device['user']
    password = device['password']
    door_id = device['door_id']

    # Llamado ISAPI
    url = f"http://{ip}/ISAPI/AccessControl/RemoteControl/door/{door_id}"
    headers = {"Content-Type": "application/xml"}
    payload = "<RemoteControlDoor><cmd>open</cmd></RemoteControlDoor>" if action == "open" else "<RemoteControlDoor><cmd>close</cmd></RemoteControlDoor>"

    try:
        response = requests.put(url, data=payload, headers=headers, auth=HTTPDigestAuth(user, password), timeout=5)
        if response.status_code == 200:
            return jsonify({"message": f"Puerta '{endpoint}' {action} correctamente."})
        else:
            return jsonify({"error": f"Fallo al ejecutar acción. Código: {response.status_code}", "detalle": response.text}), 500
    except Exception as e:
        return jsonify({"error": f"Excepción: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(port=5000, host='0.0.0.0')
