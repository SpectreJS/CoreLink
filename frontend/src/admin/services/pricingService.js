import { adminApi } from './adminApi.js';

export const listPricingSettings = () => adminApi('/admin/pricing');
export const updatePricingSetting = (key, setting) => adminApi(`/admin/pricing/${encodeURIComponent(key)}`, {
  method: 'PATCH',
  body: JSON.stringify(setting),
});
