import { Router } from 'express';
import {
  getOrders,
  getOrder,
  updateOrderStatus,
  refundOrder,
  updateOrderNotes,
  getOrderStats,
} from '../../controllers/admin/orders';
import { protect, admin } from '../../middleware/auth';

const router = Router();

router.route('/').get(protect, admin, getOrders);
router.route('/stats').get(protect, admin, getOrderStats);
router.route('/:id').get(protect, admin, getOrder);
router.route('/:id/status').put(protect, admin, updateOrderStatus);
router.route('/:id/refund').post(protect, admin, refundOrder);
router.route('/:id/notes').put(protect, admin, updateOrderNotes);

export default router;
