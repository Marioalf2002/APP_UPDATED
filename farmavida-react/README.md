# 🟢 FarmaVida — React App

Aplicación frontend del sistema FarmaVida construida con **React + Vite**.  
Requiere la **API REST** corriendo en `http://localhost:3000`.

---

## 📋 Requisitos

- Node.js v16 o superior
- La API de FarmaVida corriendo (`node server.js` en `farmavida-api/`)

---

## 🚀 Instalación y ejecución

```bash
# 1. Entra a la carpeta
cd farmavida-react

# 2. Instala dependencias
npm install

# 3. Inicia la app
npm run dev
```

La app estará en: **http://localhost:5173**

> ⚠️ Asegúrate de tener la API corriendo en `http://localhost:3000` antes de abrir la app.

---

## 🗂️ Estructura del proyecto

```
farmavida-react/
├── index.html
├── vite.config.js
├── package.json
└── src/
    ├── main.jsx              ← Punto de entrada
    ├── App.jsx               ← Componente raíz + navegación
    ├── index.css             ← Estilos globales y variables CSS
    │
    ├── api/
    │   └── client.js         ← Capa HTTP (fetch wrapper + endpoints)
    │
    ├── context/
    │   ├── AuthContext.jsx   ← Estado global de autenticación
    │   ├── CartContext.jsx   ← Estado global del carrito
    │   └── ToastContext.jsx  ← Notificaciones globales
    │
    ├── hooks/
    │   └── useProducts.js    ← Hook para carga y gestión de productos
    │
    ├── pages/
    │   ├── LoginPage.jsx          ← Inicio de sesión
    │   ├── RegisterPage.jsx       ← Registro de usuario
    │   ├── DashboardPage.jsx      ← Layout principal con sidebar
    │   ├── InventarioPage.jsx     ← Catálogo de productos
    │   ├── RegistroProductoPage.jsx ← Formulario de nuevo producto
    │   ├── PagoPage.jsx           ← Pasarela de pago sandbox
    │   ├── PerfilPage.jsx         ← Perfil y cambio de contraseña
    │   └── PermisosPage.jsx       ← Roles, permisos y lista de usuarios
    │
    ├── components/
    │   ├── Topbar.jsx        ← Barra superior de navegación
    │   ├── Sidebar.jsx       ← Menú lateral
    │   ├── CartPanel.jsx     ← Panel deslizante del carrito
    │   └── ProductCard.jsx   ← Tarjeta de producto individual
    │
    └── utils/
        ├── formatters.js     ← fmt(), getInitials(), fmtCardNumber()...
        └── validators.js     ← isValidEmail(), getAge(), PERMISOS_MATRIX...
```

---

## 👥 Usuarios de prueba

| Email                          | Password      | Rol           |
|-------------------------------|---------------|---------------|
| admin@farmavida.com            | Admin123!     | admin         |
| farmaceutico@farmavida.com     | Farma123!     | farmaceutico  |
| cliente@farmavida.com          | Cliente123!   | cliente       |

---

## 💳 Tarjetas sandbox

| Número                   | Resultado   |
|--------------------------|-------------|
| 4111 1111 1111 1111      | ✅ Aprobada  |
| 4242 4242 4242 4242      | ✅ Aprobada  |
| 4000 0000 0000 0002      | ❌ Rechazada |
| 4000 0000 0000 9995      | ❌ Rechazada |

CVV: cualquier número | Fecha: fecha futura (ej: 12/28)

---

## 🐛 Bugs insertados (actividad QA)

| # | Módulo | Archivo | Descripción |
|---|--------|---------|-------------|
| **Bug 1** | Login | `AuthContext.jsx` + `LoginPage.jsx` | `login()` llama a `authApi.loginSession()` que no existe. El botón principal nunca autentica. |
| **Bug 2** | Pasarela de pago | `PagoPage.jsx` | Campo CVV tiene `maxLength={2}` en lugar de `4`. No permite ingresar 3 dígitos. |
| **Bug 3** | Perfil | `PerfilPage.jsx` | `handleChangePassword()` lee `passNueva` (undefined) pero el state se llama `passNuevo`. |
| **Bug 4** | Permisos | `PermisosPage.jsx` | `p.clientes` (con 's') en lugar de `p.cliente` → todos los permisos del Cliente aparecen denegados. |
| **Bug 5** | Inventario | `InventarioPage.jsx` | Búsqueda en descripción usa `.includes(search)` sin `.toLowerCase()` → case-sensitive. |
