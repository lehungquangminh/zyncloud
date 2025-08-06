import { Router } from 'express';
import {
  createService,
  deleteService,
  getService,
  getServices,
  toggleServiceStatus,
  updateService,
} from '../../controllers/admin/services';
import { protect, admin } from '../../middleware/auth';

const router = Router();

router.route('/').get(protect, admin, getServices).post(protect, admin, createService);
router
  .route('/:id')
  .get(protect, admin, getService)
  .put(protect, admin, updateService)
  .delete(protect, admin, deleteService);
router.route('/:id/toggle-status').put(protect, admin, toggleServiceStatus);

export default router;
