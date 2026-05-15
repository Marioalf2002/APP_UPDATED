// ═══════════════════════════════════════════════
//  src/components/Topbar.jsx
// ═══════════════════════════════════════════════

import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { getInitials } from '../utils/formatters';

export default function Topbar({ onNavigate }) {
  const { user, logout } = useAuth();
  const { totalItems, toggleCart } = useCart();

  return (
    <header style={{
      background: 'var(--bg2)', borderBottom: '1px solid var(--border)',
      height: 54, display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', padding: '0 1.5rem',
      position: 'sticky', top: 0, zIndex: 200,
    }}>
      <div style={{ fontFamily: 'var(--font-disp)', fontSize: 19, fontWeight: 800, letterSpacing: '-.03em', color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 8 }}>
        FarmaVida
        <span style={{ color: 'var(--text2)', fontWeight: 400, fontSize: 13, letterSpacing: 0 }}>Sistema Farmacéutico</span>
      </div>

      {user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Cart pill */}
          <button onClick={toggleCart} style={{
            background: 'var(--surface)', border: '1px solid var(--border-md)',
            borderRadius: 20, padding: '5px 12px 5px 10px',
            display: 'flex', alignItems: 'center', gap: 7,
            fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'background .15s',
            color: 'var(--text)',
          }}>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth={2}>
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            Carrito
            <span style={{
              background: 'var(--green)', color: '#000', fontSize: 10, fontWeight: 700,
              minWidth: 18, height: 18, borderRadius: 9, display: 'flex', alignItems: 'center',
              justifyContent: 'center', padding: '0 4px',
            }}>{totalItems}</span>
          </button>

          {/* User pill */}
          <button onClick={() => onNavigate('perfil')} style={{
            background: 'var(--surface)', border: '1px solid var(--border-md)',
            borderRadius: 20, padding: '4px 12px 4px 4px',
            display: 'flex', alignItems: 'center', gap: 8,
            fontSize: 12, cursor: 'pointer', transition: 'background .15s', color: 'var(--text)',
          }}>
            <div style={{
              width: 26, height: 26, borderRadius: '50%',
              background: 'var(--green-dim)', color: 'var(--green)',
              fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{getInitials(user.nombre)}</div>
            {user.nombre.split(' ')[0]}
          </button>

          <button onClick={logout} style={{
            background: 'none', border: 'none', color: 'var(--text3)',
            fontSize: 12, padding: '4px 8px', borderRadius: 6, transition: 'color .15s', cursor: 'pointer',
          }}>Salir</button>
        </div>
      )}
    </header>
  );
}
