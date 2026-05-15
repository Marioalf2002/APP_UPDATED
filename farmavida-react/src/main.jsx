// ═══════════════════════════════════════════════
//  src/main.jsx
// ═══════════════════════════════════════════════

import React    from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App                from './App';
import { AuthProvider }   from './context/AuthContext';
import { CartProvider }   from './context/CartContext';
import { ToastProvider }  from './context/ToastContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <CartProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </CartProvider>
    </AuthProvider>
  </React.StrictMode>
);
