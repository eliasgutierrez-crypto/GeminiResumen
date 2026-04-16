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
    res.status(401).json({ error: 'Token inválido' });
  }
}

// Ruta protegida para resumir texto usando Gemini
router.post('/resumir', authMiddleware, async (req, res) => {
  const { texto } = req.body;
  if (!texto) return res.status(400).json({ error: 'No hay texto para resumir' });

  try {
    const respuesta = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
      {
        model: "gemini-pro",
        messages: [
          {
            role: "user",
            content: `Resume el siguiente texto:\n\n${texto}`
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

    const resumen = respuesta.data.choices?.[0]?.message?.content || 'No se pudo obtener resumen';
    res.json({ resumen });
    
  } catch (error) {
    console.error('Error llamando a Gemini API:', error.message);
    res.status(500).json({ error: 'Error interno al generar resumen' });
  }
});

module.exports = router;