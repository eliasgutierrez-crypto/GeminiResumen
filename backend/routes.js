const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Middleware para verificar token JWT
function authMiddleware(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No autorizado: falta token' });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    console.error('Error verificando token:', err.message);
    res.status(401).json({ error: 'Token inválido' });
  }
}

// Ruta protegida para resumir texto usando Gemini
router.post('/resumir', authMiddleware, async (req, res) => {
  const { texto } = req.body;
  if (!texto) return res.status(400).json({ error: 'No hay texto para resumir' });

  try {
    const respuesta = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
      {
        contents: [
          {
            role: "user",
            parts: [ { text: `Resume el siguiente texto de forma concisa:\n\n${texto}` } ]
          }
        ]
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.GEMINI_API_KEY}`
        }
      }
    );

    const resumen = respuesta.data.candidates?.[0]?.content?.parts?.[0]?.text || 'No se pudo obtener resumen';
    res.json({ resumen });
  } catch (error) {
    console.error('Error llamando a Gemini API:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || 'Error interno al generar resumen'
    });
  }
});

module.exports = router;