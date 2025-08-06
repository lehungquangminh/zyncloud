import { Router } from 'express';
import {
  getWalletTransactions,
  addMoney,
  subtractMoney,
  getFinancialReports,
  getPendingTopUps,
  approveTopUp,
  rejectTopUp,
  getExchangeRates,
  updateExchangeRate,
  getPaymentMethods,
  togglePaymentMethod,
} from '../../controllers/admin/wallet';
import { protect, admin } from '../../middleware/auth';

const router = Router();

router.get('/transactions', protect, admin, getWalletTransactions);
router.post('/add-money', protect, admin, addMoney);
router.post('/subtract-money', protect, admin, subtractMoney);
router.get('/reports', protect, admin, getFinancialReports);
router.get('/topup/pending', protect, admin, getPendingTopUps);
router.post('/topup/:id/approve', protect, admin, approveTopUp);
router.post('/topup/:id/reject', protect, admin, rejectTopUp);
router.get('/exchange-rates', protect, admin, getExchangeRates);
router.put('/exchange-rates/:id', protect, admin, updateExchangeRate);
router.get('/payment-methods', protect, admin, getPaymentMethods);
router.put('/payment-methods/:id/toggle', protect, admin, togglePaymentMethod);

export default router;
