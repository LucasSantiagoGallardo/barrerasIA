from flask import Flask, jsonify, render_template, request
import smbus2
import time
import RPi.GPIO as GPIO

app = Flask(__name__)

# Configuración del bus I2C
bus = smbus2.SMBus(1)
DEVICE_ADDRESS = 0x20  # Dirección del Arduino

# Configuración del GPIO
GPIO.setmode(GPIO.BCM)
GPIO.setup(14, GPIO.OUT)  # Configura GPIO14 como salida
GPIO.output(14, GPIO.LOW)  # Apaga el GPIO14 inicialmente

# Ruta para la página principal
@app.route("/")
def index():
    return render_template("index.html")

# Ruta para obtener el UID
@app.route("/uid")
def get_uid():
    try:
        # Leer 4 bytes desde el Arduino
        uid = bus.read_i2c_block_data(DEVICE_ADDRESS, 0, 4)
        uid_hex = ''.join(f'{byte:02X}' for byte in uid)
        return jsonify({"uid": uid_hex})
    except Exception as e:
        return jsonify({"error": str(e)})

# Ruta para controlar el GPIO14
@app.route("/gpio", methods=["POST"])
def control_gpio():
    action = request.json.get("action")
    if action == "on":
        GPIO.output(14, GPIO.HIGH)  # Encender GPIO14
        return jsonify({"status": "on"})
    elif action == "off":
        GPIO.output(14, GPIO.LOW)  # Apagar GPIO14
        return jsonify({"status": "off"})
    return jsonify({"error": "Invalid action"}), 400

if __name__ == "__main__":
    try:
        app.run(host="0.0.0.0", port=5000, debug=True)
    finally:
        GPIO.cleanup()  # Restaurar los GPIO al finalizar
