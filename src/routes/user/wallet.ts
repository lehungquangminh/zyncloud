import { Router } from 'express';
import {
  getWalletBalance,
  getWalletTransactions,
  topUpFromCard,
  topUpFromBank,
  getTopUpHistory,
  getPaymentMethods,
} from '../../controllers/user/wallet';
import { protect } from '../../middleware/auth';

const router = Router();

router.get('/balance', protect, getWalletBalance);
router.get('/transactions', protect, getWalletTransactions);
router.post('/topup-card', protect, topUpFromCard);
router.post('/topup-bank', protect, topUpFromBank);
router.get('/topup-history', protect, getTopUpHistory);
router.get('/payment-methods', getPaymentMethods);

export default router;
