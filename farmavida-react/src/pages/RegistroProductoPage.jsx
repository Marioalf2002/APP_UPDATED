// ═══════════════════════════════════════════════
//  src/pages/RegistroProductoPage.jsx
// ═══════════════════════════════════════════════

import { useState }     from 'react';
import { useProducts }  from '../hooks/useProducts';
import { useToast }     from '../context/ToastContext';

export default function RegistroProductoPage({ onNavigate }) {
  const { createProducto } = useProducts();
  const { showToast }      = useToast();
  const [form, setForm]    = useState({ nombre: '', descripcion: '', precio: '', cantidad: '', audiencia: '' });
  const [loading, setLoading] = useState(false);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    const nombre = form.nombre.trim();
    const { descripcion, precio, cantidad, audiencia } = form;
    if (!nombre || !descripcion || precio === '' || cantidad === '' || !audiencia) {
      showToast('Completa todos los campos.', 'error'); return;
    }
    const p = parseFloat(precio), c = parseInt(cantidad);
    if (isNaN(p) || p < 0) { showToast('El precio debe ser mayor o igual a 0.', 'error'); return; }
    if (isNaN(c) || c < 0) { showToast('La cantidad debe ser mayor o igual a 0.', 'error'); return; }
    setLoading(true);
    try {
      await createProducto({ nombre, descripcion, precio: p, cantidad: c, audiencia });
      showToast(`"${nombre}" registrado exitosamente.`, 'success');
      setForm({ nombre: '', descripcion: '', precio: '', cantidad: '', audiencia: '' });
      onNavigate('inventario');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="pg-title">Nuevo producto</h1>
      <p className="pg-sub">Agrega un producto al inventario.</p>
      <div className="card">
        <div className="card-hd"><span className="card-title">Datos del producto</span></div>
        <div className="card-body">
          <div className="form-grid">
            <div className="field full"><label>Nombre *</label><input className="inp" placeholder="Ej: Ibuprofeno 400mg" value={form.nombre} onChange={set('nombre')} /></div>
            <div className="field full"><label>Descripción *</label><textarea className="inp" rows={3} placeholder="Composición, presentación..." value={form.descripcion} onChange={set('descripcion')} /></div>
            <div className="field"><label>Precio (COP) *</label><input className="inp" type="number" min={0} placeholder="0" value={form.precio} onChange={set('precio')} /></div>
            <div className="field"><label>Cantidad *</label><input className="inp" type="number" min={0} placeholder="0" value={form.cantidad} onChange={set('cantidad')} /></div>
            <div className="field full">
              <label>Audiencia *</label>
              <select className="inp" value={form.audiencia} onChange={set('audiencia')}>
                <option value="">Selecciona</option>
                <option value="adultos">Adultos</option>
                <option value="ninos">Niños</option>
              </select>
              {form.audiencia === 'ninos' && (
                <div style={{ background: 'var(--kids-bg)', border: '1px solid rgba(244,114,182,.2)', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: 'var(--kids)', marginTop: 6 }}>
                  Los productos para niños aplican <strong>15% de descuento</strong> automáticamente.
                </div>
              )}
            </div>
          </div>
          <div className="form-actions">
            <button className="btn" onClick={() => setForm({ nombre:'',descripcion:'',precio:'',cantidad:'',audiencia:'' })}>Limpiar</button>
            <button className="btn btn-green" onClick={handleSubmit} disabled={loading}>{loading ? 'Guardando...' : 'Guardar producto'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
