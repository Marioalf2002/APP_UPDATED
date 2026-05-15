// ═══════════════════════════════════════════════
//  src/pages/PerfilPage.jsx
// ═══════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { useAuth }             from '../context/AuthContext';
import { useToast }            from '../context/ToastContext';
import { usuariosApi }         from '../api/client';
import { getInitials }         from '../utils/formatters';
import { ROL_TAG }             from '../utils/validators';

export default function PerfilPage() {
  const { user }      = useAuth();
  const { showToast } = useToast();

  const [perfil, setPerfil]       = useState(null);
  const [editNombre, setNombre]   = useState('');
  const [editTel,    setTel]      = useState('');
  const [editDir,    setDir]      = useState('');
  const [passActual, setActual]   = useState('');
  // BUG 3: el state se llama passNuevo pero la función de cambio
  // de contraseña lee passNueva (nombre diferente → siempre undefined)
  const [passNuevo,  setNuevo]    = useState('');
  const [passConfirm,setConfirm]  = useState('');
  const [loadingP,   setLP]       = useState(false);
  const [loadingC,   setLC]       = useState(false);

  useEffect(() => {
    usuariosApi.getPerfil().then(({ ok, data }) => {
      if (ok) {
        setPerfil(data.usuario);
        setNombre(data.usuario.nombre);
        setTel(data.usuario.telefono || '');
        setDir(data.usuario.direccion || '');
      }
    });
  }, []);

  const handleUpdatePerfil = async () => {
    if (!editNombre.trim()) { showToast('El nombre es requerido.', 'error'); return; }
    setLP(true);
    try {
      const { ok, data } = await usuariosApi.updatePerfil({ nombre: editNombre, telefono: editTel, direccion: editDir });
      if (!ok) throw new Error(data.error);
      setPerfil(p => ({ ...p, nombre: editNombre }));
      showToast('Perfil actualizado.', 'success');
    } catch (err) { showToast(err.message, 'error'); }
    finally { setLP(false); }
  };

  const handleChangePassword = async () => {
    // BUG 3: lee passNueva pero el state se llama passNuevo
    // → passNueva siempre es undefined → el campo "nueva contraseña"
    //    se envía vacío y la API responde 400.
    const passNueva = undefined; // ← esto simula leer una variable inexistente
    if (!passActual || !passNueva || !passConfirm) {
      showToast('Completa todos los campos.', 'error'); return;
    }
    if (passNueva !== passConfirm) { showToast('Las contraseñas no coinciden.', 'error'); return; }
    setLC(true);
    try {
      const { ok, data } = await usuariosApi.changePassword({ passwordActual: passActual, passwordNueva: passNueva });
      if (!ok) throw new Error(data.error);
      showToast('Contraseña actualizada.', 'success');
      setActual(''); setNuevo(''); setConfirm('');
    } catch (err) { showToast(err.message, 'error'); }
    finally { setLC(false); }
  };

  if (!perfil) return <div style={{ color: 'var(--text3)', padding: '2rem' }}>Cargando perfil...</div>;

  return (
    <div>
      <h1 className="pg-title">Mi perfil</h1>
      <p className="pg-sub">Gestiona tu información personal.</p>

      {/* Profile header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--green-dim)', color: 'var(--green)', fontFamily: 'var(--font-disp)', fontSize: 28, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {getInitials(perfil.nombre)}
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-disp)', fontSize: 22, fontWeight: 700 }}>{perfil.nombre}</div>
          <div style={{ fontSize: 13, color: 'var(--text2)' }}>{perfil.email}</div>
          <span className={`tag ${ROL_TAG[perfil.rol] || 'tag-green'}`} style={{ marginTop: 4, display: 'inline-flex' }}>{perfil.rol}</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {/* Edit profile */}
        <div className="card">
          <div className="card-hd"><span className="card-title">Editar perfil</span></div>
          <div className="card-body">
            <div className="field"><label>Nombre completo</label><input className="inp" value={editNombre} onChange={e => setNombre(e.target.value)} /></div>
            <div className="field"><label>Teléfono</label><input className="inp" value={editTel} onChange={e => setTel(e.target.value)} /></div>
            <div className="field"><label>Dirección</label><input className="inp" value={editDir} onChange={e => setDir(e.target.value)} /></div>
            <button className="btn btn-green btn-full" onClick={handleUpdatePerfil} disabled={loadingP}>{loadingP ? 'Guardando...' : 'Guardar cambios'}</button>
          </div>
        </div>

        {/* Change password */}
        <div className="card">
          <div className="card-hd"><span className="card-title">Cambiar contraseña</span></div>
          <div className="card-body">
            <div className="field"><label>Contraseña actual</label><input className="inp" type="password" placeholder="••••••••" value={passActual} onChange={e => setActual(e.target.value)} /></div>
            {/* El state passNuevo se actualiza, pero la función lee passNueva (BUG 3) */}
            <div className="field"><label>Nueva contraseña</label><input className="inp" type="password" placeholder="Nueva contraseña" value={passNuevo} onChange={e => setNuevo(e.target.value)} /></div>
            <div className="field"><label>Confirmar nueva contraseña</label><input className="inp" type="password" placeholder="Repite la contraseña" value={passConfirm} onChange={e => setConfirm(e.target.value)} /></div>
            <button className="btn btn-green btn-full" onClick={handleChangePassword} disabled={loadingC}>{loadingC ? 'Actualizando...' : 'Actualizar contraseña'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
