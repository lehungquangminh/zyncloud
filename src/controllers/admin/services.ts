import { Request, Response } from 'express';
import * as service from '../../services/admin/service.service';

export const getServices = async (req: Request, res: Response) => {
  const services = await service.getAllServices();
  res.json(services);
};

export const getService = async (req: Request, res: Response) => {
  const { id } = req.params;
  const serviceItem = await service.getServiceById(id);
  if (!serviceItem) {
    return res.status(404).json({ message: 'Service not found' });
  }
  res.json(serviceItem);
};

export const createService = async (req: Request, res: Response) => {
  const newService = await service.createService(req.body);
  res.status(201).json(newService);
};

export const updateService = async (req: Request, res: Response) => {
  const { id } = req.params;
  const updatedService = await service.updateService(id, req.body);
  res.json(updatedService);
};

export const deleteService = async (req: Request, res: Response) => {
  const { id } = req.params;
  await service.deleteService(id);
  res.status(204).send();
};

export const toggleServiceStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const updatedService = await service.toggleServiceStatus(id);
  res.json(updatedService);
};
