import { adminApi } from './adminApi.js';

export const listAdminProfiles = () => adminApi('/admin/users');
export const getAdminProfile = (id) => adminApi(`/admin/users/${encodeURIComponent(id)}`);
export const createAdminProfile = (profile) => adminApi('/admin/users', {
  method: 'POST',
  body: JSON.stringify(profile),
});
export const updateAdminProfile = (id, profile) => adminApi(`/admin/users/${encodeURIComponent(id)}`, {
  method: 'PATCH',
  body: JSON.stringify(profile),
});
export const deleteAdminProfile = (id) => adminApi(`/admin/users/${encodeURIComponent(id)}`, {
  method: 'DELETE',
});
export const deleteAdminProfiles = (ids) => adminApi('/admin/users', {
  method: 'DELETE',
  body: JSON.stringify({ ids }),
});
