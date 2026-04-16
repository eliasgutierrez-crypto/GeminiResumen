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
    console.log(' Iniciando llamada a Gemini API...');
    console.log(' Texto a resumir longitud:', texto.length);
    console.log(' API Key configurada:', process.env.GEMINI_API_KEY ? 'Sí' : 'No');
    console.log(' Endpoint:', 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-pro:generateContent');
    console.log(' Modelo:', 'gemini-1.5-flash');
    
    const respuesta = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: `Resume el siguiente texto:\n\n${texto}`
              }
            ]
          }
        ]
      },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    console.log(' Respuesta exitosa de Gemini API');
    console.log(' Status:', respuesta.status);
    console.log(' Candidates:', respuesta.data.candidates?.length || 0);
    const resumen = respuesta.data.candidates?.[0]?.content?.parts?.[0]?.text || 'No se pudo obtener resumen';
    console.log(' Resumen generado, longitud:', resumen.length);
    console.log(' Resumen:', resumen.substring(0, 100) + '...');
    res.json({ resumen });
    
  } catch (error) {
    console.error(' Error detallado llamando a Gemini API:');
    console.error(' Status:', error.response?.status);
    console.error(' Status Text:', error.response?.statusText);
    console.error(' Response Data:', JSON.stringify(error.response?.data, null, 2));
    console.error(' Error Message:', error.message);
    console.error(' Error Code:', error.code);
    console.error(' Full Error:', error);
    
    res.status(error.response?.status || 500).json({ 
      error: 'Error interno al generar resumen',
      detalle: error.response?.data || error.message 
    });
  }
});

module.exports = router;