import { Router } from 'express';
import { authenticate, requireRole } from '../middlewares/authenticate.js';
import { HttpError } from '../middlewares/httpError.js';
import parcelRoutes from '../modules/parcels/parcel.routes.js';
import userRoutes from '../modules/users/user.routes.js';
import pricingRoutes from '../modules/pricing/pricing.routes.js';
import dashboardRoutes from '../modules/dashboard/dashboard.routes.js';

const router = Router();

router.use('/parcels', parcelRoutes);
router.use('/users', userRoutes);
router.use('/pricing', pricingRoutes);
router.use('/dashboard', dashboardRoutes);
router.use(authenticate, requireRole('admin', 'manager', 'operator', 'viewer'));
router.use((request, response, next) => next(new HttpError(501, 'Ce module API est préparé mais pas encore implémenté.')));

export default router;
