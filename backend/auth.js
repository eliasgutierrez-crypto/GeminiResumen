const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const router = express.Router();

// Usuarios en memoria (para pruebas, luego se puede reemplazar con DB)
const usuarios = [];

// Registro
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Faltan datos' });

  const existe = usuarios.find(u => u.username === username);
  if (existe) return res.status(400).json({ error: 'Usuario ya existe' });

  const hashed = await bcrypt.hash(password, 10);
  usuarios.push({ username, password: hashed });
  res.json({ message: 'Usuario registrado correctamente' });
});

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = usuarios.find(u => u.username === username);
  if (!user) return res.status(400).json({ error: 'Usuario no existe' });

  const valido = await bcrypt.compare(password, user.password);
  if (!valido) return res.status(400).json({ error: 'Contraseña incorrecta' });

  const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '2h' });
  res.json({ token });
});

module.exports = router;