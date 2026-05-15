// ═══════════════════════════════════════════════
//  src/api/client.js
//  Capa de comunicación con la API REST
// ═══════════════════════════════════════════════

const BASE_URL = 'http://localhost:3000';

function getToken() {
  return localStorage.getItem('fv_token');
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json();
  return { ok: response.ok, status: response.status, data };
}

// ── AUTH ─────────────────────────────────────────────────
export const authApi = {
  login:    (email, password)  => request('/auth/login',            { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (payload)          => request('/auth/registro',         { method: 'POST', body: JSON.stringify(payload) }),
  recover:  (email)            => request('/auth/recuperar-password',{ method: 'POST', body: JSON.stringify({ email }) }),
};

// ── USUARIOS ─────────────────────────────────────────────
export const usuariosApi = {
  getPerfil:        ()        => request('/usuarios/perfil'),
  updatePerfil:     (payload) => request('/usuarios/perfil',           { method: 'PUT', body: JSON.stringify(payload) }),
  changePassword:   (payload) => request('/usuarios/cambiar-password', { method: 'PUT', body: JSON.stringify(payload) }),
  getAll:           ()        => request('/usuarios'),
};

// ── PRODUCTOS ─────────────────────────────────────────────
export const productosApi = {
  getAll:    (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/productos${qs ? '?' + qs : ''}`);
  },
  getById:   (id)      => request(`/productos/${id}`),
  create:    (payload) => request('/productos',     { method: 'POST',   body: JSON.stringify(payload) }),
  update:    (id, payload) => request(`/productos/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  remove:    (id)      => request(`/productos/${id}`, { method: 'DELETE' }),
};

// ── CARRITO ───────────────────────────────────────────────
export const carritoApi = {
  get:       ()        => request('/carrito'),
  agregar:   (payload) => request('/carrito/agregar',    { method: 'POST',   body: JSON.stringify(payload) }),
  actualizar:(payload) => request('/carrito/actualizar', { method: 'PUT',    body: JSON.stringify(payload) }),
  limpiar:   ()        => request('/carrito/limpiar',    { method: 'DELETE' }),
  pagar:     (payload) => request('/carrito/pago',       { method: 'POST',   body: JSON.stringify(payload) }),
};

// ── PEDIDOS ───────────────────────────────────────────────
export const pedidosApi = {
  getAll:  ()   => request('/pedidos'),
  getById: (id) => request(`/pedidos/${id}`),
};
