require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./auth');
const resumenRoutes = require('./routes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas API
app.use('/auth', authRoutes);
app.use('/api', resumenRoutes);

// Servir frontend estático desde public/
app.use(express.static(path.join(__dirname, 'public')));

// Catch-all: cualquier otra ruta devuelve index.html (para SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Puerto dinámico para Render
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});