// ═══════════════════════════════════════════════
//  src/utils/formatters.js
// ═══════════════════════════════════════════════

export const fmt = (n) =>
  '$' + Math.round(n).toLocaleString('es-CO');

export const getInitials = (name = '') =>
  name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

export const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('es-CO');

export const fmtCardNumber = (value) => {
  const clean = value.replace(/\D/g, '').slice(0, 16);
  return clean.match(/.{1,4}/g)?.join(' ') || clean;
};

export const fmtExpiry = (value) => {
  const clean = value.replace(/\D/g, '').slice(0, 4);
  return clean.length > 2 ? clean.slice(0, 2) + '/' + clean.slice(2) : clean;
};
