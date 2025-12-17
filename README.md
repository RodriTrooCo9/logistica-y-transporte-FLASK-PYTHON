# Sistema de Gestión de Transporte (TransFleet)

Sistema web moderno desarrollado en Flask para la gestión de flotas de transporte, conductores y viajes.

## 🚀 Características

- **Dashboard**: Vista general con estadísticas en tiempo real.
- **Gestión de Usuarios**: CRUD completo para conductores y administradores.
- **Gestión de Vehículos**: Registro de camiones con control de capacidad y tipo.
- **Control de Viajes**:
  - Asignación de rutas con destinos departamentales (Bolivia).
  - Control de estado (Pendiente, En Ruta, Finalizado).
  - **Verificación de Carga**: Confirmación de llegada con check de carga correcta y observaciones.
- **Interfaz Premium**: Diseño moderno con modo oscuro y transiciones suaves.

## 📋 Requisitos Previos

- Python 3.8 o superior
- Pip (Gestor de paquetes de Python)

## 🛠️ Instalación

1.  **Clonar o descargar el proyecto** en tu carpeta local.

2.  **Instalar dependencias**:
    Abre una terminal en la carpeta del proyecto y ejecuta:
    ```bash
    pip install -r requirements.txt
    ```

## ▶️ Ejecución

1.  **Iniciar el servidor**:
    ```bash
    python app.py
    ```
    *Nota: La primera vez que se ejecute, el sistema creará automáticamente la base de datos `database.db` y generará datos de prueba.*

2.  **Acceder a la aplicación**:
    Abre tu navegador web y visita:
    [http://localhost:3000](http://localhost:3000)

## 📖 Guía de Uso Rápido

- **Nuevo Viaje**: Ve a la sección "Viajes" y haz clic en "Nuevo Viaje". Selecciona el destino (Departamentos de Bolivia) y el vehículo.
- **Finalizar Viaje**: En la tarjeta del viaje, haz clic en el botón "Llegó". Se abrirá una ventana para confirmar si la carga llegó correcta y añadir observaciones.
- **Gestión**: Usa los iconos de lápiz y basura en las tablas para editar o eliminar registros.

## 📁 Estructura del Proyecto

- `app.py`: Archivo principal y configuración del backend.
- `templates/index.html`: Interfaz de usuario (Single Page Application).
- `static/`: Estilos CSS y lógica JavaScript.
- `database.db`: Base de datos SQLite (se genera automáticamente).

---
Desarrollado con Flask y JavaScript Vanilla.
