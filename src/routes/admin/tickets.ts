import { Router } from 'express';
import { authenticate, checkRole } from '../../middleware/auth';
import { AdminTicketsController } from '../../controllers/admin/tickets';

const router = Router();

router.get('/tickets', authenticate, checkRole(['ADMIN']), AdminTicketsController.getAllTickets);
router.get('/tickets/stats', authenticate, checkRole(['ADMIN']), AdminTicketsİController.getTicketStats);
router.get('/tickets/:id', authenticate, checkRole(['ADMIN']), AdminTicketsController.getTicketById);
router.put('/tickets/:id/assign', authenticate, checkRole(['ADMIN']), AdminTicketsController.assignTicket);
router.put('/tickets/:id/status', authenticate, checkRole(['ADMIN']), AdminTicketsController.updateTicketStatus);
router.put('/tickets/:id/priority', authenticate, checkRole(['ADMIN']), AdminTicketsController.updateTicketPriority);
router.post('/tickets/:id/escalate', authenticate, checkRole(['ADMIN']), AdminTicketsController.escalateTicket);
router.post('/tickets/:id/internal-note', authenticate, checkRole(['ADMIN']), AdminTicketsController.addInternalNote);
router.post('/tickets/bulk-action', authenticate, checkRole(['ADMIN']), AdminTicketsController.bulkTicketAction);

router.post('/tickets/:id/messages', authenticate, checkRole(['ADMIN']), AdminTicketsController.addAdminReply);
router.post('/tickets/:id/template', authenticate, checkRole(['ADMIN']), AdminTicketsController.useResponseTemplate);

router.get('/response-templates', authenticate, checkRole(['ADMIN']), AdminTicketsController.getResponseTemplates);
router.post('/response-templates', authenticate, checkRole(['ADMIN']), AdminTicketsController.createResponseTemplate);
router.put('/response-templates/:id', authenticate, checkRole(['ADMIN']), AdminTicketsController.updateResponseTemplate);
router.delete('/response-templates/:id', authenticate, checkRole(['ADMIN']), AdminTicketsController.deleteResponseTemplate);

router.get('/ticket-categories', authenticate, checkRole(['ADMIN']), AdminTicketsController.getTicketCategories);
router.post('/ticket-categories', authenticate, checkRole(['ADMIN']), AdminTicketsController.createTicketCategory);
router.put('/ticket-categories/:id', authenticate, checkRole(['ADMIN']), AdminTicketsController.updateTicketCategory);
router.delete('/ticket-categories/:id', authenticate, checkRole(['ADMIN']), AdminTicketsController.deleteTicketCategory);

router.get('/sla-policies', authenticate, checkRole(['ADMIN']), AdminTicketsController.getSlaPolicies);
router.put('/sla-policies/:id', authenticate, checkRole(['ADMIN']), AdminTicketsController.updateSlaPolicy);
router.get('/tickets/sla-breaches', authenticate, checkRole(['ADMIN']), AdminTicketsController.getSlaBreaches);

router.get('/tickets/analytics', authenticate, checkRole(['ADMIN']), AdminTicketsController.getTicketAnalytics);
router.get('/tickets/performance', authenticate, checkRole(['ADMIN']), AdminTicketsController.getAdminPerformance);
router.get('/tickets/reports', authenticate, checkRole(['ADMIN']), AdminTicketsController.getCustomReports);
router.post('/tickets/export', authenticate, checkRole(['ADMIN']), AdminTicketsController.exportTickets);

export default router;
