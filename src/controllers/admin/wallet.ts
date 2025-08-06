import { Request, Response } from 'express';
import * as service from '../../services/admin/wallet.service';

export const getWalletTransactions = async (req: Request, res: Response) => {
  const transactions = await service.getAllWalletTransactions();
  res.json(transactions);
};

export const addMoney = async (req: Request, res: Response) => {
  const { userId, amount, reason } = req.body;
  const transaction = await service.addMoney(
    req.user.id,
    userId,
    amount,
    reason
  );
  res.json(transaction);
};

export const subtractMoney = async (req: Request, res: Response) => {
  const { userId, amount, reason } = req.body;
  const transaction = await service.subtractMoney(
    req.user.id,
    userId,
    amount,
    reason
  );
  res.json(transaction);
};

export const getFinancialReports = async (req: Request, res: Response) => {
  const reports = await service.getFinancialReports();
  res.json(reports);
};

export const getPendingTopUps = async (req: Request, res: Response) => {
  const topUps = await service.getPendingTopUps();
  res.json(topUps);
};

export const approveTopUp = async (req: Request, res: Response) => {
  const { id } = req.params;
  const topUp = await service.approveTopUp(req.user.id, id, req.body.admin_notes);
  res.json(topUp);
};

export const rejectTopUp = async (req: Request, res: Response) => {
  const { id } = req.params;
  const topUp = await service.rejectTopUp(req.user.id, id, req.body.admin_notes);
  res.json(topUp);
};

export const getExchangeRates = async (req: Request, res: Response) => {
  const rates = await service.getExchangeRates();
  res.json(rates);
};

export const updateExchangeRate = async (req: Request, res: Response) => {
  const { id } = req.params;
  const rate = await service.updateExchangeRate(id, req.body);
  res.json(rate);
};

export const getPaymentMethods = async (req: Request, res: Response) => {
  const methods = await service.getPaymentMethods();
  res.json(methods);
};

export const togglePaymentMethod = async (req: Request, res: Response) => {
  const { id } = req.params;
  const method = await service.togglePaymentMethod(id);
  res.json(method);
};
