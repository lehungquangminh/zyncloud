import { PrismaClient } from '@prisma/client';
import { ServiceStatus } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllServices = async () => {
  return prisma.service.findMany();
};

export const getServiceById = async (id: string) => {
  return prisma.service.findUnique({
    where: { id },
  });
};

export const createService = async (data: any) => {
  return prisma.service.create({
    data,
  });
};

export const updateService = async (id: string, data: any) => {
  return prisma.service.update({
    where: { id },
    data,
  });
};

export const deleteService = async (id: string) => {
  return prisma.service.delete({
    where: { id },
  });
};

export const toggleServiceStatus = async (id: string) => {
  const service = await prisma.service.findUnique({
    where: { id },
  });

  if (!service) {
    throw new Error('Service not found');
  }

  const newStatus =
    service.status === ServiceStatus.ACTIVE
      ? ServiceStatus.INACTIVE
      : ServiceStatus.ACTIVE;

  return prisma.service.update({
    where: { id },
    data: {
      status: newStatus,
    },
  });
};
