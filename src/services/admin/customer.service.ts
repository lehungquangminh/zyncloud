import prisma from '../../lib/prisma';
import { UserStatus } from '@prisma/client';

export const getAllCustomers = async (filters: any) => {
  const { search, status } = filters;
  const where: any = {};

  if (search) {
    where.OR = [
      { username: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { first_name: { contains: search, mode: 'insensitive' } },
      { last_name: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (status) {
    where.status = status;
  }

  return prisma.user.findMany({
    where,
    orderBy: {
      created_at: 'desc',
    },
  });
};

export const getCustomerById = async (id: string) => {
  return prisma.user.findUnique({
    where: { id },
    include: {
      orders: true,
      user_servers: true,
      pterodactyl_user: true,
    },
  });
};

export const getCustomerOrders = async (id: string) => {
  return prisma.order.findMany({
    where: { user_id: id },
    orderBy: {
      created_at: 'desc',
    },
  });
};

export const getCustomerServers = async (id: string) => {
  return prisma.userServer.findMany({
    where: { user_id: id },
    orderBy: {
      created_at: 'desc',
    },
  });
};

export const updateCustomerStatus = async (id: string, status: UserStatus) => {
  return prisma.user.update({
    where: { id },
    data: { status },
  });
};

export const getPterodactylAccount = async (id: string) => {
  return prisma.pterodactylUser.findUnique({
    where: { user_id: id },
  });
};
