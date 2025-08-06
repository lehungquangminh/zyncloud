import prisma from '../../lib/prisma';
import { TopupMethod, CardTelco } from '@prisma/client';

export const getWalletBalance = async (userId: string) => {
  let wallet = await prisma.userWallet.findUnique({
    where: { user_id: userId },
  });

  if (!wallet) {
    wallet = await prisma.userWallet.create({
      data: {
        user_id: userId,
      },
    });
  }

  return wallet;
};

export const getWalletTransactions = async (userId: string) => {
  return prisma.walletTransaction.findMany({
    where: { user_id: userId },
    orderBy: {
      created_at: 'desc',
    },
  });
};

export const topUpFromCard = async (userId: string, data: any) => {
  const { card_telco, card_amount, card_serial, card_pin } = data;

  return prisma.topupRequest.create({
    data: {
      user_id: userId,
      method: TopupMethod.CARD,
      requested_amount: card_amount,
      card_telco: card_telco as CardTelco,
      card_amount,
      card_serial,
      card_pin,
    },
  });
};

export const topUpFromBank = async (userId: string, data: any) => {
  const { requested_amount, bank_account_name, bank_account_number, bank_name } =
    data;

  return prisma.topupRequest.create({
    data: {
      user_id: userId,
      method: TopupMethod.BANK_TRANSFER,
      requested_amount,
      bank_account_name,
      bank_account_number,
      bank_name,
      transfer_code: `TOP_${userId.substring(0, 8)}_${Date.now()}`,
    },
  });
};

export const getTopUpHistory = async (userId: string) => {
  return prisma.topupRequest.findMany({
    where: { user_id: userId },
    orderBy: {
      created_at: 'desc',
    },
  });
};

export const getPaymentMethods = async () => {
  return prisma.paymentMethodConfig.findMany({
    where: {
      status: 'ACTIVE',
    },
    orderBy: {
      sort_order: 'asc',
    },
  });
};
