// ═══════════════════════════════════════════════
//  src/pages/DashboardPage.jsx
// ═══════════════════════════════════════════════

import { useState }           from 'react';
import Sidebar                from '../components/Sidebar';
import CartPanel              from '../components/CartPanel';
import InventarioPage         from './InventarioPage';
import RegistroProductoPage   from './RegistroProductoPage';
import PagoPage               from './PagoPage';
import PerfilPage             from './PerfilPage';
import PermisosPage           from './PermisosPage';

export default function DashboardPage() {
  const [section, setSection] = useState('inventario');

  const navigate = (s) => setSection(s);

  const renderSection = () => {
    switch (section) {
      case 'inventario':    return <InventarioPage />;
      case 'registro-prod': return <RegistroProductoPage onNavigate={navigate} />;
      case 'pago':          return <PagoPage onNavigate={navigate} />;
      case 'perfil':        return <PerfilPage />;
      case 'permisos':      return <PermisosPage />;
      default:              return <InventarioPage />;
    }
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 54px)' }}>
      <Sidebar active={section} onNavigate={navigate} />
      <main style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', background: 'var(--bg)' }}>
        {renderSection()}
      </main>
      <CartPanel onCheckout={() => navigate('pago')} />
    </div>
  );
}
