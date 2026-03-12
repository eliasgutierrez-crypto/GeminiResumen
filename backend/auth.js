const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const pool = require('./db');

const router = express.Router();

// Registro

router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    console.error('Registro: Faltan datos', { username, password });
    return res.status(400).json({ error: 'Faltan datos' });
  }

  try {
    const existe = await pool.query('SELECT * FROM usuarios WHERE username = $1', [username]);
    if (existe.rows.length > 0) {
      console.error('Registro: Usuario ya existe', username);
      return res.status(400).json({ error: 'Usuario ya existe' });
    }

    const hashed = await bcrypt.hash(password, 10);
    await pool.query('INSERT INTO usuarios (username, password) VALUES ($1, $2)', [username, hashed]);
    res.json({ message: 'Usuario registrado correctamente' });
  } catch (err) {
    console.error('Error en registro:', err);
    res.status(500).json({ error: 'Error en el servidor al registrar usuario', detalle: err.message });
  }
});

// Login

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    console.error('Login: Faltan datos', { username, password });
    return res.status(400).json({ error: 'Faltan datos' });
  }

  try {
    const userRes = await pool.query('SELECT * FROM usuarios WHERE username = $1', [username]);
    if (userRes.rows.length === 0) {
      console.error('Login: Usuario no existe', username);
      return res.status(400).json({ error: 'Usuario no existe' });
    }

    const user = userRes.rows[0];
    const valido = await bcrypt.compare(password, user.password);
    if (!valido) {
      console.error('Login: Contraseña incorrecta', username);
      return res.status(400).json({ error: 'Contraseña incorrecta' });
    }

    if (!process.env.JWT_SECRET) {
      console.error('Login: JWT_SECRET no está definido en variables de entorno');
      return res.status(500).json({ error: 'Configuración del servidor incompleta (JWT_SECRET)' });
    }

    const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '2h' });
    res.json({ token });
  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ error: 'Error en el servidor al iniciar sesión', detalle: err.message });
  }
});

module.exports = router;