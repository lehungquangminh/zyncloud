import { Request, Response } from 'express';
import * as service from '../services/system.service';

export const chargeWallet = async (req: Request, res: Response) => {
  const { userId, orderId } = req.body;
  const result = await service.chargeWallet(userId, orderId);
  res.json(result);
};

export const refundWallet = async (req: Request, res: Response) => {
  const { userId, orderId, amount, reason } = req.body;
  const result = await service.refundWallet(userId, orderId, amount, reason);
  res.json(result);
};

export const validatePayment = async (req: Request, res: Response) => {
  const result = await service.validatePayment(req.body);
  res.json(result);
};
