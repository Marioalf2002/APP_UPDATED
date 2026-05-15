// ═══════════════════════════════════════════════
//  src/utils/validators.js
// ═══════════════════════════════════════════════

export const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const getAge = (dob) => {
  const today = new Date();
  const birth = new Date(dob);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
};

export const checkPasswordRules = (password) => ({
  len:     password.length >= 8,
  upper:   /[A-Z]/.test(password),
  lower:   /[a-z]/.test(password),
  special: /[!@#$%^&*()\-_=+[\]{};:'",.<>?/\\|`~]/.test(password),
});

export const allRulesPass = (rules) =>
  Object.values(rules).every(Boolean);

export const PERMISOS_MATRIX = [
  { label: 'Ver inventario',         admin: true,  farma: true,  cliente: true  },
  { label: 'Agregar productos',       admin: true,  farma: true,  cliente: false },
  { label: 'Editar productos',        admin: true,  farma: true,  cliente: false },
  { label: 'Eliminar productos',      admin: true,  farma: false, cliente: false },
  { label: 'Ver todos los usuarios',  admin: true,  farma: false, cliente: false },
  { label: 'Gestionar carrito',       admin: true,  farma: true,  cliente: true  },
  { label: 'Procesar pagos',          admin: true,  farma: true,  cliente: true  },
  { label: 'Ver su perfil',           admin: true,  farma: true,  cliente: true  },
  { label: 'Cambiar contraseña',      admin: true,  farma: true,  cliente: true  },
  { label: 'Ver panel de permisos',   admin: true,  farma: false, cliente: false },
];

export const ROL_TAG = {
  admin:        'tag-purple',
  farmaceutico: 'tag-blue',
  cliente:      'tag-green',
};
