# models.py
from database import db
from datetime import datetime

class Vehiculo(db.Model):
    __tablename__ = 'Vehiculos'
    id = db.Column(db.Integer, primary_key=True)
    matricula = db.Column(db.String(20), unique=True, nullable=False)
    capacidad = db.Column(db.Integer, nullable=False)
    tipo_id = db.Column(db.Integer, db.ForeignKey('TiposVehiculo.id'))
    conductor_id = db.Column(db.Integer, db.ForeignKey('Users.id'))
    
    def to_dict(self):
        return {
            'id': self.id, 
            'matricula': self.matricula, 
            'capacidad': self.capacidad,
            'conductor_id': self.conductor_id
        }

# ... (Definir aquí el resto de modelos: Viaje, User, TiposVehiculo, etc.)