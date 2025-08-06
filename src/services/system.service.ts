import prisma from '../lib/prisma';
import { WalletTransactionType, OrderStatus, PaymentStatus } from '@prisma/client';
import { payWithWallet } from './payment.service';

export const chargeWallet = async (userId: string, orderId: string) => {
  return payWithWallet(userId, orderId);
};

export const refundWallet = async (
  userId: string,
  orderId: string,
  amount: number,
  reason: string
) => {
  const wallet = await prisma.userWallet.findUnique({
    where: { user_id: userId },
  });

  if (!wallet) {
    throw new Error('Wallet not found');
  }

  const newBalance = wallet.balance.toNumber() + amount;

  const transaction = await prisma.$transaction([
    prisma.userWallet.update({
      where: { user_id: userId },
      data: {
        balance: newBalance,
      },
    }),
    prisma.walletTransaction.create({
      data: {
        user_id: userId,
        type: WalletTransactionType.REFUND,
        amount: amount,
        balance_before: wallet.balance,
        balance_after: newBalance,
        description: reason,
        reference_type: 'ORDER',
        reference_id: orderId,
      },
    }),
    prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.REFUNDED,
        payment_status: PaymentStatus.REFUNDED,
      },
    }),
  ]);

  return transaction;
};

export const validatePayment = async (data: any) => {
  // This is a placeholder for a more complex validation logic
  console.log('Validating payment:', data);
  return {
    success: true,
    message: 'Payment is valid',
  };
};
