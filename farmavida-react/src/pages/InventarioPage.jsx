// ═══════════════════════════════════════════════
//  src/pages/InventarioPage.jsx
// ═══════════════════════════════════════════════

import { useState, useEffect, useMemo } from 'react';
import { useProducts }  from '../hooks/useProducts';
import ProductCard      from '../components/ProductCard';

export default function InventarioPage() {
  const { productos, loading, loadProductos } = useProducts();
  const [search, setSearch]   = useState('');
  const [filter, setFilter]   = useState('all');

  useEffect(() => { loadProductos(); }, [loadProductos]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return productos.filter(p => {
      const matchFilter = filter === 'all' || p.audiencia === filter;
      const matchSearch = p.nombre.toLowerCase().includes(q) || p.descripcion.toLowerCase().includes(q);
      return matchFilter && matchSearch;
    });
  }, [productos, search, filter]);

  const metrics = useMemo(() => ({
    total:     productos.length,
    ninos:     productos.filter(p => p.audiencia === 'ninos').length,
    bajo:      productos.filter(p => p.cantidad > 0 && p.cantidad < 10).length,
    sinStock:  productos.filter(p => p.cantidad === 0).length,
  }), [productos]);

  const filterBtns = [
    { key: 'all',     label: 'Todos'   },
    { key: 'adultos', label: 'Adultos' },
    { key: 'ninos',   label: 'Niños'   },
  ];

  return (
    <div>
      <h1 className="pg-title">Inventario</h1>
      <p className="pg-sub">Productos disponibles en FarmaVida.</p>

      {/* Métricas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 12, marginBottom: '1.5rem' }}>
        {[
          { label: 'Total productos',   val: metrics.total,    color: 'var(--text)'  },
          { label: 'Productos niños',   val: metrics.ninos,    color: 'var(--kids)'  },
          { label: 'Bajo stock',        val: metrics.bajo,     color: 'var(--amber)' },
          { label: 'Sin stock',         val: metrics.sinStock, color: 'var(--red)'   },
        ].map(m => (
          <div key={m.label} className="card" style={{ padding: '1rem 1.25rem' }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text2)', marginBottom: 6 }}>{m.label}</div>
            <div style={{ fontFamily: 'var(--font-disp)', fontSize: 28, fontWeight: 700, color: m.color }}>{m.val}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'var(--surface)', border: '1px solid var(--border-md)', borderRadius: 'var(--r)', padding: '7px 12px', flex: 1, minWidth: 160 }}>
          <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth={2}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text)', fontSize: 13, width: '100%' }}
            placeholder="Buscar producto..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {filterBtns.map(b => (
          <button key={b.key}
            onClick={() => setFilter(b.key)}
            style={{
              fontSize: 12, fontWeight: 600, padding: '7px 14px', borderRadius: 'var(--r)',
              border: '1px solid var(--border-md)', cursor: 'pointer', transition: 'background .12s',
              background: filter === b.key ? 'var(--green-bg)' : 'var(--surface)',
              color: filter === b.key ? 'var(--green)' : 'var(--text2)',
              borderColor: filter === b.key ? 'rgba(74,222,128,.2)' : 'var(--border-md)',
            }}>
            {b.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text3)' }}>Cargando productos...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text3)' }}>No se encontraron productos.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 12 }}>
          {filtered.map(p => <ProductCard key={p.id} producto={p} />)}
        </div>
      )}
    </div>
  );
}
