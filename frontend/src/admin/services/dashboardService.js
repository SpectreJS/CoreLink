import { adminApi } from './adminApi.js';

export const getDashboard = (period) => adminApi(`/admin/dashboard?period=${encodeURIComponent(period)}`);
