// ═══════════════════════════════════════════════
//  src/pages/PermisosPage.jsx
// ═══════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { useToast }     from '../context/ToastContext';
import { usuariosApi }  from '../api/client';
import { useAuth }      from '../context/AuthContext';
import { PERMISOS_MATRIX, ROL_TAG } from '../utils/validators';
import { formatDate }   from '../utils/formatters';

const PermCheck = ({ on }) => (
  <div style={{
    width: 14, height: 14, borderRadius: 3,
    border: `1.5px solid ${on ? 'var(--green)' : 'var(--border-md)'}`,
    background: on ? 'var(--green)' : 'transparent',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  }}>
    {on && <span style={{ fontSize: 9, color: '#000', fontWeight: 700 }}>✓</span>}
  </div>
);

const RoleCard = ({ title, tag, perms, roleKey }) => (
  <div className="card" style={{ padding: '1.1rem' }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
      <span style={{ fontSize: 13, fontWeight: 600 }}>{title}</span>
      <span className={`tag ${tag}`}>{roleKey}</span>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {perms.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text2)' }}>
          <PermCheck on={p.allowed} />
          {p.label}
        </div>
      ))}
    </div>
  </div>
);

export default function PermisosPage() {
  const { user }        = useAuth();
  const { showToast }   = useToast();
  const [usuarios, setUsuarios] = useState([]);
  const [loading,  setLoading]  = useState(false);

  const cargarUsuarios = async () => {
    setLoading(true);
    try {
      const { ok, data } = await usuariosApi.getAll();
      if (ok) setUsuarios(data.usuarios || []);
      else showToast(data.error || 'Error al cargar usuarios.', 'error');
    } catch { showToast('Error de conexión.', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { cargarUsuarios(); }, []);

  // BUG 4: se usa 'clientes' (con 's') en lugar de 'cliente'
  // → todos los permisos del rol Cliente aparecen como denegados (false)
  const adminPerms   = PERMISOS_MATRIX.map(p => ({ label: p.label, allowed: p.admin   }));
  const farmaPerms   = PERMISOS_MATRIX.map(p => ({ label: p.label, allowed: p.farma   }));
  const clientePerms = PERMISOS_MATRIX.map(p => ({ label: p.label, allowed: p.clientes })); // BUG 4

  return (
    <div>
      <h1 className="pg-title">Permisos de usuarios</h1>
      <p className="pg-sub">Matriz de roles y accesos del sistema.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: '1.5rem' }}>
        <RoleCard title="Administrador" tag="tag-purple" perms={adminPerms}   roleKey="admin"        />
        <RoleCard title="Farmacéutico"  tag="tag-blue"   perms={farmaPerms}   roleKey="farmaceutico" />
        <RoleCard title="Cliente"       tag="tag-green"  perms={clientePerms} roleKey="cliente"      />
      </div>

      <div className="card">
        <div className="card-hd">
          <span className="card-title">Usuarios registrados</span>
          <button className="btn" onClick={cargarUsuarios} style={{ fontSize: 12, padding: '5px 12px' }}>Actualizar</button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Nombre</th><th>Email</th><th>Rol</th><th>Registrado</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text3)' }}>Cargando...</td></tr>
              ) : user?.rol !== 'admin' ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text3)' }}>Solo los administradores pueden ver esta información.</td></tr>
              ) : usuarios.length === 0 ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text3)' }}>Sin usuarios registrados.</td></tr>
              ) : usuarios.map(u => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 500 }}>{u.nombre}</td>
                  <td style={{ color: 'var(--text2)' }}>{u.email}</td>
                  <td><span className={`tag ${ROL_TAG[u.rol] || 'tag-green'}`}>{u.rol}</span></td>
                  <td style={{ color: 'var(--text3)', fontSize: 12 }}>{formatDate(u.creadoEn)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
