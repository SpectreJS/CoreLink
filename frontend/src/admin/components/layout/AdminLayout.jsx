import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import AdminBreadcrumb from './AdminBreadcrumb.jsx';
import '../../styles/admin-main.scss';
import '../../styles/admin-stitch.css';
import StitchAdminHeader from './StitchAdminHeader.jsx';
import StitchAdminSidebar from './StitchAdminSidebar.jsx';
import { useAdminAuth } from '../../contexts/AdminAuthContext.jsx';

export default function AdminLayout() {
  const { pathname } = useLocation();
  const { logout } = useAdminAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState('');

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/admin/login', { replace: true });
    } catch (error) {
      setToast(`Déconnexion impossible : ${error.message}`);
    }
  };

  return (
    <div className="corelink-admin admin-shell flex min-h-screen bg-background text-body-md text-on-surface antialiased selection:bg-secondary-fixed selection:text-on-secondary-fixed">
      <StitchAdminSidebar
        onLogout={handleLogout}
        onNavigate={() => setSidebarOpen(false)}
        onNotice={setToast}
        open={sidebarOpen}
      />
      <div className="ml-64 flex min-h-screen min-w-0 flex-1 flex-col bg-background max-md:ml-0">
        <StitchAdminHeader
          onMenuToggle={() => setSidebarOpen((open) => !open)}
          onSearchChange={setSearchTerm}
          searchValue={searchTerm}
        />
        <main className="flex-1 space-y-6 p-6 max-md:p-4">
          {pathname !== '/admin/dashboard' && <AdminBreadcrumb />}
          <Outlet context={{ searchTerm, onNotice: setToast }} />
        </main>
      </div>
      {toast && (
        <div className="corelink-admin-toast" role="status">
          <div className="flex items-start justify-between gap-4">
            <span>{toast}</span>
            <button aria-label="Fermer le message" className="text-outline hover:text-on-surface" onClick={() => setToast('')} type="button">
              <span aria-hidden="true" className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
