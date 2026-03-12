// Guardar token
let token = localStorage.getItem('token') || '';

// Registro
document.getElementById('btnRegister')?.addEventListener('click', async () => {
  const username = document.getElementById('regUsername').value;
  const password = document.getElementById('regPassword').value;

  const res = await fetch('http://localhost:3000/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();
  alert(data.message || data.error);
});

// Login
document.getElementById('btnLogin')?.addEventListener('click', async () => {
  const username = document.getElementById('loginUsername').value;
  const password = document.getElementById('loginPassword').value;

  const res = await fetch('http://localhost:3000/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();
  if (data.token) {
    token = data.token;
    localStorage.setItem('token', token);
    window.location.href = 'dashboard.html';
  } else {
    alert(data.error);
  }
});

// Resumir texto
document.getElementById('btnResumen')?.addEventListener('click', async () => {
  const texto = document.getElementById('texto').value;
  if (!texto) return alert('Ingresa un texto');

  const res = await fetch('http://localhost:3000/api/resumir', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ texto })
  });

  const data = await res.json();
  document.getElementById('resultado').textContent = data.resumen || data.error;
});

// Logout
document.getElementById('btnLogout')?.addEventListener('click', () => {
  localStorage.removeItem('token');
  window.location.href = 'index.html';
});