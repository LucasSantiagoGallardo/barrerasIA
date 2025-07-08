from flask import Flask, request, jsonify
import RPi.GPIO as GPIO

from flask_cors import CORS  # Importa CORS


app = Flask(__name__)
CORS(app)  
# Configuración de los pines GPIO
GPIO.setmode(GPIO.BCM)
GPIO.setwarnings(False)

# Definir los pines que vas a controlar (ejemplo)
PIN_BAR1 = 18  # Cambia por el número de pin que estés usando
PIN_BAR2 = 27  # Cambia por el número de pin que estés usando

# Configurar los pines como salidas
GPIO.setup(PIN_BAR1, GPIO.OUT)
GPIO.setup(PIN_BAR2, GPIO.OUT)

@app.route('/control-barrier/<int:id>', methods=['POST'])
def control_barrier(id):
    action = request.json.get('action')
    
    if action not in ['open', 'close']:
        return jsonify({'error': 'Acción no válida'}), 400

    # Mapear ID a los pines GPIO
    pin = None
    if id == 1:
        pin = PIN_BAR1
    elif id == 2:
        pin = PIN_BAR2
    else:
        return jsonify({'error': 'Barrera no encontrada'}), 404

    # Controlar el pin GPIO (activar o desactivar)
    if action == 'open':
        GPIO.output(pin, GPIO.HIGH)  # Activar pin (abrir)
    elif action == 'close':
        GPIO.output(pin, GPIO.LOW)   # Desactivar pin (cerrar)
    
    return jsonify({'message': f'Barrera {id} {action}da correctamente'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
