# 🟢 FarmaVida API REST

API REST para la actividad de pruebas QA. Incluye autenticación JWT, roles, gestión de productos, carrito de compras y pasarela de pago sandbox.

---

## 📋 Requisitos previos

- [Node.js](https://nodejs.org/) v16 o superior
- [Postman](https://www.postman.com/downloads/) (para ejecutar la colección)

---

## 🚀 Instalación y ejecución

```bash
# 1. Entra a la carpeta del proyecto
cd farmavida-api

# 2. Instala las dependencias
npm install

# 3. Inicia el servidor
node server.js
```

El servidor quedará corriendo en: **http://localhost:3000**

Visita http://localhost:3000 en tu navegador para ver todos los endpoints disponibles.

---

## 📬 Importar colección en Postman

1. Abre **Postman**
2. Clic en **Import** (botón superior izquierdo)
3. Selecciona el archivo `FarmaVida.postman_collection.json`
4. La colección aparecerá en tu panel izquierdo

### Orden de ejecución recomendado:
1. **🏠 Estado de la API** — verifica que el servidor esté corriendo
2. **🔐 Auth → Login Admin** — ejecuta primero para obtener el token
3. **🔐 Auth → Login Farmacéutico** — guarda el token de farmacéutico
4. **🔐 Auth → Login Cliente** — guarda el token de cliente
5. El resto de carpetas ya usan los tokens guardados automáticamente

---

## 👥 Usuarios de prueba

| Email                          | Password      | Rol           |
|-------------------------------|---------------|---------------|
| admin@farmavida.com            | Admin123!     | admin         |
| farmaceutico@farmavida.com     | Farma123!     | farmaceutico  |
| cliente@farmavida.com          | Cliente123!   | cliente       |

---

## 💳 Tarjetas sandbox para pagos

| Número                   | Resultado   |
|--------------------------|-------------|
| 4111 1111 1111 1111      | ✅ Aprobada  |
| 4242 4242 4242 4242      | ✅ Aprobada  |
| 4000 0000 0000 0002      | ❌ Rechazada |
| 4000 0000 0000 9995      | ❌ Rechazada |

> CVV: cualquier 3 dígitos (ej: 123) | Fecha: cualquier fecha futura (ej: 12/28)

---

## 🗂️ Endpoints disponibles

### 🔐 Auth
| Método | Endpoint                    | Auth | Descripción                  |
|--------|-----------------------------|------|------------------------------|
| POST   | /auth/registro              | No   | Registrar nuevo usuario       |
| POST   | /auth/login                 | No   | Iniciar sesión (obtener token)|
| POST   | /auth/recuperar-password    | No   | Solicitar recuperación        |

### 👤 Usuarios
| Método | Endpoint                    | Auth | Rol requerido |
|--------|-----------------------------|------|---------------|
| GET    | /usuarios/perfil            | Sí   | Cualquiera    |
| PUT    | /usuarios/perfil            | Sí   | Cualquiera    |
| PUT    | /usuarios/cambiar-password  | Sí   | Cualquiera    |
| GET    | /usuarios                   | Sí   | admin         |

### 💊 Productos
| Método | Endpoint          | Auth | Rol requerido         |
|--------|-------------------|------|-----------------------|
| GET    | /productos        | Sí   | Cualquiera            |
| GET    | /productos/:id    | Sí   | Cualquiera            |
| POST   | /productos        | Sí   | admin, farmaceutico   |
| PUT    | /productos/:id    | Sí   | admin, farmaceutico   |
| DELETE | /productos/:id    | Sí   | admin                 |

### 🛒 Carrito
| Método | Endpoint              | Auth | Descripción             |
|--------|-----------------------|------|-------------------------|
| GET    | /carrito              | Sí   | Ver carrito             |
| POST   | /carrito/agregar      | Sí   | Agregar producto        |
| PUT    | /carrito/actualizar   | Sí   | Cambiar cantidad        |
| DELETE | /carrito/limpiar      | Sí   | Vaciar carrito          |
| POST   | /carrito/pago         | Sí   | Procesar pago (sandbox) |

### 📦 Pedidos
| Método | Endpoint      | Auth | Descripción              |
|--------|---------------|------|--------------------------|
| GET    | /pedidos      | Sí   | Mis pedidos (o todos si admin) |
| GET    | /pedidos/:id  | Sí   | Ver detalle de un pedido |

---

## 🔑 Autenticación

Todos los endpoints protegidos requieren el token JWT en el header:

```
Authorization: Bearer <tu_token_aqui>
```

El token se obtiene haciendo login y expira en **8 horas**.

---

## 📦 Estructura del proyecto

```
farmavida-api/
├── server.js                          ← Servidor principal (toda la API)
├── package.json                       ← Dependencias
├── FarmaVida.postman_collection.json  ← Colección Postman lista para importar
└── README.md                          ← Este archivo
```

---

## 🧪 Casos de prueba incluidos en la colección

La colección incluye **30+ casos de prueba** con assertions automáticas:

- ✅ Casos positivos (flujo feliz)
- ❌ Casos negativos (datos inválidos, campos vacíos)
- 🔒 Casos de seguridad (sin token, token inválido, rol incorrecto)
- 💳 Casos sandbox (tarjeta aprobada, rechazada, vencida)
- 🔍 Casos de límite (ID inexistente, carrito vacío, stock insuficiente)
