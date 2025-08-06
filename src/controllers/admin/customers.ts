import { Request, Response } from 'express';
import * as service from '../../services/admin/customer.service';

export const getCustomers = async (req: Request, res: Response) => {
  const customers = await service.getAllCustomers(req.query);
  res.json(customers);
};

export const getCustomer = async (req: Request, res: Response) => {
  const { id } = req.params;
  const customer = await service.getCustomerById(id);
  if (!customer) {
    return res.status(404).json({ message: 'Customer not found' });
  }
  res.json(customer);
};

export const getCustomerOrders = async (req: Request, res: Response) => {
  const { id } = req.params;
  const orders = await service.getCustomerOrders(id);
  res.json(orders);
};

export const getCustomerServers = async (req: Request, res: Response) => {
  const { id } = req.params;
  const servers = await service.getCustomerServers(id);
  res.json(servers);
};

export const updateCustomerStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const updatedCustomer = await service.updateCustomerStatus(id, status);
  res.json(updatedCustomer);
};

export const getPterodactylAccount = async (req: Request, res: Response) => {
  const { id } = req.params;
  const pterodactylAccount = await service.getPterodactylAccount(id);
  if (!pterodactylAccount) {
    return res.status(404).json({ message: 'Pterodactyl account not found' });
  }
  res.json(pterodactylAccount);
};
