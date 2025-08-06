import { Router } from 'express';
import {
  createPackage,
  deletePackage,
  getPackage,
  getPackages,
  updatePackage,
  reorderPackages,
} from '../../controllers/admin/packages';
import { protect, admin } from '../../middleware/auth';

const router = Router({ mergeParams: true });

router.route('/').get(protect, admin, getPackages).post(protect, admin, createPackage);

router
  .route('/:id')
  .get(protect, admin, getPackage)
  .put(protect, admin, updatePackage)
  .delete(protect, admin, deletePackage);

router.route('/reorder').put(protect, admin, reorderPackages);

export default router;
