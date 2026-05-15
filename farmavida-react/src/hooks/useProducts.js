// ═══════════════════════════════════════════════
//  src/hooks/useProducts.js
// ═══════════════════════════════════════════════

import { useState, useCallback } from 'react';
import { productosApi } from '../api/client';

export function useProducts() {
  const [productos,  setProductos]  = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState(null);

  const loadProductos = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const { ok, data } = await productosApi.getAll(params);
      if (ok) setProductos(data.productos || []);
      else setError(data.error || 'Error al cargar productos.');
    } catch {
      setError('Error de conexión.');
    } finally {
      setLoading(false);
    }
  }, []);

  const createProducto = useCallback(async (payload) => {
    const { ok, data } = await productosApi.create(payload);
    if (!ok) throw new Error(data.error || 'Error al crear producto.');
    return data.producto;
  }, []);

  return { productos, loading, error, loadProductos, createProducto };
}
