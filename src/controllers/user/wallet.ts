import { Request, Response } from 'express';
import * as service from '../../services/user/wallet.service';

export const getWalletBalance = async (req: Request, res: Response) => {
  const balance = await service.getWalletBalance(req.user.id);
  res.json(balance);
};

export const getWalletTransactions = async (req: Request, res: Response) => {
  const transactions = await service.getWalletTransactions(req.user.id);
  res.json(transactions);
};

export const topUpFromCard = async (req: Request, res: Response) => {
  const topUpRequest = await service.topUpFromCard(req.user.id, req.body);
  res.status(201).json(topUpRequest);
};

export const topUpFromBank = async (req: Request, res: Response) => {
  const topUpRequest = await service.topUpFromBank(req.user.id, req.body);
  res.status(201).json(topUpRequest);
};

export const getTopUpHistory = async (req: Request, res: Response) => {
  const history = await service.getTopUpHistory(req.user.id);
  res.json(history);
};

export const getPaymentMethods = async (req: Request, res: Response) => {
  const methods = await service.getPaymentMethods();
  res.json(methods);
};
