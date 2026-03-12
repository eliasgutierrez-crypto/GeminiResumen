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

// Catch-all: SPA
app.get(/^\/(?!api|auth).*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Puerto dinámico
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));