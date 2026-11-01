const API_BASE_URL = import.meta.env.VITE_ADMIN_API_URL || '/api';

export async function getOfficialExchangeRate(signal) {
  const response = await fetch(`${API_BASE_URL}/pricing/exchange-rate`, {
    cache: 'no-store',
    signal,
  });
  let payload = null;
  try {
    payload = await response.json();
  } catch {
    if (response.ok) throw new Error('Réponse API du taux invalide.');
  }
  if (!response.ok) throw new Error(payload?.message || `Erreur API (${response.status}).`);
  return payload?.data || null;
}
