
import { PrismaClient } from '@prisma/client';
import { generateTicketNumber } from '../../utils/id-generator'; // Corrected path

const prisma = new PrismaClient();

export class UserTicketService {
    /**
     * Creates a new support ticket.
     * @param userId The ID of the user creating the ticket.
     * @param categoryId The ID of the ticket category.
     * @param title The title of the ticket.
     * @param description The detailed description of the issue.
     * @param priority The priority of the ticket (optional, defaults to NORMAL).
     * @returns The newly created ticket.
     */
    async createTicket(userId: string, categoryId: string, title: string, description: string, priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT') {
        const ticketNumber = generateTicketNumber();

        // Basic validation for category and user existence (can be enhanced with middleware)
        const category = await prisma.ticketCategory.findUnique({ where: { id: categoryId } });
        if (!category) {
            throw new Error('Ticket category not found.');
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new Error('User not found.');
        }

        const newTicket = await prisma.ticket.create({
            data: {
                ticket_number: ticketNumber,
                user_id: userId,
                category_id: categoryId,
                title,
                description,
                priority: priority || 'NORMAL',
                status: 'OPEN',
                last_activity_at: new Date(),
            },
        });

        // Add an initial message for the ticket creation
        await prisma.ticketMessage.create({
            data: {
                ticket_id: newTicket.id,
                user_id: userId,
                message: `Ticket created: ${title}`,
                message_type: 'STATUS_CHANGE', // Or a custom 'TICKET_CREATE' type
                is_admin_reply: false,
                is_internal: false,
            },
        });

        return newTicket;
    }

    /**
     * Retrieves a list of tickets for a specific user.
     * @param userId The ID of the user.
     * @param page The page number for pagination.
     * @param limit The number of tickets per page.
     * @param status Optional. Filter by ticket status.
     * @param categoryId Optional. Filter by category ID.
     * @returns A paginated list of tickets.
     */
    async getUserTickets(userId: string, page: number = 1, limit: number = 10, status?: string, categoryId?: string) {
        const skip = (page - 1) * limit;
        const where: any = { user_id: userId };

        if (status) {
            where.status = status;
        }
        if (categoryId) {
            where.category_id = categoryId;
        }

        const [tickets, total] = await Promise.all([
            prisma.ticket.findMany({
                where,
                skip,
                take: limit,
                orderBy: { created_at: 'desc' },
                include: { category: true, assigned_admin: true },
            }),
            prisma.ticket.count({ where }),
        ]);

        return {
            tickets,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    /**
     * Retrieves the details of a specific ticket for a user.
     * @param ticketId The ID of the ticket.
     * @param userId The ID of the user (for authorization).
     * @returns The ticket details.
     */
    async getTicketDetails(ticketId: string, userId: string) {
        const ticket = await prisma.ticket.findUnique({
            where: { id: ticketId, user_id: userId },
            include: {
                category: true,
                assigned_admin: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        first_name: true,
                        last_name: true,
                    },
                },
                messages: {
                    orderBy: { created_at: 'asc' },
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                                email: true,
                                first_name: true,
                                last_name: true,
                            },
                        },
                        attachments: true,
                    },
                },
                attachments: true,
                rating: true,
            },
        });

        if (!ticket) {
            throw new Error('Ticket not found or unauthorized access.');
        }
        return ticket;
    }

    /**
     * Allows a user to close their own ticket.
     * @param ticketId The ID of the ticket.
     * @param userId The ID of the user.
     * @returns The updated ticket.
     */
    async closeTicket(ticketId: string, userId: string) {
        const ticket = await prisma.ticket.findUnique({ where: { id: ticketId, user_id: userId } });
        if (!ticket) {
            throw new Error('Ticket not found or unauthorized access.');
        }
        if (ticket.status === 'CLOSED' || ticket.status === 'RESOLVED') {
            throw new Error('Ticket is already closed or resolved.');
        }

        const updatedTicket = await prisma.ticket.update({
            where: { id: ticketId },
            data: {
                status: 'CLOSED',
                closed_at: new Date(),
                last_activity_at: new Date(),
            },
        });

        await prisma.ticketMessage.create({
            data: {
                ticket_id: ticket.id,
                user_id: userId,
                message: 'Ticket closed by user.',
                message_type: 'STATUS_CHANGE',
                is_admin_reply: false,
            },
        });

        return updatedTicket;
    }

    /**
     * Allows a user to reopen a closed ticket.
     * @param ticketId The ID of the ticket.
     * @param userId The ID of the user.
     * @returns The updated ticket.
     */
    async reopenTicket(ticketId: string, userId: string) {
        const ticket = await prisma.ticket.findUnique({ where: { id: ticketId, user_id: userId } });
        if (!ticket) {
            throw new Error('Ticket not found or unauthorized access.');
        }
        if (ticket.status !== 'CLOSED' && ticket.status !== 'RESOLVED') {
            throw new Error('Only closed or resolved tickets can be reopened.');
        }

        const updatedTicket = await prisma.ticket.update({
            where: { id: ticketId },
            data: {
                status: 'REOPENED', // Assuming REOPENED is a valid status, or revert to OPEN/IN_PROGRESS
                closed_at: null,
                resolved_at: null,
                last_activity_at: new Date(),
            },
        });

        await prisma.ticketMessage.create({
            data: {
                ticket_id: ticket.id,
                user_id: userId,
                message: 'Ticket reopened by user.',
                message_type: 'STATUS_CHANGE',
                is_admin_reply: false,
            },
        });

        return updatedTicket;
    }

    /**
     * Sends a new message to a ticket.
     * @param ticketId The ID of the ticket.
     * @param userId The ID of the user sending the message.
     * @param messageContent The content of the message.
     * @param attachmentsData Optional. Array of attachment data.
     * @returns The new message.
     */
    async sendMessage(ticketId: string, userId: string, messageContent: string, attachmentsData?: any[]) {
        const ticket = await prisma.ticket.findUnique({ where: { id: ticketId, user_id: userId } });
        if (!ticket) {
            throw new Error('Ticket not found or unauthorized access.');
        }

        // Update ticket last activity
        await prisma.ticket.update({
            where: { id: ticketId },
            data: {
                last_activity_at: new Date(),
                status: ticket.status === 'CLOSED' || ticket.status === 'RESOLVED' ? 'REOPENED' : ticket.status, // If closed/resolved, reopen on new message
            },
        });

        const newMessage = await prisma.ticketMessage.create({
            data: {
                ticket_id: ticketId,
                user_id: userId,
                message: messageContent,
                is_admin_reply: false,
                attachments_data: attachmentsData ? JSON.stringify(attachmentsData) : null,
            },
        });

        // If attachments are provided, create individual attachment records
        if (attachmentsData && attachmentsData.length > 0) {
            const attachmentRecords = attachmentsData.map(att => ({
                ticket_id: ticketId,
                message_id: newMessage.id,
                user_id: userId,
                original_filename: att.original_filename,
                stored_filename: att.stored_filename,
                file_path: att.file_path,
                file_size: att.file_size,
                file_type: att.file_type,
                mime_type: att.mime_type,
            }));
            await prisma.ticketAttachment.createMany({ data: attachmentRecords });
        }

        return newMessage;
    }

    /**
     * Retrieves the chat history for a specific ticket.
     * @param ticketId The ID of the ticket.
     * @param userId The ID of the user (for authorization).
     * @returns An array of ticket messages.
     */
    async getTicketMessages(ticketId: string, userId: string) {
        const ticket = await prisma.ticket.findUnique({ where: { id: ticketId, user_id: userId } });
        if (!ticket) {
            throw new Error('Ticket not found or unauthorized access.');
        }

        const messages = await prisma.ticketMessage.findMany({
            where: { ticket_id: ticketId },
            orderBy: { created_at: 'asc' },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        first_name: true,
                        last_name: true,
                    },
                },
                attachments: true,
            },
        });
        return messages;
    }

    /**
     * Uploads a file attachment to a ticket (not tied to a specific message yet).
     * This is for attachments added during ticket creation or general ticket attachments.
     * For attachments in messages, use the sendMessage method's attachmentsData.
     * @param ticketId The ID of the ticket.
     * @param userId The ID of the user.
     * @param attachmentData The data for the attachment.
     * @returns The created attachment record.
     */
    async uploadTicketAttachment(ticketId: string, userId: string, attachmentData: { original_filename: string, stored_filename: string, file_path: string, file_size: number, file_type: string, mime_type: string }) {
        const ticket = await prisma.ticket.findUnique({ where: { id: ticketId, user_id: userId } });
        if (!ticket) {
            throw new Error('Ticket not found or unauthorized access.');
        }

        const attachment = await prisma.ticketAttachment.create({
            data: {
                ticket_id: ticketId,
                user_id: userId,
                ...attachmentData,
            },
        });

        // Optionally, update the ticket's attachments_data JSON field
        const currentAttachments = (ticket.attachments_data as any as any[] || []).concat([{
            id: attachment.id,
            original_filename: attachment.original_filename,
            stored_filename: attachment.stored_filename,
            file_path: attachment.file_path,
            file_size: attachment.file_size,
            mime_type: attachment.mime_type,
        }]);

        await prisma.ticket.update({
            where: { id: ticketId },
            data: {
                attachments_data: currentAttachments,
                last_activity_at: new Date(),
            },
        });

        return attachment;
    }

    /**
     * Downloads a file attachment.
     * Note: Actual file serving logic would be in the controller/route.
     * This method primarily verifies access and retrieves attachment metadata.
     * @param ticketId The ID of the ticket.
     * @param fileId The ID of the attachment.
     * @param userId The ID of the user (for authorization).
     * @returns The attachment metadata.
     */
    async getTicketAttachment(ticketId: string, fileId: string, userId: string) {
        const attachment = await prisma.ticketAttachment.findUnique({
            where: { id: fileId },
            include: { ticket: true, message: true }
        });

        if (!attachment) {
            throw new Error('Attachment not found.');
        }

        // Verify that the user owns the ticket or is an admin
        let isAuthorized = false;
        if (attachment.ticket && attachment.ticket.user_id === userId) {
            isAuthorized = true;
        } else if (attachment.message && attachment.message.ticket && attachment.message.ticket.user_id === userId) {
            isAuthorized = true;
        }
        // Admin authorization check would be separate or higher up in middleware

        if (!isAuthorized) {
            throw new Error('Unauthorized access to attachment.');
        }

        return attachment;
    }

    /**
     * Deletes a user's own message within a certain time limit.
     * @param ticketId The ID of the ticket.
     * @param messageId The ID of the message to delete.
     * @param userId The ID of the user requesting deletion.
     * @param timeLimitMinutes The time limit in minutes within which a message can be deleted.
     * @returns The deleted message record.
     */
    async deleteMessage(ticketId: string, messageId: string, userId: string, timeLimitMinutes: number = 5) {
        const message = await prisma.ticketMessage.findUnique({
            where: { id: messageId, ticket_id: ticketId, user_id: userId },
        });

        if (!message) {
            throw new Error('Message not found or unauthorized access.');
        }
        if (message.is_admin_reply) {
            throw new Error('Cannot delete admin replies.');
        }

        const now = new Date();
        const messageTime = new Date(message.created_at);
        const timeDiff = (now.getTime() - messageTime.getTime()) / (1000 * 60); // Difference in minutes

        if (timeDiff > timeLimitMinutes) {
            throw new Error(`Messages can only be deleted within ${timeLimitMinutes} minutes of creation.`);
        }

        // Soft delete the message
        const deletedMessage = await prisma.ticketMessage.update({
            where: { id: messageId },
            data: {
                deleted_at: new Date(),
                message: '[This message was deleted]',
                attachments_data: null,
            },
        });

        // Also delete associated attachments
        await prisma.ticketAttachment.updateMany({
            where: { message_id: messageId },
            data: {
                message_id: null, // Disassociate from message, but keep for ticket reference if needed
                ticket_id: null, // Or actually delete the file from storage and record
            },
        });

        return deletedMessage;
    }

    /**
     * Submits a rating and feedback for a resolved/closed ticket.
     * @param ticketId The ID of the ticket.
     * @param userId The ID of the user submitting the rating.
     * @param ratingData The rating data.
     * @returns The created ticket rating.
     */
    async submitTicketRating(ticketId: string, userId: string, ratingData: {
        rating: number;
        feedback?: string;
        responseTimeRating?: number;
        solutionQualityRating?: number;
        adminProfessionalismRating?: number;
        wouldRecommend?: boolean;
        allowPublicDisplay?: boolean;
    }) {
        const ticket = await prisma.ticket.findUnique({
            where: { id: ticketId, user_id: userId },
            include: { rating: true }
        });

        if (!ticket) {
            throw new Error('Ticket not found or unauthorized access.');
        }
        if (ticket.status !== 'RESOLVED' && ticket.status !== 'CLOSED') {
            throw new Error('Only resolved or closed tickets can be rated.');
        }
        if (ticket.rating) {
            throw new Error('Ticket has already been rated.');
        }
        if (ratingData.rating < 1 || ratingData.rating > 5) {
            throw new Error('Rating must be between 1 and 5.');
        }

        const adminId = ticket.assigned_admin_id; // Get the admin who handled the ticket

        const newRating = await prisma.ticketRating.create({
            data: {
                ticket_id: ticketId,
                user_id: userId,
                admin_id: adminId,
                rating: ratingData.rating,
                feedback: ratingData.feedback,
                response_time_rating: ratingData.responseTimeRating,
                solution_quality_rating: ratingData.solutionQualityRating,
                admin_professionalism_rating: ratingData.adminProfessionalismRating,
                would_recommend: ratingData.wouldRecommend,
                allow_public_display: ratingData.allowPublicDisplay || false,
            },
        });
        return newRating;
    }

    /**
     * Retrieves the rating details for a specific ticket.
     * @param ticketId The ID of the ticket.
     * @param userId The ID of the user (for authorization).
     * @returns The ticket rating details, or null if not rated.
     */
    async getTicketRating(ticketId: string, userId: string) {
        const ticket = await prisma.ticket.findUnique({ where: { id: ticketId, user_id: userId } });
        if (!ticket) {
            throw new Error('Ticket not found or unauthorized access.');
        }

        const rating = await prisma.ticketRating.findUnique({
            where: { ticket_id: ticketId },
            include: {
                user: { select: { id: true, username: true, first_name: true, last_name: true } },
                admin: { select: { id: true, username: true, first_name: true, last_name: true } },
            },
        });
        return rating;
    }

    /**
     * Retrieves all ticket categories.
     * @returns An array of ticket categories.
     */
    async getTicketCategories() {
        return prisma.ticketCategory.findMany({
            where: { status: 'ACTIVE' },
            orderBy: { sort_order: 'asc' },
        });
    }
}
