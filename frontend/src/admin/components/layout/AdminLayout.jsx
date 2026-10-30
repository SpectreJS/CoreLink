import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminHeader from './AdminHeader.jsx';
import AdminSidebar from './AdminSidebar.jsx';
import AdminBreadcrumb from './AdminBreadcrumb.jsx';
import '../../styles/admin-main.scss';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="admin-shell">
      <AdminSidebar onNavigate={() => setSidebarOpen(false)} open={sidebarOpen} />
      <div className="admin-main-area">
        <AdminHeader onMenuToggle={() => setSidebarOpen((open) => !open)} />
        <main className="admin-content">
          <AdminBreadcrumb />
          <Outlet />
        </main>
      </div>
    </div>
  );
}
