import { adminApi } from './adminApi.js';

const DEMO_USER = {
  id: 'demo-admin',
  name: 'Administrateur démo',
  email: 'demo@corelink.local',
  role: 'admin',
};

export async function loginAdmin({ email, password }) {
  if (import.meta.env.DEV && email === 'demo@corelink.local' && password === 'demo-only') {
    return { user: DEMO_USER, demo: true };
  }

  const result = await adminApi('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (!result?.user) throw new Error('La réponse d’authentification est invalide.');
  return { user: result.user, demo: false };
}

export async function getCurrentAdmin() {
  try {
    const result = await adminApi('/auth/me');
    return result?.user || null;
  } catch (error) {
    if (error.message.includes('(401)') || error.message.includes('(404)')) return null;
    throw error;
  }
}

export async function logoutAdmin() {
  try {
    await adminApi('/auth/logout', { method: 'POST' });
  } catch (error) {
    if (!error.message.includes('(401)') && !error.message.includes('(404)')) throw error;
  }
}
