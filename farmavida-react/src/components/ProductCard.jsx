// ═══════════════════════════════════════════════
//  src/components/ProductCard.jsx
// ═══════════════════════════════════════════════

import { useCart }  from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { fmt }      from '../utils/formatters';

export default function ProductCard({ producto }) {
  const { addItem, cart } = useCart();
  const { showToast }     = useToast();

  const inCart   = cart.find((c) => c.id === producto.id);
  const isKids   = producto.audiencia === 'ninos';
  const fp       = producto.precioFinal || producto.precio;
  const noStock  = producto.cantidad === 0;

  const dotColor = noStock
    ? 'var(--red)'
    : producto.cantidad < 10
    ? 'var(--amber)'
    : 'var(--green)';

  const stockTxt = noStock
    ? 'Sin stock'
    : producto.cantidad < 10
    ? `Bajo stock (${producto.cantidad})`
    : `${producto.cantidad} unidades`;

  const handleAdd = () => {
    if (noStock) return;
    if (inCart && inCart.qty >= producto.cantidad) {
      showToast('No hay más unidades disponibles.', 'error');
      return;
    }
    addItem(producto);
    showToast(`"${producto.nombre}" agregado al carrito.`, 'success');
  };

  return (
    <div style={{
      background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)',
      padding: '1.1rem', display: 'flex', flexDirection: 'column', gap: 10,
      transition: 'border-color .15s, transform .15s',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.35, flex: 1 }}>{producto.nombre}</span>
        <span className={`tag ${isKids ? 'tag-kids' : 'tag-green'}`}>{isKids ? 'Niños' : 'Adultos'}</span>
      </div>

      <p style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.5, flex: 1 }}>{producto.descripcion}</p>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 7 }}>
        <span style={{ fontFamily: 'var(--font-disp)', fontSize: 20, fontWeight: 700, color: 'var(--green)' }}>{fmt(fp)}</span>
        {isKids && <>
          <span style={{ fontSize: 12, color: 'var(--text3)', textDecoration: 'line-through' }}>{fmt(producto.precio)}</span>
          <span className="tag tag-kids" style={{ fontSize: 10 }}>-15%</span>
        </>}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text2)' }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: dotColor, flexShrink: 0 }} />
        {stockTxt}
        {inCart && <span style={{ color: 'var(--text3)' }}> · {inCart.qty} en carrito</span>}
      </div>

      <button
        disabled={noStock}
        onClick={handleAdd}
        style={{
          width: '100%', fontSize: 12, fontWeight: 600, padding: 8,
          borderRadius: 'var(--r)', border: '1px solid rgba(74,222,128,.2)',
          background: 'var(--green-bg)', color: 'var(--green)',
          cursor: noStock ? 'not-allowed' : 'pointer', opacity: noStock ? .35 : 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          transition: 'background .15s',
        }}
      >
        <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
        </svg>
        {noStock ? 'Sin stock' : 'Agregar al carrito'}
      </button>
    </div>
  );
}
