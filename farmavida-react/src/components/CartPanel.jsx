// ═══════════════════════════════════════════════
//  src/components/CartPanel.jsx
// ═══════════════════════════════════════════════

import { useCart } from '../context/CartContext';
import { fmt }     from '../utils/formatters';

export default function CartPanel({ onCheckout }) {
  const { cart, isOpen, closeCart, toggleCart, removeItem, changeQty, totals } = useCart();

  return (
    <>
      {/* Overlay */}
      <div onClick={closeCart} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)',
        zIndex: 300, opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? 'all' : 'none',
        transition: 'opacity .25s',
      }} />

      {/* Panel */}
      <div style={{
        position: 'fixed', top: 0, right: 0, width: 360, maxWidth: '100vw', height: '100vh',
        background: 'var(--bg2)', borderLeft: '1px solid var(--border)',
        boxShadow: 'var(--shadow-lg)', zIndex: 400,
        display: 'flex', flexDirection: 'column',
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform .3s ease',
      }}>
        {/* Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: 'var(--font-disp)', fontSize: 17, fontWeight: 700 }}>Carrito de compras</span>
          <button onClick={closeCart} style={{ background: 'none', border: 'none', color: 'var(--text3)', display: 'flex', cursor: 'pointer', padding: 4, borderRadius: 6 }}>
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.5rem' }}>
          {cart.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 200, color: 'var(--text3)', gap: 10, fontSize: 13 }}>
              <svg width={40} height={40} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              El carrito está vacío
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} style={{ background: 'var(--surface)', borderRadius: 'var(--r)', padding: '.85rem', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 500, flex: 1, lineHeight: 1.35 }}>
                    {item.nombre}
                    {item.audiencia === 'ninos' && <span className="tag tag-kids" style={{ marginLeft: 6, fontSize: 10 }}>-15%</span>}
                  </span>
                  <button onClick={() => removeItem(item.id)} style={{ background: 'none', border: 'none', color: 'var(--text3)', display: 'flex', cursor: 'pointer', transition: 'color .12s' }}>
                    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
                      <path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                    </svg>
                  </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--green)' }}>{fmt(item.precio * item.qty)}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    {[[-1,'−'],[+1,'+']].map(([d, label], i) => (
                      i === 0 ? (
                        <button key={d} onClick={() => changeQty(item.id, d)} style={{ width: 24, height: 24, borderRadius: 6, border: '1px solid var(--border-md)', background: 'var(--surface2)', color: 'var(--text)', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>{label}</button>
                      ) : null
                    ))}
                    <span style={{ fontSize: 13, fontWeight: 600, minWidth: 20, textAlign: 'center', fontFamily: 'var(--mono)' }}>{item.qty}</span>
                    <button onClick={() => changeQty(item.id, +1)} style={{ width: 24, height: 24, borderRadius: 6, border: '1px solid var(--border-md)', background: 'var(--surface2)', color: 'var(--text)', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>+</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text2)' }}>
                <span>Subtotal</span><span>{fmt(totals.subtotal + totals.discount)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--kids)' }}>
                <span>Descuento niños</span><span>-{fmt(totals.discount)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 700, borderTop: '1px solid var(--border)', paddingTop: 8 }}>
                <span>Total</span><span style={{ color: 'var(--green)' }}>{fmt(totals.subtotal)}</span>
              </div>
            </div>
            <button className="btn btn-green btn-full" onClick={() => { closeCart(); onCheckout(); }}>
              Ir a pagar →
            </button>
          </div>
        )}
      </div>
    </>
  );
}
