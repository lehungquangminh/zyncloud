
import { Request, Response } from 'express';
import { UserTicketService } from '../../services/user/ticket.service';
import { logger } from '../../utils/logger'; // Assuming a logger utility exists

const userTicketService = new UserTicketService();

export const createTicket = async (req: Request, res: Response) => {
    try {
        const { categoryId, title, description, priority } = req.body;
        const userId = req.user?.id; // Assuming user ID is available from authentication middleware

        if (!userId || !categoryId || !title || !description) {
            return res.status(400).json({ success: false, message: 'Missing required fields: userId, categoryId, title, description' });
        }

        const newTicket = await userTicketService.createTicket(userId, categoryId, title, description, priority);
        res.status(201).json({ success: true, message: 'Ticket created successfully', data: newTicket });
    } catch (error: any) {
        logger.error('Error creating ticket:', error);
        res.status(500).json({ success: false, message: 'Failed to create ticket', error: error.message });
    }
};

export const getUserTickets = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const status = req.query.status as string;
        const categoryId = req.query.categoryId as string;

        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized: User ID not found' });
        }

        const tickets = await userTicketService.getUserTickets(userId, page, limit, status, categoryId);
        res.status(200).json({ success: true, message: 'User tickets retrieved successfully', data: tickets });
    } catch (error: any) {
        logger.error('Error fetching user tickets:', error);
        res.status(500).json({ success: false, message: 'Failed to retrieve user tickets', error: error.message });
    }
};

export const getTicketDetails = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized: User ID not found' });
        }

        const ticket = await userTicketService.getTicketDetails(id, userId);
        res.status(200).json({ success: true, message: 'Ticket details retrieved successfully', data: ticket });
    } catch (error: any) {
        logger.error('Error fetching ticket details:', error);
        // Distinguish between not found/unauthorized and other errors
        if (error.message.includes('not found') || error.message.includes('unauthorized')) {
            return res.status(404).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: 'Failed to retrieve ticket details', error: error.message });
    }
};

export const closeTicket = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized: User ID not found' });
        }

        const updatedTicket = await userTicketService.closeTicket(id, userId);
        res.status(200).json({ success: true, message: 'Ticket closed successfully', data: updatedTicket });
    } catch (error: any) {
        logger.error('Error closing ticket:', error);
        if (error.message.includes('not found') || error.message.includes('unauthorized')) {
            return res.status(404).json({ success: false, message: error.message });
        }
        res.status(400).json({ success: false, message: error.message, error: error.message });
    }
};

export const reopenTicket = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized: User ID not found' });
        }

        const updatedTicket = await userTicketService.reopenTicket(id, userId);
        res.status(200).json({ success: true, message: 'Ticket reopened successfully', data: updatedTicket });
    } catch (error: any) {
        logger.error('Error reopening ticket:', error);
        if (error.message.includes('not found') || error.message.includes('unauthorized')) {
            return res.status(404).json({ success: false, message: error.message });
        }
        res.status(400).json({ success: false, message: error.message, error: error.message });
    }
};

export const sendMessage = async (req: Request, res: Response) => {
    try {
        const { id } = req.params; // Ticket ID
        const userId = req.user?.id;
        const { message, attachments } = req.body; // attachments is an array of objects

        if (!userId || !message) {
            return res.status(400).json({ success: false, message: 'Message content is required.' });
        }

        const newMessage = await userTicketService.sendMessage(id, userId, message, attachments);
        res.status(201).json({ success: true, message: 'Message sent successfully', data: newMessage });
    } catch (error: any) {
        logger.error('Error sending message:', error);
        if (error.message.includes('not found') || error.message.includes('unauthorized')) {
            return res.status(404).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: 'Failed to send message', error: error.message });
    }
};

export const getTicketMessages = async (req: Request, res: Response) => {
    try {
        const { id } = req.params; // Ticket ID
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized: User ID not found' });
        }

        const messages = await userTicketService.getTicketMessages(id, userId);
        res.status(200).json({ success: true, message: 'Ticket messages retrieved successfully', data: messages });
    } catch (error: any) {
        logger.error('Error fetching ticket messages:', error);
        if (error.message.includes('not found') || error.message.includes('unauthorized')) {
            return res.status(404).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: 'Failed to retrieve ticket messages', error: error.message });
    }
};

export const uploadTicketAttachment = async (req: Request, res: Response) => {
    try {
        const { id } = req.params; // Ticket ID
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized: User ID not found' });
        }

        // Assuming file upload is handled by a middleware like `multer`
        // and file info is available in req.file or req.files
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded.' });
        }

        const attachmentData = {
            original_filename: req.file.originalname,
            stored_filename: req.file.filename,
            file_path: req.file.path, // Or a URL where the file is accessible
            file_size: req.file.size,
            file_type: req.file.mimetype.split('/')[0], // e.g., 'image', 'application'
            mime_type: req.file.mimetype,
        };

        const newAttachment = await userTicketService.uploadTicketAttachment(id, userId, attachmentData);
        res.status(201).json({ success: true, message: 'Attachment uploaded successfully', data: newAttachment });
    } catch (error: any) {
        logger.error('Error uploading attachment:', error);
        if (error.message.includes('not found') || error.message.includes('unauthorized')) {
            return res.status(404).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: 'Failed to upload attachment', error: error.message });
    }
};

export const getTicketAttachment = async (req: Request, res: Response) => {
    try {
        const { id: ticketId, fileId } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized: User ID not found' });
        }

        const attachment = await userTicketService.getTicketAttachment(ticketId, fileId, userId);

        // In a real application, you would stream the file from file_path
        // For now, just return the metadata
        res.status(200).json({ success: true, message: 'Attachment details retrieved successfully', data: attachment });
    } catch (error: any) {
        logger.error('Error fetching attachment details:', error);
        if (error.message.includes('not found') || error.message.includes('unauthorized')) {
            return res.status(404).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: 'Failed to retrieve attachment details', error: error.message });
    }
};

export const deleteMessage = async (req: Request, res: Response) => {
    try {
        const { id: ticketId, messageId } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized: User ID not found' });
        }

        const deletedMessage = await userTicketService.deleteMessage(ticketId, messageId, userId);
        res.status(200).json({ success: true, message: 'Message deleted successfully', data: deletedMessage });
    } catch (error: any) {
        logger.error('Error deleting message:', error);
        if (error.message.includes('not found') || error.message.includes('unauthorized')) {
            return res.status(404).json({ success: false, message: error.message });
        }
        res.status(400).json({ success: false, message: error.message, error: error.message });
    }
};

export const submitTicketRating = async (req: Request, res: Response) => {
    try {
        const { id } = req.params; // Ticket ID
        const userId = req.user?.id;
        const ratingData = req.body;

        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized: User ID not found' });
        }

        const newRating = await userTicketService.submitTicketRating(id, userId, ratingData);
        res.status(201).json({ success: true, message: 'Ticket rating submitted successfully', data: newRating });
    } catch (error: any) {
        logger.error('Error submitting ticket rating:', error);
        if (error.message.includes('not found') || error.message.includes('unauthorized')) {
            return res.status(404).json({ success: false, message: error.message });
        }
        res.status(400).json({ success: false, message: error.message, error: error.message });
    }
};

export const getTicketRating = async (req: Request, res: Response) => {
    try {
        const { id } = req.params; // Ticket ID
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized: User ID not found' });
        }

        const rating = await userTicketService.getTicketRating(id, userId);
        res.status(200).json({ success: true, message: 'Ticket rating retrieved successfully', data: rating });
    } catch (error: any) {
        logger.error('Error fetching ticket rating:', error);
        if (error.message.includes('not found') || error.message.includes('unauthorized')) {
            return res.status(404).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: 'Failed to retrieve ticket rating', error: error.message });
    }
};

export const getTicketCategories = async (req: Request, res: Response) => {
    try {
        const categories = await userTicketService.getTicketCategories();
        res.status(200).json({ success: true, message: 'Ticket categories retrieved successfully', data: categories });
    } catch (error: any) {
        logger.error('Error fetching ticket categories:', error);
        res.status(500).json({ success: false, message: 'Failed to retrieve ticket categories', error: error.message });
    }
};
