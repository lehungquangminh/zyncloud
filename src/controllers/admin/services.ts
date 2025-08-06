import { Request, Response } from 'express';
import {
  getAllServices,
  getServiceById,
  createService as create,
  updateService as update,
  deleteService as remove,
  toggleServiceStatus as toggle,
} from '../../services/admin/service.service';

export const getServices = async (req: Request, res: Response) => {
  const services = await getAllServices();
  res.json(services);
};

export const getService = async (req: Request, res: Response) => {
  const { id } = req.params;
  const serviceItem = await getServiceById(id);
  if (!serviceItem) {
    return res.status(404).json({ message: 'Service not found' });
  }
  res.json(serviceItem);
};

export const createService = async (req: Request, res: Response) => {
  const newService = await create(req.body);
  res.status(201).json(newService);
};

export const updateService = async (req: Request, res: Response) => {
  const { id } = req.params;
  const updatedService = await update(id, req.body);
  res.json(updatedService);
};

export const deleteService = async (req: Request, res: Response) => {
  const { id } = req.params;
  await remove(id);
  res.status(204).send();
};

export const toggleServiceStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const updatedService = await toggle(id);
  res.json(updatedService);
};
