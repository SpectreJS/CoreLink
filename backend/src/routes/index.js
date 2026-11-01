import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes.js';
import adminRoutes from './admin.routes.js';
import { publicPricingRouter } from '../modules/pricing/pricing.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/pricing', publicPricingRouter);

export default router;
