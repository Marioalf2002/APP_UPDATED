// ═══════════════════════════════════════════════════════════════
//  FarmaVida API REST — Servidor principal
//  Ejecutar: node server.js
//  Puerto:   3000
// ═══════════════════════════════════════════════════════════════

const express  = require('express');
const jwt      = require('jsonwebtoken');
const bcrypt   = require('bcryptjs');
const cors     = require('cors');
const { v4: uuidv4 } = require('uuid');

const app    = express();
const PORT   = 3000;
const SECRET = 'farmavida_secret_2024';

app.use(cors());
app.use(express.json());

// ── BASE DE DATOS EN MEMORIA ─────────────────────────────────────────────────
let users = [
  {
    id: 'u1',
    nombre: 'Admin FarmaVida',
    email: 'admin@farmavida.com',
    password: bcrypt.hashSync('Admin123!', 8),
    rol: 'admin',
    fechaNacimiento: '1985-05-10',
    telefono: '3001234567',
    direccion: 'Calle 10 # 20-30, Medellín',
    creadoEn: '2024-01-01T00:00:00Z'
  },
  {
    id: 'u2',
    nombre: 'Carlos Farmacéutico',
    email: 'farmaceutico@farmavida.com',
    password: bcrypt.hashSync('Farma123!', 8),
    rol: 'farmaceutico',
    fechaNacimiento: '1990-08-15',
    telefono: '3009876543',
    direccion: 'Carrera 5 # 10-20, Medellín',
    creadoEn: '2024-01-02T00:00:00Z'
  },
  {
    id: 'u3',
    nombre: 'María Cliente',
    email: 'cliente@farmavida.com',
    password: bcrypt.hashSync('Cliente123!', 8),
    rol: 'cliente',
    fechaNacimiento: '1995-03-22',
    telefono: '3011112222',
    direccion: 'Avenida 80 # 45-60, Medellín',
    creadoEn: '2024-01-03T00:00:00Z'
  }
];

let productos = [
  { id: 'p1', nombre: 'Ibuprofeno 400mg',         descripcion: 'Analgésico y antiinflamatorio. Caja 20 tabletas.',    precio: 12500, cantidad: 85, audiencia: 'adultos', creadoEn: '2024-01-01T00:00:00Z' },
  { id: 'p2', nombre: 'Acetaminofén Pediátrico',   descripcion: 'Suspensión oral 150mg/5ml. Frasco 60ml.',             precio: 9800,  cantidad: 42, audiencia: 'ninos',   creadoEn: '2024-01-01T00:00:00Z' },
  { id: 'p3', nombre: 'Vitamina C 1000mg',         descripcion: 'Suplemento antioxidante efervescente. Caja 20 uds.', precio: 18900, cantidad: 120,audiencia: 'adultos', creadoEn: '2024-01-01T00:00:00Z' },
  { id: 'p4', nombre: 'Jarabe para Tos Pediátrico',descripcion: 'Dextrometorfano 7.5mg/5ml. 120ml.',                  precio: 15600, cantidad: 5,  audiencia: 'ninos',   creadoEn: '2024-01-01T00:00:00Z' },
  { id: 'p5', nombre: 'Loratadina 10mg',           descripcion: 'Antihistamínico para alergias. Caja 10 tabletas.',   precio: 8400,  cantidad: 0,  audiencia: 'adultos', creadoEn: '2024-01-01T00:00:00Z' },
  { id: 'p6', nombre: 'Multivitamínico Infantil',  descripcion: 'Gomas masticables 12 vitaminas. Frasco 60 uds.',    precio: 22000, cantidad: 30, audiencia: 'ninos',   creadoEn: '2024-01-01T00:00:00Z' },
];

let carritos = {};   // { userId: [ { productoId, cantidad } ] }
let pedidos  = [];

// ── HELPERS ──────────────────────────────────────────────────────────────────
function calcularEdad(fechaNacimiento) {
  const hoy   = new Date();
  const nac   = new Date(fechaNacimiento);
  let edad    = hoy.getFullYear() - nac.getFullYear();
  const m     = hoy.getMonth() - nac.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
  return edad;
}

function normalizarNombreProducto(nombre) {
  return (nombre || '').trim().toLowerCase();
}

function buscarProductoPorNombre(nombre, excluirId = null) {
  const clave = normalizarNombreProducto(nombre);
  return productos.find(
    p => normalizarNombreProducto(p.nombre) === clave && p.id !== excluirId
  );
}

function validarPassword(password) {
  const reglas = {
    longitud : password.length >= 8,
    mayuscula: /[A-Z]/.test(password),
    minuscula: /[a-z]/.test(password),
    especial : /[!@#$%^&*()\-_=+\[\]{};:'",.<>?/\\|`~]/.test(password),
  };
  const errores = [];
  if (!reglas.longitud)  errores.push('Mínimo 8 caracteres');
  if (!reglas.mayuscula) errores.push('Al menos una letra mayúscula');
  if (!reglas.minuscula) errores.push('Al menos una letra minúscula');
  if (!reglas.especial)  errores.push('Al menos un carácter especial');
  return errores;
}

function precioFinal(producto) {
  return producto.audiencia === 'ninos'
    ? Math.round(producto.precio * 0.85)
    : producto.precio;
}

// ── MIDDLEWARE: Autenticación ─────────────────────────────────────────────────
function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token no proporcionado. Incluye el header: Authorization: Bearer <token>' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido o expirado.' });
  }
}

// ── MIDDLEWARE: Roles ─────────────────────────────────────────────────────────
function requireRol(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({
        error: `Acceso denegado. Se requiere uno de los roles: ${roles.join(', ')}. Tu rol actual es: ${req.user.rol}`
      });
    }
    next();
  };
}

// ════════════════════════════════════════════════════════════════
//  MÓDULO 1 — AUTENTICACIÓN  /auth
// ════════════════════════════════════════════════════════════════

// POST /auth/registro
app.post('/auth/registro', (req, res) => {
  const { nombre, email, password, fechaNacimiento, telefono, direccion } = req.body;

  // Validar campos requeridos
  const camposFaltantes = [];
  if (!nombre)          camposFaltantes.push('nombre');
  if (!email)           camposFaltantes.push('email');
  if (!password)        camposFaltantes.push('password');
  if (!fechaNacimiento) camposFaltantes.push('fechaNacimiento');
  if (camposFaltantes.length) {
    return res.status(400).json({ error: 'Campos requeridos faltantes', campos: camposFaltantes });
  }

  // Validar formato email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Formato de correo electrónico inválido.' });
  }

  // Validar email único
  if (users.find(u => u.email === email)) {
    return res.status(409).json({ error: 'El correo electrónico ya está registrado.' });
  }

  // Validar edad >= 18
  const edad = calcularEdad(fechaNacimiento);
  if (isNaN(edad) || edad < 0) {
    return res.status(400).json({ error: 'Fecha de nacimiento inválida. Formato esperado: YYYY-MM-DD' });
  }
  if (edad < 18) {
    return res.status(400).json({ error: `Debes ser mayor de 18 años para registrarte. Edad detectada: ${edad} años.` });
  }

  // Validar contraseña
  const erroresPassword = validarPassword(password);
  if (erroresPassword.length) {
    return res.status(400).json({ error: 'La contraseña no cumple los requisitos de seguridad.', requisitos: erroresPassword });
  }

  // Crear usuario
  const nuevoUsuario = {
    id: uuidv4(),
    nombre,
    email,
    password: bcrypt.hashSync(password, 8),
    rol: 'cliente',
    fechaNacimiento,
    telefono: telefono || null,
    direccion: direccion || null,
    creadoEn: new Date().toISOString()
  };
  users.push(nuevoUsuario);

  const token = jwt.sign({ id: nuevoUsuario.id, email: nuevoUsuario.email, rol: nuevoUsuario.rol }, SECRET, { expiresIn: '8h' });

  res.status(201).json({
    mensaje: 'Usuario registrado exitosamente.',
    usuario: { id: nuevoUsuario.id, nombre: nuevoUsuario.nombre, email: nuevoUsuario.email, rol: nuevoUsuario.rol },
    token
  });
});

// POST /auth/login
app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email y password son requeridos.' });
  }

  const usuario = users.find(u => u.email === email);
  if (!usuario) {
    return res.status(401).json({ error: 'Credenciales incorrectas.' });
  }

  const passwordValida = bcrypt.compareSync(password, usuario.password);
  if (!passwordValida) {
    return res.status(401).json({ error: 'Credenciales incorrectas.' });
  }

  const token = jwt.sign({ id: usuario.id, email: usuario.email, rol: usuario.rol }, SECRET, { expiresIn: '8h' });

  res.status(200).json({
    mensaje: 'Inicio de sesión exitoso.',
    usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol },
    token
  });
});

// POST /auth/recuperar-password
app.post('/auth/recuperar-password', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'El campo email es requerido.' });

  const usuario = users.find(u => u.email === email);
  // Por seguridad siempre responde igual (no revela si el email existe)
  res.status(200).json({ mensaje: `Si el correo ${email} está registrado, recibirás un enlace de recuperación en los próximos minutos.` });
});

// ════════════════════════════════════════════════════════════════
//  MÓDULO 2 — PERFIL DE USUARIO  /usuarios
// ════════════════════════════════════════════════════════════════

// GET /usuarios/perfil
app.get('/usuarios/perfil', authMiddleware, (req, res) => {
  const usuario = users.find(u => u.id === req.user.id);
  if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado.' });
  const { password, ...perfil } = usuario;
  res.status(200).json({ usuario: perfil });
});

// PUT /usuarios/perfil
app.put('/usuarios/perfil', authMiddleware, (req, res) => {
  const idx = users.findIndex(u => u.id === req.user.id);
  if (idx === -1) return res.status(404).json({ error: 'Usuario no encontrado.' });

  const { nombre, telefono, direccion } = req.body;
  if (!nombre) return res.status(400).json({ error: 'El campo nombre es requerido.' });

  users[idx] = { ...users[idx], nombre, telefono: telefono || users[idx].telefono, direccion: direccion || users[idx].direccion };
  const { password, ...perfil } = users[idx];
  res.status(200).json({ mensaje: 'Perfil actualizado exitosamente.', usuario: perfil });
});

// PUT /usuarios/cambiar-password
app.put('/usuarios/cambiar-password', authMiddleware, (req, res) => {
  const { passwordActual, passwordNueva } = req.body;
  if (!passwordActual || !passwordNueva) {
    return res.status(400).json({ error: 'passwordActual y passwordNueva son requeridos.' });
  }

  const idx = users.findIndex(u => u.id === req.user.id);
  if (!bcrypt.compareSync(passwordActual, users[idx].password)) {
    return res.status(401).json({ error: 'La contraseña actual es incorrecta.' });
  }

  const errores = validarPassword(passwordNueva);
  if (errores.length) return res.status(400).json({ error: 'La nueva contraseña no cumple los requisitos.', requisitos: errores });

  users[idx].password = bcrypt.hashSync(passwordNueva, 8);
  res.status(200).json({ mensaje: 'Contraseña actualizada exitosamente.' });
});

// GET /usuarios — Solo admin
app.get('/usuarios', authMiddleware, requireRol('admin'), (req, res) => {
  const lista = users.map(({ password, ...u }) => u);
  res.status(200).json({ total: lista.length, usuarios: lista });
});

// ════════════════════════════════════════════════════════════════
//  MÓDULO 3 — PRODUCTOS  /productos
// ════════════════════════════════════════════════════════════════

// GET /productos
app.get('/productos', authMiddleware, (req, res) => {
  const { audiencia, buscar } = req.query;
  let lista = [...productos];

  if (audiencia) {
    if (!['adultos','ninos'].includes(audiencia)) {
      return res.status(400).json({ error: 'El parámetro audiencia debe ser "adultos" o "ninos".' });
    }
    lista = lista.filter(p => p.audiencia === audiencia);
  }

  if (buscar) {
    const q = buscar.toLowerCase();
    lista = lista.filter(p => p.nombre.toLowerCase().includes(q) || p.descripcion.toLowerCase().includes(q));
  }

  const listaConDescuento = lista.map(p => ({
    ...p,
    precioFinal: precioFinal(p),
    descuento: p.audiencia === 'ninos' ? '15%' : null
  }));

  res.status(200).json({ total: listaConDescuento.length, productos: listaConDescuento });
});

// GET /productos/:id
app.get('/productos/:id', authMiddleware, (req, res) => {
  const producto = productos.find(p => p.id === req.params.id);
  if (!producto) return res.status(404).json({ error: `Producto con id "${req.params.id}" no encontrado.` });
  res.status(200).json({ producto: { ...producto, precioFinal: precioFinal(producto), descuento: producto.audiencia === 'ninos' ? '15%' : null } });
});

// POST /productos — Admin o Farmacéutico
app.post('/productos', authMiddleware, requireRol('admin', 'farmaceutico'), (req, res) => {
  const { nombre, descripcion, precio, cantidad, audiencia } = req.body;

  const camposFaltantes = [];
  if (!nombre)      camposFaltantes.push('nombre');
  if (!descripcion) camposFaltantes.push('descripcion');
  if (precio === undefined) camposFaltantes.push('precio');
  if (cantidad === undefined) camposFaltantes.push('cantidad');
  if (!audiencia)   camposFaltantes.push('audiencia');
  if (camposFaltantes.length) return res.status(400).json({ error: 'Campos requeridos faltantes.', campos: camposFaltantes });

  if (typeof precio !== 'number' || precio < 0)     return res.status(400).json({ error: 'El precio debe ser un número mayor o igual a 0.' });
  if (typeof cantidad !== 'number' || cantidad < 0 || !Number.isInteger(cantidad)) return res.status(400).json({ error: 'La cantidad debe ser un número entero mayor o igual a 0.' });
  if (!['adultos','ninos'].includes(audiencia))     return res.status(400).json({ error: 'El campo audiencia debe ser "adultos" o "ninos".' });

  const nombreLimpio = nombre.trim();
  const existente = buscarProductoPorNombre(nombreLimpio);
  if (existente) {
    return res.status(409).json({
      error: `Ya existe un producto con el nombre "${existente.nombre}".`,
      productoExistente: { id: existente.id, nombre: existente.nombre },
    });
  }

  const nuevo = { id: uuidv4(), nombre: nombreLimpio, descripcion, precio, cantidad, audiencia, creadoEn: new Date().toISOString() };
  productos.push(nuevo);
  res.status(201).json({ mensaje: 'Producto creado exitosamente.', producto: { ...nuevo, precioFinal: precioFinal(nuevo) } });
});

// PUT /productos/:id — Admin o Farmacéutico
app.put('/productos/:id', authMiddleware, requireRol('admin', 'farmaceutico'), (req, res) => {
  const idx = productos.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: `Producto con id "${req.params.id}" no encontrado.` });

  const { nombre, descripcion, precio, cantidad, audiencia } = req.body;
  if (precio !== undefined && (typeof precio !== 'number' || precio < 0)) return res.status(400).json({ error: 'El precio debe ser un número mayor o igual a 0.' });
  if (cantidad !== undefined && (typeof cantidad !== 'number' || cantidad < 0 || !Number.isInteger(cantidad))) return res.status(400).json({ error: 'La cantidad debe ser un entero mayor o igual a 0.' });
  if (audiencia && !['adultos','ninos'].includes(audiencia)) return res.status(400).json({ error: 'audiencia debe ser "adultos" o "ninos".' });

  if (nombre) {
    const nombreLimpio = nombre.trim();
    const duplicado = buscarProductoPorNombre(nombreLimpio, req.params.id);
    if (duplicado) {
      return res.status(409).json({
        error: `Ya existe un producto con el nombre "${duplicado.nombre}".`,
        productoExistente: { id: duplicado.id, nombre: duplicado.nombre },
      });
    }
    productos[idx] = { ...productos[idx], nombre: nombreLimpio };
  }

  productos[idx] = { ...productos[idx], ...(descripcion && { descripcion }), ...(precio !== undefined && { precio }), ...(cantidad !== undefined && { cantidad }), ...(audiencia && { audiencia }) };
  res.status(200).json({ mensaje: 'Producto actualizado exitosamente.', producto: { ...productos[idx], precioFinal: precioFinal(productos[idx]) } });
});

// DELETE /productos/:id — Solo Admin
app.delete('/productos/:id', authMiddleware, requireRol('admin'), (req, res) => {
  const idx = productos.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: `Producto con id "${req.params.id}" no encontrado.` });
  const eliminado = productos.splice(idx, 1)[0];
  res.status(200).json({ mensaje: `Producto "${eliminado.nombre}" eliminado exitosamente.` });
});

// ════════════════════════════════════════════════════════════════
//  MÓDULO 4 — CARRITO  /carrito
// ════════════════════════════════════════════════════════════════

// GET /carrito
app.get('/carrito', authMiddleware, (req, res) => {
  const items = carritos[req.user.id] || [];
  const detalle = items.map(item => {
    const prod = productos.find(p => p.id === item.productoId);
    if (!prod) return null;
    const fp = precioFinal(prod);
    return { productoId: item.productoId, nombre: prod.nombre, audiencia: prod.audiencia, precioUnitario: fp, cantidad: item.cantidad, subtotal: fp * item.cantidad, descuento: prod.audiencia === 'ninos' ? '15%' : null };
  }).filter(Boolean);

  const total = detalle.reduce((s, i) => s + i.subtotal, 0);
  res.status(200).json({ items: detalle, totalItems: detalle.reduce((s,i) => s + i.cantidad, 0), total });
});

// POST /carrito/agregar
app.post('/carrito/agregar', authMiddleware, (req, res) => {
  const { productoId, cantidad } = req.body;
  if (!productoId || !cantidad) return res.status(400).json({ error: 'productoId y cantidad son requeridos.' });
  if (!Number.isInteger(cantidad) || cantidad <= 0) return res.status(400).json({ error: 'La cantidad debe ser un entero positivo.' });

  const prod = productos.find(p => p.id === productoId);
  if (!prod) return res.status(404).json({ error: `Producto con id "${productoId}" no encontrado.` });
  if (prod.cantidad === 0) return res.status(400).json({ error: `El producto "${prod.nombre}" no tiene stock disponible.` });

  if (!carritos[req.user.id]) carritos[req.user.id] = [];
  const existing = carritos[req.user.id].find(i => i.productoId === productoId);

  const cantidadTotal = (existing ? existing.cantidad : 0) + cantidad;
  if (cantidadTotal > prod.cantidad) return res.status(400).json({ error: `Stock insuficiente. Disponible: ${prod.cantidad}, solicitado: ${cantidadTotal}.` });

  if (existing) existing.cantidad = cantidadTotal;
  else carritos[req.user.id].push({ productoId, cantidad });

  res.status(200).json({ mensaje: 'Producto agregado al carrito.', cantidad: cantidadTotal });
});

// PUT /carrito/actualizar
app.put('/carrito/actualizar', authMiddleware, (req, res) => {
  const { productoId, cantidad } = req.body;
  if (!productoId || cantidad === undefined) return res.status(400).json({ error: 'productoId y cantidad son requeridos.' });
  if (!Number.isInteger(cantidad) || cantidad < 0) return res.status(400).json({ error: 'La cantidad debe ser un entero >= 0.' });

  if (!carritos[req.user.id]) return res.status(404).json({ error: 'El carrito está vacío.' });
  const idx = carritos[req.user.id].findIndex(i => i.productoId === productoId);
  if (idx === -1) return res.status(404).json({ error: 'Producto no encontrado en el carrito.' });

  if (cantidad === 0) {
    carritos[req.user.id].splice(idx, 1);
    return res.status(200).json({ mensaje: 'Producto eliminado del carrito.' });
  }

  const prod = productos.find(p => p.id === productoId);
  if (cantidad > prod.cantidad) return res.status(400).json({ error: `Stock insuficiente. Disponible: ${prod.cantidad}.` });

  carritos[req.user.id][idx].cantidad = cantidad;
  res.status(200).json({ mensaje: 'Cantidad actualizada.', cantidad });
});

// DELETE /carrito/limpiar
app.delete('/carrito/limpiar', authMiddleware, (req, res) => {
  carritos[req.user.id] = [];
  res.status(200).json({ mensaje: 'Carrito vaciado exitosamente.' });
});

// POST /carrito/pago — Sandbox
app.post('/carrito/pago', authMiddleware, (req, res) => {
  const { numeroTarjeta, nombreTitular, fechaExpiracion, cvv } = req.body;

  const camposFaltantes = [];
  if (!numeroTarjeta)    camposFaltantes.push('numeroTarjeta');
  if (!nombreTitular)    camposFaltantes.push('nombreTitular');
  if (!fechaExpiracion)  camposFaltantes.push('fechaExpiracion');
  if (!cvv)              camposFaltantes.push('cvv');
  if (camposFaltantes.length) return res.status(400).json({ error: 'Datos de pago incompletos.', campos: camposFaltantes });

  const items = carritos[req.user.id] || [];
  if (!items.length) return res.status(400).json({ error: 'El carrito está vacío. Agrega productos antes de pagar.' });

  // Tarjetas sandbox
  const tarjetaLimpia = numeroTarjeta.replace(/\s/g, '');
  const sandboxRechazada = ['4000000000000002', '4000000000009995'];
  const sandboxAprobada  = ['4111111111111111', '4242424242424242'];

  if (sandboxRechazada.includes(tarjetaLimpia)) {
    return res.status(402).json({ error: 'Pago rechazado. Fondos insuficientes o tarjeta bloqueada.', codigo: 'CARD_DECLINED' });
  }

  // Validar CVV (3 dígitos)
  if (!/^\d{3,4}$/.test(cvv)) return res.status(400).json({ error: 'CVV inválido. Debe ser 3 o 4 dígitos.' });

  // Validar fecha expiración MM/AA
  const [mes, anio] = (fechaExpiracion || '').split('/');
  const ahora = new Date();
  const expDate = new Date(`20${anio}`, mes - 1);
  if (isNaN(expDate) || expDate < ahora) return res.status(400).json({ error: 'La tarjeta está vencida o la fecha de expiración es inválida. Formato esperado: MM/AA' });

  // Calcular total
  const detalle = items.map(item => {
    const prod = productos.find(p => p.id === item.productoId);
    const fp = precioFinal(prod);
    return { productoId: item.productoId, nombre: prod.nombre, cantidad: item.cantidad, precioUnitario: fp, subtotal: fp * item.cantidad };
  });
  const total = detalle.reduce((s, i) => s + i.subtotal, 0);

  // Crear pedido
  const pedido = {
    id: uuidv4(),
    usuarioId: req.user.id,
    items: detalle,
    total,
    estado: 'pagado',
    fechaPago: new Date().toISOString(),
    ultimosCuatroDigitos: tarjetaLimpia.slice(-4)
  };
  pedidos.push(pedido);
  carritos[req.user.id] = [];

  res.status(200).json({ mensaje: '¡Pago procesado exitosamente!', pedido });
});

// ════════════════════════════════════════════════════════════════
//  MÓDULO 5 — PEDIDOS  /pedidos
// ════════════════════════════════════════════════════════════════

// GET /pedidos — Historial del usuario autenticado
app.get('/pedidos', authMiddleware, (req, res) => {
  const misPedidos = req.user.rol === 'admin'
    ? pedidos
    : pedidos.filter(p => p.usuarioId === req.user.id);
  res.status(200).json({ total: misPedidos.length, pedidos: misPedidos });
});

// GET /pedidos/:id
app.get('/pedidos/:id', authMiddleware, (req, res) => {
  const pedido = pedidos.find(p => p.id === req.params.id);
  if (!pedido) return res.status(404).json({ error: `Pedido "${req.params.id}" no encontrado.` });
  if (req.user.rol !== 'admin' && pedido.usuarioId !== req.user.id) return res.status(403).json({ error: 'No tienes permiso para ver este pedido.' });
  res.status(200).json({ pedido });
});

// ── RUTA RAÍZ ─────────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.status(200).json({
    api: 'FarmaVida API REST',
    version: '1.0.0',
    descripcion: 'API para actividad de pruebas QA',
    endpoints: {
      auth    : ['POST /auth/registro', 'POST /auth/login', 'POST /auth/recuperar-password'],
      usuarios: ['GET /usuarios/perfil', 'PUT /usuarios/perfil', 'PUT /usuarios/cambiar-password', 'GET /usuarios (admin)'],
      productos: ['GET /productos', 'GET /productos/:id', 'POST /productos', 'PUT /productos/:id', 'DELETE /productos/:id'],
      carrito : ['GET /carrito', 'POST /carrito/agregar', 'PUT /carrito/actualizar', 'DELETE /carrito/limpiar', 'POST /carrito/pago'],
      pedidos : ['GET /pedidos', 'GET /pedidos/:id'],
    },
    usuariosDePrueba: [
      { email: 'admin@farmavida.com',        password: 'Admin123!',   rol: 'admin' },
      { email: 'farmaceutico@farmavida.com', password: 'Farma123!',   rol: 'farmaceutico' },
      { email: 'cliente@farmavida.com',      password: 'Cliente123!', rol: 'cliente' },
    ],
    tarjetasSandbox: {
      aprobadas : ['4111 1111 1111 1111', '4242 4242 4242 4242'],
      rechazadas: ['4000 0000 0000 0002', '4000 0000 0000 9995'],
    }
  });
});

// ── 404 y manejo global de errores ───────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Ruta "${req.method} ${req.path}" no encontrada.` });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor.', detalle: err.message });
});

// ── INICIAR SERVIDOR ─────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🟢  FarmaVida API corriendo en http://localhost:${PORT}`);
  console.log(`📋  Visita http://localhost:${PORT} para ver todos los endpoints\n`);
});
