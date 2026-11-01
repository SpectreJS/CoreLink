import { adminApi } from './adminApi.js';

export const listParcels = () => adminApi('/admin/parcels');
export const getParcel = (id) => adminApi(`/admin/parcels/${encodeURIComponent(id)}`);
export const getParcelStatusHistory = (id) => adminApi(`/admin/parcels/${encodeURIComponent(id)}/status-history`);
export const listParcelStatuses = () => adminApi('/admin/parcels/statuses');
export const listParcelTransportModes = () => adminApi('/admin/parcels/transport-modes');
export const createParcel = (parcel) => adminApi('/admin/parcels', {
  method: 'POST',
  body: JSON.stringify(parcel),
});
export const updateParcel = (id, parcel) => adminApi(`/admin/parcels/${encodeURIComponent(id)}`, {
  method: 'PATCH',
  body: JSON.stringify(parcel),
});
export const deleteParcel = (id) => adminApi(`/admin/parcels/${encodeURIComponent(id)}`, {
  method: 'DELETE',
});
export const deleteParcels = (ids) => adminApi('/admin/parcels/bulk', {
  method: 'DELETE',
  body: JSON.stringify({ ids }),
});
