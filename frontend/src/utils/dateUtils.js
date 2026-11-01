const TIME_ZONE = 'Indian/Antananarivo';

function parseDate(value) {
  if (value === null || value === undefined || value === '') return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}(?:[ T]\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?)?$/.test(value)) {
    const date = new Date(`${value.replace(' ', 'T')}Z`);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getDateParts(value) {
  const date = parseDate(value);
  if (!date) return null;
  return new Intl.DateTimeFormat('fr-FR', {
    timeZone: TIME_ZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date).reduce((parts, part) => ({ ...parts, [part.type]: part.value }), {});
}

export function getMadagascarDateKey(value) {
  const parts = getDateParts(value);
  return parts ? `${parts.year}-${parts.month}-${parts.day}` : null;
}

export function getCurrentMadagascarDateKey() {
  return getMadagascarDateKey(new Date());
}

export function formatDate(value) {
  const parts = getDateParts(value);
  return parts ? `${parts.day}-${parts.month}-${parts.year}` : '—';
}

export function formatTime(value) {
  const parts = getDateParts(value);
  return parts ? `${parts.hour}h${parts.minute}` : '—';
}

export function formatDateTime(value) {
  const parts = getDateParts(value);
  return parts ? `${parts.day}-${parts.month}-${parts.year} à ${parts.hour}h${parts.minute}` : '—';
}
