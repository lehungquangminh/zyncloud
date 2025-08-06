import { Router } from 'express';
import servicesRouter from './admin/services';
import packagesRouter from './admin/packages';
import ordersRouter from './admin/orders';
import customersRouter from './admin/customers';

const router = Router();

router.use('/services', servicesRouter);
router.use('/services/:serviceId/packages', packagesRouter);
router.use('/packages', packagesRouter);
router.use('/orders', ordersRouter);
router.use('/customers', customersRouter);

export default router;
