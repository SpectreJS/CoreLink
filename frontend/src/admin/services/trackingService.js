import { adminApi } from './adminApi.js';

export const listTrackingEvents = () => adminApi('/admin/tracking');
export const createTrackingEvent = (event) => adminApi('/admin/tracking', {
  method: 'POST',
  body: JSON.stringify(event),
});
