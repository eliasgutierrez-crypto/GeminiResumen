var userToken = localStorage.getItem('token') || '';

// ======= LOGIN FORM =======
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (!username || !password) return alert('Ingresa usuario y contraseña');

    const res = await fetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    if (data.token) {
      userToken = data.token;
      localStorage.setItem('token', userToken);
      window.location.href = 'dashboard.html';
    } else {
      alert(data.error);
    }
  });
}

// ======= REGISTER FORM =======
const registerBtn = document.getElementById('btnRegister');
if (registerBtn) {
  registerBtn.addEventListener('click', async () => {
    const username = document.getElementById('regUsername')?.value;
    const password = document.getElementById('regPassword')?.value;

    if (!username || !password) return alert('Ingresa usuario y contraseña');

    const res = await fetch('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    alert(data.message || data.error);
  });
}

// ======= DASHBOARD =======
const resumirBtn = document.getElementById('resumirBtn');
const logoutBtn = document.getElementById('logoutBtn');
const resultadoDiv = document.getElementById('resultado');

// Redirigir si no hay token
if (resumirBtn && !userToken) window.location.href = 'index.html';

// Resumir texto
if (resumirBtn) {
  resumirBtn.addEventListener('click', async () => {
    const texto = document.getElementById('texto').value;
    if (!texto) return alert('Ingresa un texto');

    const res = await fetch('/api/resumir', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({ texto })
    });

        const data = await res.json();
        let errorMsg = data.error;
        if (typeof errorMsg !== 'string') {
          errorMsg = JSON.stringify(errorMsg);
        }
        // Solo cerrar sesión si el error es de JWT local, no si es de Gemini
        if (
          errorMsg &&
          (errorMsg.toLowerCase().includes('no autorizado') ||
           errorMsg.toLowerCase().includes('token inválido') ||
           errorMsg.toLowerCase().includes('falta token'))
        ) {
          localStorage.removeItem('token');
          alert('Sesión expirada o token inválido. Por favor, inicia sesión de nuevo.');
          window.location.href = 'index.html';
          return;
        }
        // Si el error es de Gemini (UNAUTHENTICATED o authentication credentials), mostrar mensaje pero no cerrar sesión
        if (
          errorMsg &&
          (errorMsg.toLowerCase().includes('authentication credential') ||
           errorMsg.toLowerCase().includes('unauthenticated'))
        ) {
          resultadoDiv.innerHTML = `<p class=\"text-red-600 font-bold\">Error de autenticación con Gemini API. Revisa tu API Key.</p>`;
          return;
        }
        resultadoDiv.innerHTML = `<p class=\"text-gray-700\">${data.resumen || errorMsg}</p>`;
  });
}

// Logout
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
  });
}