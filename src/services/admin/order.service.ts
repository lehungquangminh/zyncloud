import { PrismaClient, OrderStatus, PaymentStatus } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllOrders = async (filters: any) => {
  const { status, startDate, endDate, userId, serviceId } = filters;
  const where: any = {};

  if (status) {
    where.status = status;
  }

  if (startDate && endDate) {
    where.created_at = {
      gte: new Date(startDate),
      lte: new Date(endDate),
    };
  }

  if (userId) {
    where.user_id = userId;
  }

  if (serviceId) {
    where.service_id = serviceId;
  }

  return prisma.order.findMany({
    where,
    include: {
      user: true,
      service: true,
      package: true,
    },
    orderBy: {
      created_at: 'desc',
    },
  });
};

export const getOrderById = async (id: string) => {
  return prisma.order.findUnique({
    where: { id },
    include: {
      user: true,
      service: true,
      package: true,
      user_servers: true,
    },
  });
};

export const updateOrderStatus = async (id: string, status: OrderStatus) => {
  return prisma.order.update({
    where: { id },
    data: { status },
  });
};

export const refundOrder = async (
  id: string,
  amount: number,
  reason: string
) => {
  return prisma.order.update({
    where: { id },
    data: {
      status: OrderStatus.REFUNDED,
      payment_status: PaymentStatus.REFUNDED,
      discount_amount: amount,
      admin_notes: reason,
    },
  });
};

export const updateOrderNotes = async (id: string, notes: string) => {
  return prisma.order.update({
    where: { id },
    data: {
      admin_notes: notes,
    },
  });
};

export const getOrderStats = async () => {
  // This is a simplified version of the stats.
  // A more complex implementation would involve more detailed queries.
  const totalOrders = await prisma.order.count();
  const totalRevenue = await prisma.order.aggregate({
    _sum: {
      final_amount: true,
    },
    where: {
      payment_status: PaymentStatus.PAID,
    },
  });

  return {
    totalOrders,
    totalRevenue: totalRevenue._sum.final_amount,
  };
};
