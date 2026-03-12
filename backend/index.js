require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./auth');
const resumenRoutes = require('./routes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/api', resumenRoutes);

// Después
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});