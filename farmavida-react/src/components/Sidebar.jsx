// ═══════════════════════════════════════════════
//  src/components/Sidebar.jsx
// ═══════════════════════════════════════════════

import { useAuth }  from '../context/AuthContext';
import { useCart }  from '../context/CartContext';

const SBItem = ({ icon, label, active, onClick, badge }) => (
  <div onClick={onClick} style={{
    display: 'flex', alignItems: 'center', gap: 9,
    padding: '7px 10px', borderRadius: 8,
    fontSize: 13, cursor: 'pointer',
    color: active ? 'var(--green)' : 'var(--text2)',
    background: active ? 'var(--green-bg)' : 'transparent',
    transition: 'background .12s, color .12s',
  }}>
    <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
      dangerouslySetInnerHTML={{ __html: icon }} />
    {label}
    {badge !== undefined && (
      <span style={{
        marginLeft: 'auto', background: 'var(--green)', color: '#000',
        fontSize: 10, fontWeight: 700, minWidth: 18, height: 18,
        borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px',
      }}>{badge}</span>
    )}
  </div>
);

const SBSection = ({ label }) => (
  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--text3)', padding: '10px 8px 4px' }}>
    {label}
  </div>
);

export default function Sidebar({ active, onNavigate }) {
  const { user }        = useAuth();
  const { totalItems, toggleCart } = useCart();

  const isAdmin = user?.rol === 'admin';
  const isFarma = user?.rol === 'farmaceutico';

  return (
    <aside style={{
      width: 200, flexShrink: 0,
      background: 'var(--bg2)', borderRight: '1px solid var(--border)',
      padding: '.75rem', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto',
    }}>
      <SBSection label="Principal" />
      <SBItem label="Inventario"      active={active==='inventario'}    onClick={() => onNavigate('inventario')}
        icon='<path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>' />

      {(isAdmin || isFarma) && (
        <SBItem label="Nuevo producto" active={active==='registro-prod'} onClick={() => onNavigate('registro-prod')}
          icon='<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>' />
      )}

      <SBSection label="Compras" />
      <SBItem label="Carrito" active={false} onClick={toggleCart} badge={totalItems}
        icon='<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>' />
      <SBItem label="Pago"    active={active==='pago'}        onClick={() => onNavigate('pago')}
        icon='<rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>' />

      <SBSection label="Cuenta" />
      <SBItem label="Mi perfil" active={active==='perfil'}   onClick={() => onNavigate('perfil')}
        icon='<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>' />

      {isAdmin && (
        <SBItem label="Permisos" active={active==='permisos'} onClick={() => onNavigate('permisos')}
          icon='<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>' />
      )}
    </aside>
  );
}
