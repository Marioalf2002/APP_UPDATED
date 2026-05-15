// ═══════════════════════════════════════════════
//  src/pages/PagoPage.jsx
// ═══════════════════════════════════════════════

import { useState }    from 'react';
import { useCart }     from '../context/CartContext';
import { useToast }    from '../context/ToastContext';
import { carritoApi }  from '../api/client';
import { fmt, fmtCardNumber, fmtExpiry } from '../utils/formatters';

const SANDBOX_CARDS = [
  { num: '4111 1111 1111 1111', exp: '12/28', cvv: '123', label: '✅ 4111 1111 1111 1111', ok: true },
  { num: '4242 4242 4242 4242', exp: '12/28', cvv: '321', label: '✅ 4242 4242 4242 4242', ok: true },
  { num: '4000 0000 0000 0002', exp: '12/28', cvv: '000', label: '❌ 4000 0000 0000 0002', ok: false },
  { num: '4000 0000 0000 9995', exp: '12/28', cvv: '000', label: '❌ 4000 0000 0000 9995', ok: false },
];

export default function PagoPage({ onNavigate }) {
  const { cart, totals, clearCart } = useCart();
  const { showToast } = useToast();

  const [cardNum,  setCardNum]  = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExp,  setCardExp]  = useState('');
  const [cardCvv,  setCardCvv]  = useState('');
  const [loading,  setLoading]  = useState(false);

  const fillCard = (c) => { setCardNum(c.num); setCardName('TITULAR PRUEBA'); setCardExp(c.exp); setCardCvv(c.cvv); };

  const handlePago = async () => {
    if (!cardNum || !cardName || !cardExp || !cardCvv) { showToast('Completa todos los datos de la tarjeta.', 'error'); return; }
    if (!cart.length) { showToast('El carrito está vacío.', 'error'); return; }
    setLoading(true);
    try {
      for (const item of cart) {
        await carritoApi.agregar({ productoId: item.id, cantidad: item.qty });
      }
      const { ok, data } = await carritoApi.pagar({
        numeroTarjeta: cardNum, nombreTitular: cardName, fechaExpiracion: cardExp, cvv: cardCvv,
      });
      if (!ok) { showToast(data.error || 'Pago rechazado.', 'error'); return; }
      clearCart();
      showToast('¡Pago procesado exitosamente! 🎉', 'success');
      onNavigate('inventario');
    } catch { showToast('Error de conexión.', 'error'); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <h1 className="pg-title">Pasarela de Pago</h1>
      <p className="pg-sub">Completa tu compra de forma segura.</p>
      <div style={{ maxWidth: 500, margin: '0 auto' }}>

        {/* Card visual */}
        <div style={{ background: 'linear-gradient(135deg,var(--green-dim),#0f4d2a)', borderRadius: 14, padding: '1.5rem', marginBottom: '1.5rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -30, right: -30, width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,.05)' }} />
          <div style={{ width: 36, height: 28, background: 'linear-gradient(135deg,#d4a853,#a07830)', borderRadius: 5, marginBottom: 16 }} />
          <div style={{ fontFamily: 'var(--mono)', fontSize: 17, letterSpacing: '.15em', marginBottom: 14, color: '#fff' }}>
            {cardNum || '•••• •••• •••• ••••'}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(255,255,255,.7)' }}>
            <div><div style={{ fontSize: 9, opacity: .6, marginBottom: 2 }}>TITULAR</div>{(cardName || 'NOMBRE TITULAR').toUpperCase()}</div>
            <div><div style={{ fontSize: 9, opacity: .6, marginBottom: 2 }}>VENCE</div>{cardExp || 'MM/AA'}</div>
          </div>
        </div>

        <p style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 8 }}>Tarjetas sandbox de prueba:</p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: '1rem' }}>
          {SANDBOX_CARDS.map(c => (
            <button key={c.num} onClick={() => fillCard(c)} style={{
              fontSize: 11, padding: '4px 10px', borderRadius: 6, fontFamily: 'var(--mono)',
              border: `1px solid ${c.ok ? 'rgba(74,222,128,.3)' : 'rgba(248,113,113,.3)'}`,
              background: c.ok ? 'var(--green-bg)' : 'var(--red-bg)',
              color: c.ok ? 'var(--green)' : 'var(--red)', cursor: 'pointer',
            }}>{c.label}</button>
          ))}
        </div>

        <div className="card">
          <div className="card-body">
            <div className="form-grid">
              <div className="field full">
                <label>Número de tarjeta</label>
                <input className="inp" placeholder="1234 5678 9012 3456" value={cardNum} maxLength={19}
                  onChange={e => setCardNum(fmtCardNumber(e.target.value))} />
              </div>
              <div className="field full">
                <label>Nombre del titular</label>
                <input className="inp" placeholder="Como aparece en la tarjeta" value={cardName} onChange={e => setCardName(e.target.value)} />
              </div>
              <div className="field">
                <label>Fecha de expiración (MM/AA)</label>
                <input className="inp" placeholder="12/28" maxLength={5} value={cardExp} onChange={e => setCardExp(fmtExpiry(e.target.value))} />
              </div>
              <div className="field">
                <label>CVV</label>
                <input className="inp" placeholder="123" maxLength={4} type="password" value={cardCvv} onChange={e => setCardCvv(e.target.value)} />
              </div>
            </div>

            {/* Resumen */}
            {cart.length > 0 && (
              <div style={{ background: 'var(--surface)', borderRadius: 'var(--r)', padding: '.85rem', margin: '1rem 0' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 8 }}>RESUMEN DEL PEDIDO</div>
                {cart.map(c => (
                  <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                    <span>{c.nombre} ×{c.qty}</span><span>{fmt(c.precio * c.qty)}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 700, borderTop: '1px solid var(--border)', paddingTop: 8, marginTop: 6 }}>
                  <span>Total</span><span style={{ color: 'var(--green)' }}>{fmt(totals.subtotal)}</span>
                </div>
              </div>
            )}

            {cart.length === 0 && (
              <div style={{ color: 'var(--red)', fontSize: 13, marginBottom: '1rem' }}>⚠️ Tu carrito está vacío.</div>
            )}

            <div className="form-actions" style={{ paddingTop: 0, borderTop: 'none', marginTop: 0 }}>
              <button className="btn btn-green btn-full" onClick={handlePago} disabled={loading || cart.length === 0}>
                {loading ? 'Procesando...' : '💳 Pagar ahora'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
