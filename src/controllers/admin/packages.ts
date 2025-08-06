import { Request, Response } from 'express';
import * as service from '../../services/admin/package.service';

export const getPackages = async (req: Request, res: Response) => {
  const { serviceId } = req.params;
  const packages = await service.getAllPackages(serviceId);
  res.json(packages);
};

export const getPackage = async (req: Request, res: Response) => {
  const { id } = req.params;
  const packageItem = await service.getPackageById(id);
  if (!packageItem) {
    return res.status(404).json({ message: 'Package not found' });
  }
  res.json(packageItem);
};

export const createPackage = async (req: Request, res: Response) => {
  const { serviceId } = req.params;
  const newPackage = await service.createPackage(serviceId, req.body);
  res.status(201).json(newPackage);
};

export const updatePackage = async (req: Request, res: Response) => {
  const { id } = req.params;
  const updatedPackage = await service.updatePackage(id, req.body);
  res.json(updatedPackage);
};

export const deletePackage = async (req: Request, res: Response) => {
  const { id } = req.params;
  await service.deletePackage(id);
  res.status(204).send();
};

export const reorderPackages = async (req: Request, res: Response) => {
  const { packageIds } = req.body;
  await service.reorderPackages(packageIds);
  res.status(204).send();
};
