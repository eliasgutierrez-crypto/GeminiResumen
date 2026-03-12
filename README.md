# GeminiResumen - Guía de Despliegue en Render

## Requisitos

- Node.js 18 o superior
- Cuenta en [Render](https://render.com/)
- Cuenta en [Google AI Studio](https://aistudio.google.com/app/apikey) para obtener tu API Key de Gemini
- Una base de datos PostgreSQL (Render puede crearla por ti)

## Pasos para desplegar en Render

### 1. Clona este repositorio

```
git clone https://github.com/tuusuario/GeminiResumen.git
cd GeminiResumen/backend
```

### 2. Crea un nuevo servicio web en Render

1. Ve a tu panel de Render y haz clic en "New Web Service".
2. Conecta tu repositorio de GitHub.
3. Elige la carpeta `backend` como raíz del proyecto.
4. En "Build Command" pon:
	```
	npm install
	```
5. En "Start Command" pon:
	```
	npm start
	```

### 3. Configura las variables de entorno en Render

Agrega las siguientes variables en la sección "Environment":

- `PORT` (ejemplo: 10000 o déjalo vacío para el puerto por defecto)
- `GEMINI_API_KEY` (tu clave de Gemini de Google AI Studio)
- `JWT_SECRET` (elige una cadena secreta segura)
- `DATABASE_URL` (la URL de tu base de datos PostgreSQL de Render)

### 4. Crea el servicio de base de datos (si no tienes uno)

1. En Render, crea un nuevo servicio de PostgreSQL.
2. Copia la URL de conexión y pégala en la variable `DATABASE_URL` de tu servicio web.

### 5. Despliega el proyecto

Render instalará dependencias y levantará el servidor automáticamente.
La tabla `usuarios` se creará automáticamente al iniciar el backend.

### 6. Accede a la app

Abre la URL pública que Render te da para tu servicio web. Podrás:
- Registrarte
- Iniciar sesión
- Resumir textos usando Gemini

---

### Notas
- Si cambias la API Key de Gemini, actualízala en Render y reinicia el servicio.
- Si tienes problemas con la base de datos, revisa los logs en Render.
- Para desarrollo local, crea un archivo `.env` en la carpeta `backend` con las mismas variables.

---
¡Listo! Tu app estará funcionando en la nube 🚀
