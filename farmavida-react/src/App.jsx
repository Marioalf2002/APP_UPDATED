// ═══════════════════════════════════════════════
//  src/App.jsx
// ═══════════════════════════════════════════════

import { useState }    from 'react';
import { useAuth }     from './context/AuthContext';
import Topbar          from './components/Topbar';
import LoginPage       from './pages/LoginPage';
import RegisterPage    from './pages/RegisterPage';
import DashboardPage   from './pages/DashboardPage';

export default function App() {
  const { isAuthenticated } = useAuth();
  const [page, setPage]     = useState(isAuthenticated ? 'dashboard' : 'login');

  const navigate = (p) => setPage(p);

  const renderPage = () => {
    if (!isAuthenticated && page !== 'register') return <LoginPage onNavigate={navigate} />;
    switch (page) {
      case 'register':  return <RegisterPage onNavigate={navigate} />;
      case 'dashboard': return isAuthenticated ? <DashboardPage /> : <LoginPage onNavigate={navigate} />;
      default:          return <LoginPage onNavigate={navigate} />;
    }
  };

  return (
    <>
      <Topbar onNavigate={(s) => { if (s === 'perfil' && isAuthenticated) setPage('dashboard'); }} />
      {renderPage()}
    </>
  );
}
