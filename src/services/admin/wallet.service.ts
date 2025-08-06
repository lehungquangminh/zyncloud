import prisma from '../../lib/prisma';
import {
  WalletTransactionType,
  TopupStatus,
  PaymentMethodStatus,
} from '@prisma/client';

export const getAllWalletTransactions = async () => {
  return prisma.walletTransaction.findMany({
    orderBy: {
      created_at: 'desc',
    },
    include: {
      user: true,
    },
  });
};

export const addMoney = async (
  adminId: string,
  userId: string,
  amount: number,
  reason: string
) => {
  const wallet = await prisma.userWallet.findUnique({
    where: { user_id: userId },
  });

  if (!wallet) {
    throw new Error('Wallet not found');
  }

  const newBalance = wallet.balance + amount;

  return prisma.walletTransaction.create({
    data: {
      user_id: userId,
      type: WalletTransactionType.ADMIN_ADD,
      amount,
      balance_before: wallet.balance,
      balance_after: newBalance,
      description: reason,
      admin_id: adminId,
    },
  });
};

export const subtractMoney = async (
  adminId: string,
  userId: string,
  amount: number,
  reason: string
) => {
  const wallet = await prisma.userWallet.findUnique({
    where: { user_id: userId },
  });

  if (!wallet) {
    throw new Error('Wallet not found');
  }

  const newBalance = wallet.balance - amount;

  return prisma.walletTransaction.create({
    data: {
      user_id: userId,
      type: WalletTransactionType.ADMIN_SUBTRACT,
      amount,
      balance_before: wallet.balance,
      balance_after: newBalance,
      description: reason,
      admin_id: adminId,
    },
  });
};

export const getFinancialReports = async () => {
  // Simplified financial reports
  const totalTopUps = await prisma.topupRequest.aggregate({
    _sum: {
      actual_amount: true,
    },
    where: {
      status: TopupStatus.COMPLETED,
    },
  });

  const totalSpent = await prisma.walletTransaction.aggregate({
    _sum: {
      amount: true,
    },
    where: {
      type: WalletTransactionType.PURCHASE,
    },
  });

  return {
    totalTopUps: totalTopUps._sum.actual_amount,
    totalSpent: totalSpent._sum.amount,
  };
};

export const getPendingTopUps = async () => {
  return prisma.topupRequest.findMany({
    where: {
      status: TopupStatus.PENDING,
    },
    include: {
      user: true,
    },
  });
};

export const approveTopUp = async (
  adminId: string,
  topUpId: string,
  adminNotes: string
) => {
  return prisma.topupRequest.update({
    where: { id: topUpId },
    data: {
      status: TopupStatus.COMPLETED,
      processed_by: adminId,
      admin_notes: adminNotes,
      processed_at: new Date(),
    },
  });
};

export const rejectTopUp = async (
  adminId: string,
  topUpId: string,
  adminNotes: string
) => {
  return prisma.topupRequest.update({
    where: { id: topUpId },
    data: {
      status: TopupStatus.FAILED,
      processed_by: adminId,
      admin_notes: adminNotes,
      processed_at: new Date(),
    },
  });
};

export const getExchangeRates = async () => {
  return prisma.exchangeRate.findMany();
};

export const updateExchangeRate = async (id: string, data: any) => {
  return prisma.exchangeRate.update({
    where: { id },
    data,
  });
};

export const getPaymentMethods = async () => {
  return prisma.paymentMethodConfig.findMany();
};

export const togglePaymentMethod = async (id: string) => {
  const method = await prisma.paymentMethodConfig.findUnique({
    where: { id },
  });

  if (!method) {
    throw new Error('Payment method not found');
  }

  const newStatus =
    method.status === PaymentMethodStatus.ACTIVE
      ? PaymentMethodStatus.INACTIVE
      : PaymentMethodStatus.ACTIVE;

  return prisma.paymentMethodConfig.update({
    where: { id },
    data: {
      status: newStatus,
    },
  });
};
