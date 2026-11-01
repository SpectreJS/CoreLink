import React, { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../contexts/AdminAuthContext.jsx';
import { AdminButton, AdminField } from '../components/common/AdminUI.jsx';
import logo from '../../assets/images/logo.png';

export default function AdminLoginPage() {
  const { isAuthenticated, login, status } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  if (isAuthenticated) return <Navigate replace to="/admin/dashboard" />;

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await login({ email, password });
      navigate(location.state?.from?.pathname || '/admin/dashboard', { replace: true });
    } catch (loginError) {
      setError(loginError.message || 'Connexion impossible.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="admin-login-screen">
      <section className="admin-login-card">
        <img alt="CoreLink" height="56" src={logo} style={{ width: 56, height: 56, objectFit: 'contain', borderRadius: 10 }} width="56" />
        <h1>Connexion admin</h1>
        <p>Connectez-vous à l’espace de gestion CoreLink.</p>
        {status === 'loading' && <p>Vérification de la session…</p>}
        {error && <p className="admin-alert" role="alert">{error}</p>}
        <form className="admin-form" onSubmit={submit}>
          <AdminField autoComplete="username" label="Adresse e-mail" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} />
          <AdminField autoComplete="current-password" label="Mot de passe" onChange={(event) => setPassword(event.target.value)} required type="password" value={password} />
          <AdminButton disabled={submitting || status === 'loading'} type="submit">
            {submitting ? 'Connexion…' : 'Se connecter'}
          </AdminButton>
        </form>
      </section>
    </main>
  );
}
