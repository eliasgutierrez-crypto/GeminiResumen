const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Middleware para verificar token JWT
function authMiddleware(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No autorizado: falta token' });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' });
  }
}

// Ruta protegida para resumir texto usando Gemini
router.post('/resumir', authMiddleware, async (req, res) => {
  const { texto } = req.body;

  if (!texto) {
    return res.status(400).json({ error: 'No hay texto para resumir' });
  }

  try {
    console.log('Iniciando llamada a Gemini API...');
    console.log('Longitud del texto:', texto.length);
    console.log('API Key configurada:', process.env.GEMINI_API_KEY ? 'Sí' : 'No');

    const endpoint = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent';

    console.log('Endpoint:', endpoint);
    console.log('Modelo:', 'gemini-2.0-flash');

    const respuesta = await axios.post(
      `${endpoint}?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: `Resume el siguiente texto de forma clara y concisa:\n\n${texto}`
              }
            ]
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000 // evita que se quede colgado
      }
    );

    console.log('Respuesta exitosa');
    console.log('Status:', respuesta.status);

    const resumen =
      respuesta.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      'No se pudo obtener el resumen';

    console.log('Resumen generado (primeros 100 chars):', resumen.substring(0, 100) + '...');

    res.json({ resumen });

  } catch (error) {
    console.error('Error llamando a Gemini API:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('Message:', error.message);

    res.status(error.response?.status || 500).json({
      error: 'Error interno al generar resumen',
      detalle: error.response?.data || error.message
    });
  }
});

module.exports = router;