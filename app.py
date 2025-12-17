from flask import Flask, request, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

app = Flask(__name__)

# CONFIGURACIÓN DE LA BASE DE DATOS
# CONFIGURACIÓN DE LA BASE DE DATOS
# Usamos SQLite por defecto para que funcione de inmediato sin configuración extra
import os
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'database.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# ----------------------------------------------------------
# 1. MODELOS (Mapeo de tus tablas SQL a Python)
# ----------------------------------------------------------

class User(db.Model):
    __tablename__ = 'Users'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    create_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {'id': self.id, 'name': self.name, 'email': self.email}

class TipoVehiculo(db.Model):
    __tablename__ = 'TiposVehiculo'
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(50), nullable=False)

    def to_dict(self):
        return {'id': self.id, 'nombre': self.nombre}

class EstadoViaje(db.Model):
    __tablename__ = 'EstadosViaje'
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(50), nullable=False)

    def to_dict(self):
        return {'id': self.id, 'nombre': self.nombre}

class Vehiculo(db.Model):
    __tablename__ = 'Vehiculos'
    id = db.Column(db.Integer, primary_key=True)
    matricula = db.Column(db.String(20), unique=True, nullable=False)
    capacidad = db.Column(db.Integer, nullable=False)
    
    # Llaves foráneas
    tipo_id = db.Column(db.Integer, db.ForeignKey('TiposVehiculo.id'))
    conductor_id = db.Column(db.Integer, db.ForeignKey('Users.id'))
    
    # Relaciones para acceder a los nombres fácilmente
    tipo = db.relationship('TipoVehiculo')
    conductor = db.relationship('User')

    def to_dict(self):
        return {
            'id': self.id,
            'matricula': self.matricula,
            'capacidad': self.capacidad,
            'tipo': self.tipo.nombre if self.tipo else None,
            'conductor': self.conductor.name if self.conductor else "Sin asignar"
        }

class Viaje(db.Model):
    __tablename__ = 'Viajes'
    id = db.Column(db.Integer, primary_key=True)
    origen = db.Column(db.String(100), nullable=False)
    destino = db.Column(db.String(100), nullable=False)
    fecha = db.Column(db.DateTime, default=datetime.utcnow)
    
    vehiculo_id = db.Column(db.Integer, db.ForeignKey('Vehiculos.id'))
    estado_id = db.Column(db.Integer, db.ForeignKey('EstadosViaje.id'))
    
    # Check de llegada
    carga_correcta = db.Column(db.Boolean, default=False)
    observaciones = db.Column(db.String(255), nullable=True)
    
    vehiculo = db.relationship('Vehiculo')
    estado = db.relationship('EstadoViaje')

    def to_dict(self):
        return {
            'id': self.id,
            'origen': self.origen,
            'destino': self.destino,
            'fecha': self.fecha.isoformat(),
            'vehiculo': self.vehiculo.matricula if self.vehiculo else None,
            'vehiculo': self.vehiculo.matricula if self.vehiculo else None,
            'estado': self.estado.nombre if self.estado else None,
            'carga_correcta': self.carga_correcta,
            'observaciones': self.observaciones
        }

# ----------------------------------------------------------
# 2. RUTAS (ENDPOINTS)
# ----------------------------------------------------------

# === USUARIOS ===
@app.route('/users', methods=['GET'])
def get_users():
    users = User.query.all()
    return jsonify([u.to_dict() for u in users])

@app.route('/users', methods=['POST'])
def create_user():
    data = request.json
    try:
        new_user = User(name=data['name'], email=data['email'])
        db.session.add(new_user)
        db.session.commit()
        return jsonify(new_user.to_dict()), 201
    except Exception as e:
        return jsonify({'error': 'Email ya existe o datos invalidos'}), 400

@app.route('/users/<int:id>', methods=['PUT'])
def update_user(id):
    user = User.query.get_or_404(id)
    data = request.json
    user.name = data.get('name', user.name)
    user.email = data.get('email', user.email)
    db.session.commit()
    return jsonify(user.to_dict())

@app.route('/users/<int:id>', methods=['DELETE'])
def delete_user(id):
    user = User.query.get_or_404(id)
    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': 'User deleted'}), 204

# === VEHÍCULOS ===
@app.route('/vehiculos', methods=['GET'])
def get_vehiculos():
    # SQLAlchemy hace los JOINS automáticamente gracias a las relaciones definidas arriba
    vehiculos = Vehiculo.query.all()
    return jsonify([v.to_dict() for v in vehiculos])

@app.route('/vehiculos', methods=['POST'])
def create_vehiculo():
    data = request.json
    try:
        new_vehicle = Vehiculo(
            matricula=data['matricula'],
            capacidad=data['capacidad'],
            tipo_id=data['tipo_id'],      # ID de la tabla TiposVehiculo
            conductor_id=data.get('conductor_id') # ID de la tabla Users
        )
        db.session.add(new_vehicle)
        db.session.commit()
        return jsonify(new_vehicle.to_dict()), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/vehiculos/<int:id>', methods=['PUT'])
def update_vehiculo(id):
    vehicle = Vehiculo.query.get_or_404(id)
    data = request.json
    vehicle.matricula = data.get('matricula', vehicle.matricula)
    vehicle.capacidad = data.get('capacidad', vehicle.capacidad)
    vehicle.conductor_id = data.get('conductor_id', vehicle.conductor_id)
    db.session.commit()
    return jsonify(vehicle.to_dict())

@app.route('/vehiculos/<int:id>', methods=['DELETE'])
def delete_vehiculo(id):
    vehicle = Vehiculo.query.get_or_404(id)
    db.session.delete(vehicle)
    db.session.commit()
    return jsonify({'message': 'Vehículo eliminado'}), 204

@app.route('/tipos', methods=['GET'])
def get_tipos():
    tipos = TipoVehiculo.query.all()
    return jsonify([t.to_dict() for t in tipos])

@app.route('/estados', methods=['GET'])
def get_estados():
    estados = EstadoViaje.query.all()
    return jsonify([e.to_dict() for e in estados])



# === VIAJES ===
@app.route('/viajes', methods=['GET'])
def get_viajes():
    viajes = Viaje.query.all()
    return jsonify([v.to_dict() for v in viajes])

@app.route('/viajes', methods=['POST'])
def create_viaje():
    data = request.json
    try:
        new_viaje = Viaje(
            origen=data['origen'],
            destino=data['destino'],
            vehiculo_id=data['vehiculo_id'],
            estado_id=data['estado_id'] # ID de la tabla EstadosViaje
        )
        db.session.add(new_viaje)
        db.session.commit()
        return jsonify(new_viaje.to_dict()), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/viajes/<int:id>', methods=['PUT'])
def update_viaje_status(id):
    viaje = Viaje.query.get_or_404(id)
    data = request.json
    # Útil para actualizar solo el estado (Ej: de Pendiente -> En Ruta)
    if 'estado_id' in data:
        viaje.estado_id = data['estado_id']
    if 'destino' in data:
        viaje.destino = data['destino']
    if 'carga_correcta' in data:
        viaje.carga_correcta = data['carga_correcta']
    if 'observaciones' in data:
        viaje.observaciones = data['observaciones']
    
    db.session.commit()
    return jsonify(viaje.to_dict())

@app.route('/viajes/<int:id>', methods=['DELETE'])
def delete_viaje(id):
    viaje = Viaje.query.get_or_404(id)
    db.session.delete(viaje)
    db.session.commit()
    return jsonify({'message': 'Viaje eliminado'}), 204

# APP WEB
@app.route('/')
def home():
    return render_template('index.html')

# INICIALIZACIÓN
if __name__ == '__main__':
    with app.app_context():
        # Crea las tablas automáticamente
        db.create_all() 
        
        # Datos de prueba iniciales (opcional, para ver algo en el frontend)
        if not User.query.first():
            print("Creando datos de prueba...")
            u1 = User(name="Juan Perez", email="juan@example.com")
            u2 = User(name="Maria Lopez", email="maria@example.com")
            db.session.add_all([u1, u2])
            db.session.commit()
            
            tipo = TipoVehiculo(nombre="Camión")
            db.session.add(tipo)
            db.session.commit()
            
            v1 = Vehiculo(matricula="ABC-123", capacidad=5000, tipo_id=tipo.id, conductor_id=u1.id)
            db.session.add(v1)
            db.session.commit()
            
            estado_ruta = EstadoViaje(nombre="En Ruta")
            estado_fin = EstadoViaje(nombre="Finalizado")
            db.session.add_all([estado_ruta, estado_fin])
            db.session.commit()
            
            viaje = Viaje(origen="Lima", destino="Arequipa", vehiculo_id=v1.id, estado_id=estado_ruta.id)
            db.session.add(viaje)
            db.session.commit()
            
    app.run(debug=True, port=3000)