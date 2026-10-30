import { Router } from 'express';
import { authenticate, requireRole } from '../middlewares/authenticate.js';
import { HttpError } from '../middlewares/httpError.js';

const router = Router();

router.use(authenticate, requireRole('admin', 'manager', 'operator', 'viewer'));
router.use((request, response, next) => {
  next(new HttpError(501, 'Ce module API est préparé mais pas encore implémenté.'));
});

export default router;
