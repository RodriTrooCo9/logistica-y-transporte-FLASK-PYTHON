# database.py
from flask_sqlalchemy import SQLAlchemy

# Inicializamos la instancia sin la app todavía (se vincula en app.py)
db = SQLAlchemy()

def init_db(app):
    # Aquí es donde ocurre la magia de la conexión
    # Reemplaza 'usuario', 'password' y 'nombre_bd'
    app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:1878130@localhost:5432/nodejs'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    db.init_app(app)
    
    # Opcional: Crear tablas automáticamente si no existen
    with app.app_context():
        db.create_all()