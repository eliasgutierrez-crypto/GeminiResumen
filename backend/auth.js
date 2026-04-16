const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const pool = require('./db');

const router = express.Router();

// Ruta para registrar usuario
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Faltan datos' });
  }
  try {
    const userRes = await pool.query('SELECT * FROM usuarios WHERE username = $1', [username]);
    if (userRes.rows.length > 0) {
      return res.status(400).json({ error: 'Usuario ya existe' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query('INSERT INTO usuarios (username, password) VALUES ($1, $2)', [username, hashedPassword]);
    res.json({ message: 'Usuario creado exitosamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor al registrar usuario' });
  }
});

// Ruta para login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Faltan datos' });
  }
  try {
    const userRes = await pool.query('SELECT * FROM usuarios WHERE username = $1', [username]);
    if (userRes.rows.length === 0) {
      return res.status(400).json({ error: 'Usuario no existe' });
    }
    const user = userRes.rows[0];
    const valido = await bcrypt.compare(password, user.password);
    if (!valido) {
      return res.status(400).json({ error: 'Contraseña incorrecta' });
    }
    const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '2h' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor al iniciar sesión' });
  }
});

module.exports = router;