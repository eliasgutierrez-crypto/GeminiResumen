var userToken = localStorage.getItem('token') || '';

// ======= FUNCIONES UTILITARIAS =======
function mostrarLoading(button, textoOriginal) {
  button.disabled = true;
  button.innerHTML = `
    <span class="loading-spinner mr-2"></span>
    Procesando...
  `;
  return textoOriginal;
}

function restaurarButton(button, textoOriginal) {
  button.disabled = false;
  button.innerHTML = textoOriginal;
}

function mostrarError(mensaje) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message animate-fade-in';
  errorDiv.innerHTML = `
    <div class="flex items-center">
      <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
      </svg>
      ${mensaje}
    </div>
  `;
  
  // Remover errores anteriores
  const erroresAnteriores = document.querySelectorAll('.error-message');
  erroresAnteriores.forEach(err => err.remove());
  
  // Insertar nuevo error
  const form = document.querySelector('form');
  if (form) {
    form.parentNode.insertBefore(errorDiv, form.nextSibling);
  }
  
  // Auto-eliminar después de 5 segundos
  setTimeout(() => {
    errorDiv.remove();
  }, 5000);
}

function mostrarExito(mensaje) {
  const successDiv = document.createElement('div');
  successDiv.className = 'success-message animate-fade-in';
  successDiv.innerHTML = `
    <div class="flex items-center">
      <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
      </svg>
      ${mensaje}
    </div>
  `;
  
  // Remover mensajes anteriores
  const mensajesAnteriores = document.querySelectorAll('.success-message');
  mensajesAnteriores.forEach(msg => msg.remove());
  
  // Insertar nuevo mensaje
  const form = document.querySelector('form');
  if (form) {
    form.parentNode.insertBefore(successDiv, form.nextSibling);
  }
  
  // Auto-eliminar después de 3 segundos
  setTimeout(() => {
    successDiv.remove();
  }, 3000);
}

// ======= LOGIN FORM =======
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    const textoOriginal = submitBtn.innerHTML;

    if (!username || !password) {
      mostrarError('Por favor, ingresa usuario y contraseña');
      return;
    }

    mostrarLoading(submitBtn, textoOriginal);

    try {
      const res = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      if (data.token) {
        userToken = data.token;
        localStorage.setItem('token', userToken);
        mostrarExito('¡Inicio de sesión exitoso!');
        setTimeout(() => {
          window.location.href = 'dashboard.html';
        }, 1000);
      } else {
        mostrarError(data.error || 'Error al iniciar sesión');
      }
    } catch (error) {
      mostrarError('Error de conexión. Intenta nuevamente.');
    } finally {
      restaurarButton(submitBtn, textoOriginal);
    }
  });
}

// ======= REGISTER FORM =======
const registerBtn = document.getElementById('btnRegister');
if (registerBtn) {
  registerBtn.addEventListener('click', async () => {
    const username = document.getElementById('regUsername')?.value;
    const password = document.getElementById('regPassword')?.value;
    const textoOriginal = registerBtn.innerHTML;

    if (!username || !password) {
      mostrarError('Por favor, ingresa usuario y contraseña');
      return;
    }

    if (password.length < 6) {
      mostrarError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    mostrarLoading(registerBtn, textoOriginal);

    try {
      const res = await fetch('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      if (data.message) {
        mostrarExito(data.message);
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 2000);
      } else {
        mostrarError(data.error || 'Error al registrarse');
      }
    } catch (error) {
      mostrarError('Error de conexión. Intenta nuevamente.');
    } finally {
      restaurarButton(registerBtn, textoOriginal);
    }
  });
}

// ======= DASHBOARD =======
const resumirBtn = document.getElementById('resumirBtn');
const logoutBtn = document.getElementById('logoutBtn');
const resultadoDiv = document.getElementById('resultado');
const resultadoContainer = document.getElementById('resultadoContainer');
const textoTextarea = document.getElementById('texto');
const charCount = document.getElementById('charCount');

// Redirigir si no hay token
if (resumirBtn && !userToken) {
  window.location.href = 'index.html';
}

// Contador de caracteres
if (charCount && textoTextarea) {
  textoTextarea.addEventListener('input', () => {
    const count = textoTextarea.value.length;
    charCount.textContent = count;
    
    // Cambiar color según longitud
    if (count > 8000) {
      charCount.className = 'text-red-500 font-semibold';
    } else if (count > 5000) {
      charCount.className = 'text-yellow-500 font-semibold';
    } else {
      charCount.className = 'text-gray-500';
    }
  });
}

// Resumir texto
if (resumirBtn) {
  resumirBtn.addEventListener('click', async () => {
    const texto = textoTextarea?.value;
    if (!texto) {
      mostrarError('Por favor, ingresa un texto para resumir');
      return;
    }

    if (texto.trim().length < 50) {
      mostrarError('El texto debe tener al menos 50 caracteres');
      return;
    }

    const textoOriginal = resumirBtn.innerHTML;
    mostrarLoading(resumirBtn, textoOriginal);

    // Mostrar estado de carga en resultados
    resultadoContainer.classList.add('has-content');
    resultadoDiv.innerHTML = `
      <div class="flex items-center justify-center py-8">
        <div class="text-center">
          <div class="loading-spinner mx-auto mb-4"></div>
          <p class="text-gray-600">Generando resumen...</p>
          <p class="text-sm text-gray-500 mt-2">Esto puede tomar unos segundos</p>
        </div>
      </div>
    `;

    try {
      const res = await fetch('/api/resumir', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({ texto })
      });

      const data = await res.json();
      
      if (data.resumen) {
        resultadoContainer.classList.add('has-content');
        const cacheBadge = data.desdeCache ? 
          '<span class="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full ml-2">Desde cache</span>' : '';
        
        resultadoDiv.innerHTML = `
          <div class="space-y-4">
            <div class="flex items-start justify-between">
              <p class="text-gray-700 leading-relaxed flex-1">${data.resumen}</p>
              ${cacheBadge}
            </div>
            <div class="flex items-center space-x-2 pt-4 border-t border-gray-200">
              <button onclick="copiarResumen('${data.resumen.replace(/'/g, "\\'")}')" class="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-lg transition flex items-center space-x-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                </svg>
                <span>Copiar</span>
              </button>
              <button onclick="limpiarResultado()" class="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-lg transition flex items-center space-x-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
                <span>Limpiar</span>
              </button>
            </div>
          </div>
        `;
      } else {
        let errorMsg = data.error;
        if (typeof errorMsg !== 'string') {
          errorMsg = JSON.stringify(errorMsg);
        }
        
        // Manejar errores específicos
        if (errorMsg.toLowerCase().includes('cuota')) {
          mostrarError('Límite de cuota excedido. Intenta más tarde.');
        } else if (errorMsg.toLowerCase().includes('timeout')) {
          mostrarError('Timeout. Intenta con un texto más corto.');
        } else if (
          errorMsg.toLowerCase().includes('no autorizado') ||
          errorMsg.toLowerCase().includes('token inválido') ||
          errorMsg.toLowerCase().includes('falta token')
        ) {
          localStorage.removeItem('token');
          mostrarError('Sesión expirada. Inicia sesión nuevamente.');
          setTimeout(() => {
            window.location.href = 'index.html';
          }, 2000);
          return;
        } else {
          mostrarError(errorMsg || 'Error al generar resumen');
        }
        
        resultadoDiv.innerHTML = `<p class="text-red-600">Error: ${errorMsg}</p>`;
      }
    } catch (error) {
      mostrarError('Error de conexión. Intenta nuevamente.');
      resultadoDiv.innerHTML = `<p class="text-red-600">Error de conexión</p>`;
    } finally {
      restaurarButton(resumirBtn, textoOriginal);
    }
  });
}

// Funciones auxiliares para el dashboard
function copiarResumen(texto) {
  navigator.clipboard.writeText(texto).then(() => {
    mostrarExito('¡Resumen copiado al portapapeles!');
  }).catch(() => {
    mostrarError('No se pudo copiar el resumen');
  });
}

function limpiarResultado() {
  resultadoContainer.classList.remove('has-content');
  resultadoDiv.innerHTML = `<p class="text-gray-500 italic">Espera el resumen después de hacer clic en "Resumir"...</p>`;
}

// Logout
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
  });
}