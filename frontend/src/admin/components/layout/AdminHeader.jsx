import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../contexts/AdminAuthContext.jsx';

export default function AdminHeader({ onMenuToggle }) {
  const { user, logout } = useAdminAuth();
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogout = async () => {
    setError('');
    try {
      await logout();
      navigate('/admin/login', { replace: true });
    } catch (logoutError) {
      setError(logoutError.message);
    }
  };

  return (
    <header className="admin-topbar">
      <div className="admin-topbar-actions">
        <button aria-label="Ouvrir le menu" className="admin-icon-button admin-menu-toggle" onClick={onMenuToggle} type="button">
          <span className="material-symbols-outlined">menu</span>
        </button>
        <span className="admin-demo-notice">Console d’administration</span>
      </div>
      <div className="admin-user-menu">
        {error && <span className="admin-alert">{error}</span>}
        <span className="admin-avatar">{(user?.name || 'A').slice(0, 1).toUpperCase()}</span>
        <span><strong>{user?.name || 'Administrateur'}</strong><br /><small>{user?.role || 'admin'}</small></span>
        <button className="admin-button is-secondary" onClick={handleLogout} type="button">Déconnexion</button>
      </div>
    </header>
  );
}
