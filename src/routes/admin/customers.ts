import { Router } from 'express';
import {
  getCustomers,
  getCustomer,
  getCustomerOrders,
  getCustomerServers,
  updateCustomerStatus,
  getPterodactylAccount,
} from '../../controllers/admin/customers';
import { protect, admin } from '../../middleware/auth';

const router = Router();

router.route('/').get(protect, admin, getCustomers);
router.route('/:id').get(protect, admin, getCustomer);
router.route('/:id/orders').get(protect, admin, getCustomerOrders);
router.route('/:id/servers').get(protect, admin, getCustomerServers);
router.route('/:id/status').put(protect, admin, updateCustomerStatus);
router.route('/:id/pterodactyl').get(protect, admin, getPterodactylAccount);

export default router;
