import { Request, Response } from 'express';
import * as service from '../services/payment.service';

export const verifyCard = async (req: Request, res: Response) => {
  const result = await service.verifyCard(req.body);
  res.json(result);
};

export const getExchangeRates = async (req: Request, res: Response) => {
  const rates = await service.getExchangeRates();
  res.json(rates);
};

export const processCard = async (req: Request, res: Response) => {
  const result = await service.processCard(req.user.id, req.body);
  res.json(result);
};

export const getBankInfo = async (req: Request, res: Response) => {
  const info = await service.getBankInfo();
  res.json(info);
};

export const createBankTransfer = async (req: Request, res: Response) => {
  const result = await service.createBankTransfer(req.user.id, req.body);
  res.status(201).json(result);
};

export const processOrder = async (req: Request, res: Response) => {
  const result = await service.processOrder(req.user.id, req.body);
  res.json(result);
};

export const getOrderStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const status = await service.getOrderStatus(id);
  res.json(status);
};

export const payWithWallet = async (req: Request, res: Response) => {
  const result = await service.payWithWallet(req.user.id, req.body.orderId);
  res.json(result);
};
