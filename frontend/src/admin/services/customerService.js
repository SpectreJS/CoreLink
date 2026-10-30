import { adminApi } from './adminApi.js';

export const listCustomers = () => adminApi('/admin/customers');
export const getCustomer = (id) => adminApi(`/admin/customers/${encodeURIComponent(id)}`);
export const createCustomer = (customer) => adminApi('/admin/customers', {
  method: 'POST',
  body: JSON.stringify(customer),
});
