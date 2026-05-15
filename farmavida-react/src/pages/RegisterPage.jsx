// ═══════════════════════════════════════════════
//  src/pages/RegisterPage.jsx
// ═══════════════════════════════════════════════

import { useState }  from 'react';
import { useAuth }   from '../context/AuthContext';
import { useToast }  from '../context/ToastContext';
import { isValidEmail, getAge, checkPasswordRules } from '../utils/validators';

const RuleItem = ({ ok, label }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11, color: ok ? 'var(--green)' : 'var(--text3)', transition: 'color .15s' }}>
    <div style={{ width: 14, height: 14, borderRadius: '50%', border: `1.5px solid ${ok ? 'var(--green)' : 'currentColor'}`, background: ok ? 'var(--green)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background .15s' }}>
      {ok && <span style={{ fontSize: 9, color: '#000', fontWeight: 700 }}>✓</span>}
    </div>
    {label}
  </div>
);

export default function RegisterPage({ onNavigate }) {
  const { register }    = useAuth();
  const { showToast }   = useToast();
  const [form, setForm] = useState({ nombre: '', email: '', password: '', fechaNacimiento: '', telefono: '', direccion: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPass, setShow]   = useState(false);

  const rules = checkPasswordRules(form.password);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.nombre.trim())         errs.nombre = 'Ingresa tu nombre.';
    if (!isValidEmail(form.email))   errs.email  = 'Ingresa un correo válido.';
    if (!form.fechaNacimiento)       errs.fecha  = 'La fecha de nacimiento es requerida.';
    else if (getAge(form.fechaNacimiento) < 18) errs.fecha = 'Debes ser mayor de 18 años.';
    if (form.password.length < 1)    errs.pass   = 'La contraseña es requerida.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await register({
        nombre: form.nombre, email: form.email, password: form.password,
        fechaNacimiento: form.fechaNacimiento, telefono: form.telefono, direccion: form.direccion,
      });
      showToast('¡Cuenta creada exitosamente!', 'success');
      onNavigate('dashboard');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 54px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem', background: 'radial-gradient(ellipse at 70% 80%, rgba(74,222,128,0.03) 0%, transparent 60%)' }}>
      <div className="card" style={{ width: '100%', maxWidth: 480, padding: '2rem 2.25rem' }}>
        <h2 style={{ fontFamily: 'var(--font-disp)', fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Crear cuenta</h2>
        <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: '1rem' }}>Solo personas mayores de 18 años</p>

        <div style={{ background: 'var(--blue-bg)', border: '1px solid rgba(96,165,250,0.2)', borderRadius: 'var(--r)', padding: '9px 12px', fontSize: 12, color: 'var(--blue)', marginBottom: '1.25rem', lineHeight: 1.55 }}>
          Este servicio está disponible únicamente para personas <strong>mayores de 18 años</strong>.
        </div>

        <div className="form-grid">
          <div className="field">
            <label>Nombre completo *</label>
            <input className={`inp${errors.nombre ? ' err' : ''}`} placeholder="Juan Pérez" value={form.nombre} onChange={set('nombre')} />
            {errors.nombre && <span className="field-err">{errors.nombre}</span>}
          </div>
          <div className="field">
            <label>Fecha de nacimiento *</label>
            <input className={`inp${errors.fecha ? ' err' : ''}`} type="date" value={form.fechaNacimiento} onChange={set('fechaNacimiento')} />
            {errors.fecha && <span className="field-err">{errors.fecha}</span>}
          </div>
          <div className="field full">
            <label>Correo electrónico *</label>
            <input className={`inp${errors.email ? ' err' : ''}`} placeholder="juan@ejemplo.com" value={form.email} onChange={set('email')} />
            {errors.email && <span className="field-err">{errors.email}</span>}
          </div>
          <div className="field full">
            <label>Contraseña *</label>
            <div style={{ position: 'relative' }}>
              <input className={`inp${errors.pass ? ' err' : ''}`} type={showPass ? 'text' : 'password'} placeholder="Mínimo 8 caracteres" value={form.password} onChange={set('password')} style={{ paddingRight: 38 }} />
              <button onClick={() => setShow(v => !v)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text3)', display: 'flex', cursor: 'pointer' }}>
                <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 6 }}>
              <RuleItem ok={rules.len}     label="Mínimo 8 caracteres" />
              <RuleItem ok={rules.upper}   label="Una letra mayúscula" />
              <RuleItem ok={rules.lower}   label="Una letra minúscula" />
              <RuleItem ok={rules.special} label="Un carácter especial" />
            </div>
          </div>
          <div className="field">
            <label>Teléfono</label>
            <input className="inp" placeholder="300 000 0000" value={form.telefono} onChange={set('telefono')} />
          </div>
          <div className="field">
            <label>Dirección</label>
            <input className="inp" placeholder="Calle 1 # 2-3" value={form.direccion} onChange={set('direccion')} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: '1.25rem' }}>
          <button className="btn btn-full" onClick={() => onNavigate('login')}>Volver</button>
          <button className="btn btn-green btn-full" onClick={handleRegister} disabled={loading}>
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </div>
        <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text2)', marginTop: '1rem' }}>
          ¿Ya tienes cuenta?{' '}
          <span onClick={() => onNavigate('login')} style={{ color: 'var(--green)', cursor: 'pointer' }}>Inicia sesión</span>
        </div>
      </div>
    </div>
  );
}
