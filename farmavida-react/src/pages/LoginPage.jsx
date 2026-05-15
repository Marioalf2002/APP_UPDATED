// ═══════════════════════════════════════════════
//  src/pages/LoginPage.jsx
// ═══════════════════════════════════════════════

import { useState } from 'react';
import { useAuth }  from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function LoginPage({ onNavigate }) {
  const { login, loginDirect } = useAuth();
  const { showToast }          = useToast();
  const [email,    setEmail]   = useState('');
  const [password, setPass]    = useState('');
  const [showPass, setShow]    = useState(false);
  const [loading,  setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) { showToast('Completa todos los campos.', 'error'); return; }
    setLoading(true);
    try {
      await login(email, password);
      onNavigate('dashboard');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const fillAndLogin = async (e, p) => {
    setEmail(e); setPass(p);
    setLoading(true);
    try {
      await loginDirect(e, p);
      onNavigate('dashboard');
      showToast('¡Sesión iniciada!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const USERS = [
    { email: 'admin@farmavida.com',        pass: 'Admin123!',   label: 'admin@farmavida.com — Admin123!' },
    { email: 'farmaceutico@farmavida.com', pass: 'Farma123!',   label: 'farmaceutico@farmavida.com — Farma123!' },
    { email: 'cliente@farmavida.com',      pass: 'Cliente123!', label: 'cliente@farmavida.com — Cliente123!' },
  ];

  return (
    <div style={{ minHeight: 'calc(100vh - 54px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem', background: 'radial-gradient(ellipse at 30% 20%, rgba(74,222,128,0.04) 0%, transparent 60%)' }}>
      <div className="card" style={{ width: '100%', maxWidth: 420, padding: '2rem 2.25rem' }}>
        <h2 style={{ fontFamily: 'var(--font-disp)', fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Bienvenido</h2>
        <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: '1.5rem' }}>Inicia sesión en FarmaVida</p>

        <div className="field">
          <label>Correo electrónico</label>
          <input className="inp" type="email" placeholder="correo@ejemplo.com" value={email} onChange={e => setEmail(e.target.value)} />
        </div>

        <div className="field">
          <label>Contraseña</label>
          <div style={{ position: 'relative' }}>
            <input className="inp" type={showPass ? 'text' : 'password'} placeholder="Tu contraseña" value={password} onChange={e => setPass(e.target.value)} style={{ paddingRight: 38 }} />
            <button onClick={() => setShow(v => !v)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text3)', display: 'flex', cursor: 'pointer' }}>
              <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
              </svg>
            </button>
          </div>
        </div>

        <button className="btn btn-green btn-full" onClick={handleLogin} disabled={loading} style={{ marginTop: 4 }}>
          {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
        </button>

        <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text2)', marginTop: '1rem' }}>
          ¿No tienes cuenta?{' '}
          <span onClick={() => onNavigate('register')} style={{ color: 'var(--green)', cursor: 'pointer' }}>Regístrate aquí</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '1rem 0', fontSize: 11, color: 'var(--text3)' }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          usuarios de prueba
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {USERS.map(u => (
            <button key={u.email} onClick={() => fillAndLogin(u.email, u.pass)}
              style={{ textAlign: 'left', padding: '7px 10px', borderRadius: 8, border: '1px solid var(--border-md)', background: 'var(--surface)', color: 'var(--text2)', cursor: 'pointer', fontSize: 11, fontFamily: 'var(--mono)' }}>
              {u.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
