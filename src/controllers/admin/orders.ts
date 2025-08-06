import { Request, Response } from 'express';
import * as service from '../../services/admin/order.service';

export const getOrders = async (req: Request, res: Response) => {
  const orders = await service.getAllOrders(req.query);
  res.json(orders);
};

export const getOrder = async (req: Request, res: Response) => {
  const { id } = req.params;
  const order = await service.getOrderById(id);
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }
  res.json(order);
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const updatedOrder = await service.updateOrderStatus(id, status);
  res.json(updatedOrder);
};

export const refundOrder = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { amount, reason } = req.body;
  const refundedOrder = await service.refundOrder(id, amount, reason);
  res.json(refundedOrder);
};

export const updateOrderNotes = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { notes } = req.body;
  const updatedOrder = await service.updateOrderNotes(id, notes);
  res.json(updatedOrder);
};

export const getOrderStats = async (req: Request, res: Response) => {
  const stats = await service.getOrderStats();
  res.json(stats);
};
