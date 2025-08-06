import { Router } from 'express';
import {
  verifyCard,
  getExchangeRates,
  processCard,
  getBankInfo,
  createBankTransfer,
  processOrder,
  getOrderStatus,
  payWithWallet,
} from '../controllers/payments';
import { protect } from '../middleware/auth';

const router = Router();

router.post('/verify-card', protect, verifyCard);
router.get('/exchange-rates', getExchangeRates);
router.post('/process-card', protect, processCard);
router.get('/bank-info', getBankInfo);
router.post('/bank-transfer', protect, createBankTransfer);
router.post('/process-order', protect, processOrder);
router.get('/order/:id/status', protect, getOrderStatus);
router.post('/wallet/pay', protect, payWithWallet);

export default router;
