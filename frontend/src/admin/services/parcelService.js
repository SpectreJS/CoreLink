import { adminApi } from './adminApi.js';

export const listParcels = () => adminApi('/admin/parcels');
export const getParcel = (id) => adminApi(`/admin/parcels/${encodeURIComponent(id)}`);
export const createParcel = (parcel) => adminApi('/admin/parcels', {
  method: 'POST',
  body: JSON.stringify(parcel),
});
export const updateParcel = (id, parcel) => adminApi(`/admin/parcels/${encodeURIComponent(id)}`, {
  method: 'PATCH',
  body: JSON.stringify(parcel),
});
