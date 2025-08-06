import { Router } from 'express';
import { protect } from '../../middleware/auth'; // Corrected import
import { upload } from '../../middleware/multer'; // Assuming you have a multer setup for file uploads
import {
    createTicket,
    getUserTickets,
    getTicketDetails,
    closeTicket,
    reopenTicket,
    sendMessage,
    getTicketMessages,
    uploadTicketAttachment,
    getTicketAttachment,
    deleteMessage,
    submitTicketRating,
    getTicketRating,
    getTicketCategories
} from '../../controllers/user/tickets';

const router = Router();

// User Ticket Management
router.post('/', protect, createTicket);
router.get('/', protect, getUserTickets);
router.get('/:id', protect, getTicketDetails);
router.put('/:id/close', protect, closeTicket);
router.post('/:id/reopen', protect, reopenTicket);

// Ticket Messages & Chat
router.get('/:id/messages', protect, getTicketMessages);
router.post('/:id/messages', protect, sendMessage);
router.post('/:id/attachments', protect, upload.single('attachment'), uploadTicketAttachment); // 'attachment' is the field name for the file
router.get('/:id/attachments/:fileId', protect, getTicketAttachment);
router.delete('/:id/messages/:messageId', protect, deleteMessage);

// Ticket Rating & Feedback
router.post('/:id/rating', protect, submitTicketRating);
router.get('/:id/rating', protect, getTicketRating);

// Categories & Configuration (User can view, not modify)
router.get('/categories', protect, getTicketCategories);

export default router;
