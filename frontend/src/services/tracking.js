export function normalizeTrackingCode(value) {
  const code = value.trim().toUpperCase();
  return /^CL-\d{4}$/.test(code)
    ? code
    : null;
}

export async function findTrackingRecord(code, signal) {
  if (signal?.aborted) {
    const error = new Error('Recherche annulée.');
    error.name = 'AbortError';
    throw error;
  }

  const normalizedCode = normalizeTrackingCode(code);
  if (!normalizedCode) return null;

  const response = await fetch(`/api/tracking/${encodeURIComponent(normalizedCode)}`, {
    headers: { Accept: 'application/json' },
    signal,
  });
  let payload = null;
  try {
    payload = await response.json();
  } catch {
    if (response.ok) throw new Error('Réponse API de suivi invalide.');
  }
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(payload?.message || `Erreur API (${response.status}).`);
  return payload?.data || null;
}
