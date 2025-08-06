import { Router } from 'express';
import { chargeWallet, refundWallet, validatePayment } from '../controllers/system';
import { protect, admin } from '../middleware/auth';

const router = Router();

// These routes should be protected and only accessible by internal services.
// In a real microservices architecture, you might use a different authentication method.
router.post('/wallet/charge', protect, admin, chargeWallet);
router.post('/wallet/refund', protect, admin, refundWallet);
router.post('/payment/validate', protect, admin, validatePayment);

export default router;
