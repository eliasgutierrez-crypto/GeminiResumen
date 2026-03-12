require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');


const pool = require('./db');
const authRoutes = require('./auth');
const resumenRoutes = require('./routes');

const app = express();

// Crear tabla usuarios si no existe
async function ensureUsuariosTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password TEXT NOT NULL
      )
    `);
    console.log('Tabla usuarios verificada/creada');
  } catch (err) {
    console.error('Error creando/verificando tabla usuarios:', err);
  }
}

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas API
app.use('/auth', authRoutes);
app.use('/api', resumenRoutes);

// Servir frontend estático desde public/
app.use(express.static(path.join(__dirname, 'public')));

// Catch-all: cualquier otra ruta devuelve index.html (para SPA)
app.get(/^\/(?!api|auth).*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Puerto dinámico para Render
const PORT = process.env.PORT || 3000;

ensureUsuariosTable().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
});