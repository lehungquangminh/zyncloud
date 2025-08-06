import prisma from '../../lib/prisma';

export const getAllPackages = async (serviceId: string) => {
  return prisma.package.findMany({
    where: { service_id: serviceId },
    orderBy: {
      base_price: 'asc',
    },
  });
};

export const getPackageById = async (id: string) => {
  return prisma.package.findUnique({
    where: { id },
  });
};

export const createPackage = async (serviceId: string, data: any) => {
  return prisma.package.create({
    data: {
      ...data,
      service: {
        connect: {
          id: serviceId,
        },
      },
    },
  });
};

export const updatePackage = async (id: string, data: any) => {
  return prisma.package.update({
    where: { id },
    data,
  });
};

export const deletePackage = async (id: string) => {
  return prisma.package.delete({
    where: { id },
  });
};

export const reorderPackages = async (packageIds: string[]) => {
  const updates = packageIds.map((id, index) => {
    return prisma.package.update({
      where: { id },
      data: {
        sort_order: index,
      },
    });
  });

  return prisma.$transaction(updates);
};
