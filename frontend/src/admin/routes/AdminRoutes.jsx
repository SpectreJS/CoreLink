import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import AdminLayout from '../components/layout/AdminLayout.jsx';
import AdminProtectedRoute from './AdminProtectedRoute.jsx';
import AdminLoginPage from '../pages/AdminLoginPage.jsx';
import Dashboard from '../pages/Dashboard.jsx';
import {
  AdminCustomerDetailsPage,
  AdminCustomerFormPage,
  AdminCustomersPage,
  AdminModulePage,
  AdminParcelDetailsPage,
  AdminParcelFormPage,
  AdminParcelsPage,
} from '../pages/AdminModulePages.jsx';
import AdminProfilesPage from '../pages/AdminProfilesPage.jsx';

export default function AdminRoutes() {
  return (
    <Routes>
      <Route path="login" element={<AdminLoginPage />} />
      <Route element={<AdminProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route index element={<Navigate replace to="dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="parcels" element={<AdminParcelsPage />} />
          <Route path="parcels/new" element={<AdminParcelFormPage />} />
          <Route path="parcels/:id/edit" element={<AdminParcelFormPage edit />} />
          <Route path="parcels/:id" element={<AdminParcelDetailsPage />} />
          <Route path="customers" element={<AdminCustomersPage />} />
          <Route path="customers/new" element={<AdminCustomerFormPage />} />
          <Route path="customers/:id/edit" element={<AdminCustomerFormPage edit />} />
          <Route path="customers/:id" element={<AdminCustomerDetailsPage />} />
          <Route path="tracking" element={<AdminModulePage module="tracking" />} />
          <Route path="shipments" element={<AdminModulePage module="shipments" />} />
          <Route path="shipments/:id" element={<AdminModulePage module="shipments" />} />
          <Route path="payments" element={<AdminModulePage module="payments" />} />
          <Route path="reports" element={<AdminModulePage module="reports" />} />
          <Route path="users" element={<AdminProfilesPage />} />
          <Route path="settings" element={<AdminModulePage module="settings" />} />
          <Route path="*" element={<Navigate replace to="/admin/dashboard" />} />
        </Route>
      </Route>
    </Routes>
  );
}
