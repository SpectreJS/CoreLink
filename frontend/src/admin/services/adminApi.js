const API_BASE_URL = import.meta.env.VITE_ADMIN_API_URL || '/api';

export async function adminApi(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  });

  if (response.status === 204) return null;

  let payload;
  try {
    payload = await response.json();
  } catch {
    if (response.ok) throw new Error('Réponse API invalide.');
    payload = null;
  }

  if (!response.ok) {
    throw new Error(payload?.message || `Erreur API (${response.status}).`);
  }

  return payload;
}
