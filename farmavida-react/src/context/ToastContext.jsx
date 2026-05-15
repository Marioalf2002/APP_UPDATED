// ═══════════════════════════════════════════════
//  src/context/ToastContext.jsx
// ═══════════════════════════════════════════════

import { createContext, useContext, useState, useCallback, useRef } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState({ msg: '', type: '', visible: false });
  const timerRef = useRef(null);

  const showToast = useCallback((msg, type = '') => {
    clearTimeout(timerRef.current);
    setToast({ msg, type, visible: true });
    timerRef.current = setTimeout(() => setToast((t) => ({ ...t, visible: false })), 3200);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        style={{
          position: 'fixed', bottom: 24, left: '50%',
          transform: `translateX(-50%) translateY(${toast.visible ? '0' : '80px'})`,
          opacity: toast.visible ? 1 : 0,
          transition: 'transform .3s, opacity .3s',
          background: toast.type === 'success' ? 'var(--green-bg)' : toast.type === 'error' ? 'var(--red-bg)' : 'var(--surface2)',
          border: `1px solid ${toast.type === 'success' ? 'rgba(74,222,128,.3)' : toast.type === 'error' ? 'rgba(248,113,113,.3)' : 'var(--border-md)'}`,
          color: toast.type === 'success' ? 'var(--green)' : toast.type === 'error' ? 'var(--red)' : 'var(--text)',
          padding: '10px 20px', borderRadius: 20, fontSize: 13, fontWeight: 500,
          boxShadow: 'var(--shadow-lg)', zIndex: 600, whiteSpace: 'nowrap',
          pointerEvents: 'none',
        }}
      >
        {toast.msg}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
