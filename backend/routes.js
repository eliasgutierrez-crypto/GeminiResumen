const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const router = express.Router();

// Cache simple en memoria para resúmenes (hash del texto -> resumen)
const cache = new Map();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutos

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

// Función para generar hash del texto para cache
function generarHash(texto) {
  return crypto.createHash('md5').update(texto).digest('hex');
}

// Función para limpiar cache antiguo
function limpiarCache() {
  const ahora = Date.now();
  for (const [hash, item] of cache.entries()) {
    if (ahora - item.timestamp > CACHE_TTL) {
      cache.delete(hash);
    }
  }
}

// Función para truncar texto si es muy largo (optimización de cuota)
function optimizarTexto(texto) {
  const MAX_CARACTERES = 8000; // Límite para optimizar cuota
  
  if (texto.length <= MAX_CARACTERES) {
    return texto;
  }
  
  // Truncar manteniendo frases completas
  const truncado = texto.substring(0, MAX_CARACTERES);
  const ultimaPuntuacion = Math.max(
    truncado.lastIndexOf('.'),
    truncado.lastIndexOf('!'),
    truncado.lastIndexOf('?')
  );
  
  if (ultimaPuntuacion > MAX_CARACTERES * 0.8) {
    return truncado.substring(0, ultimaPuntuacion + 1) + '\n\n[Texto truncado para optimizar procesamiento]';
  }
  
  return truncado + '...';
}

// Ruta protegida para resumir texto usando Gemini optimizado
router.post('/resumir', authMiddleware, async (req, res) => {
  const { texto } = req.body;
  if (!texto) return res.status(400).json({ error: 'No hay texto para resumir' });

  // Validar longitud mínima
  if (texto.trim().length < 50) {
    return res.status(400).json({ error: 'El texto debe tener al menos 50 caracteres' });
  }

  // Limpiar cache antiguo
  limpiarCache();

  // Generar hash del texto
  const textoHash = generarHash(texto);
  
  // Verificar cache
  const cacheItem = cache.get(textoHash);
  if (cacheItem && (Date.now() - cacheItem.timestamp < CACHE_TTL)) {
    console.log('Resumen obtenido desde cache');
    return res.json({ resumen: cacheItem.resumen, desdeCache: true });
  }

  try {
    // Optimizar texto para reducir cuota
    const textoOptimizado = optimizarTexto(texto);
    
    // Prompt optimizado para ser más eficiente
    const promptOptimizado = `Resume este texto en 3-5 frases clave, enfocándote en la información más importante:\n\n${textoOptimizado}`;

    const respuesta = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
      {
        model: "gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: promptOptimizado
          }
        ],
        max_tokens: 150, // Limitar tokens para optimizar cuota
        temperature: 0.3 // Menos aleatoriedad para respuestas más consistentes
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.GEMINI_API_KEY}`
        },
        timeout: 15000 // Timeout para evitar consumos innecesarios
      }
    );

    const resumen = respuesta.data.choices?.[0]?.message?.content || 'No se pudo obtener resumen';
    
    // Guardar en cache
    cache.set(textoHash, {
      resumen,
      timestamp: Date.now()
    });
    
    console.log(`Resumen generado y cacheado. Cache size: ${cache.size}`);
    res.json({ resumen, desdeCache: false });
    
  } catch (error) {
    console.error('Error llamando a Gemini API:', error.response?.data || error.message);
    
    // Manejar errores específicos de cuota
    if (error.response?.status === 429) {
      return res.status(429).json({ 
        error: 'Límite de cuota excedido. Por favor, intenta más tarde.' 
      });
    }
    
    if (error.code === 'ECONNABORTED') {
      return res.status(408).json({ 
        error: 'Timeout en la solicitud. Intenta con un texto más corto.' 
      });
    }
    
    res.status(error.response?.status || 500).json({
      error: error.response?.data || 'Error interno al generar resumen'
    });
  }
});

// Ruta para obtener estadísticas del cache (opcional)
router.get('/cache-stats', authMiddleware, (req, res) => {
  limpiarCache();
  res.json({
    cacheSize: cache.size,
    ttlMinutes: CACHE_TTL / (60 * 1000)
  });
});

module.exports = router;