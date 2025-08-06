import prisma from '../lib/prisma';
import { PaymentMethod, OrderStatus, PaymentStatus, WalletTransactionType } from '@prisma/client';

// Mock card API configuration
const cardApiConfig = {
  baseURL: 'https://api.card2k.com',
  endpoints: {
    checkCard: '/api/card/check',
    getBalance: '/api/balance',
  },
  authentication: {
    partnerId: 'your_partner_id',
    partnerKey: 'your_partner_key',
  },
};

export const verifyCard = async (data: any) => {
  // This is a mock verification. In a real application, you would make a call to the card API.
  console.log('Verifying card with API:', data);
  return {
    success: true,
    message: 'Card is valid',
  };
};

export const getExchangeRates = async () => {
  return prisma.exchangeRate.findMany({
    where: {
      status: 'ACTIVE',
    },
  });
};

export const processCard = async (userId: string, data: any) => {
  // This is a mock processing function. In a real application, you would make a call to the card API.
  const { card_telco, card_amount, card_serial, card_pin } = data;
  const topUpRequest = await prisma.topupRequest.create({
    data: {
      user_id: userId,
      method: 'CARD',
      requested_amount: card_amount,
      card_telco,
      card_amount,
      card_serial,
      card_pin,
    },
  });
  return topUpRequest;
};

export const getBankInfo = async () => {
  // In a real application, you would fetch this from a configuration file or the database.
  return {
    bank_name: 'Vietcombank',
    account_name: 'YEB HOSTING',
    account_number: '1234567890',
  };
};

export const createBankTransfer = async (userId: string, data: any) => {
  const { requested_amount } = data;
  const topUpRequest = await prisma.topupRequest.create({
    data: {
      user_id: userId,
      method: 'BANK_TRANSFER',
      requested_amount,
      transfer_code: `TOP_${userId.substring(0, 8)}_${Date.now()}`,
    },
  });
  return topUpRequest;
};

export const processOrder = async (userId: string, data: any) => {
  const { orderId, paymentMethod } = data;

  if (paymentMethod === PaymentMethod.WALLET) {
    return payWithWallet(userId, orderId);
  } else {
    // Handle other payment methods here
    throw new Error('Payment method not supported');
  }
};

export const getOrderStatus = async (orderId: string) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      status: true,
      payment_status: true,
    },
  });
  return order;
};

export const payWithWallet = async (userId: string, orderId: string) => {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  const wallet = await prisma.userWallet.findUnique({ where: { user_id: userId } });

  if (!order || !wallet) {
    throw new Error('Order or wallet not found');
  }

  if (wallet.balance < order.final_amount) {
    throw new Error('Insufficient balance');
  }

  const newBalance = wallet.balance.toNumber() - order.final_amount.toNumber();

  const transaction = await prisma.$transaction([
    prisma.userWallet.update({
      where: { user_id: userId },
      data: {
        balance: newBalance,
        total_spent: {
          increment: order.final_amount,
        },
      },
    }),
    prisma.walletTransaction.create({
      data: {
        user_id: userId,
        type: WalletTransactionType.PURCHASE,
        amount: order.final_amount,
        balance_before: wallet.balance,
        balance_after: newBalance,
        reference_type: 'ORDER',
        reference_id: orderId,
      },
    }),
    prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.COMPLETED,
        payment_status: PaymentStatus.PAID,
      },
    }),
  ]);

  return transaction;
};
