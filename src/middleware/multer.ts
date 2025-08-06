
import multer from 'multer';
import path from 'path';
import { Request } from 'express';

// Configure storage for uploaded files
const storage = multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb) => {
        // Define the destination folder for uploads
        // You might want to categorize uploads by ticket ID or user ID in a real app
        cb(null, './uploads/attachments/');
    },
    filename: (req: Request, file: Express.Multer.File, cb) => {
        // Generate a unique filename to prevent overwrites
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    },
});

// Filter for allowed file types (optional, but recommended for security)
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedMimeTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        // Add more allowed types as needed
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only images, PDFs, documents, and text files are allowed.'), false);
    }
};

// Initialize multer upload middleware
export const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 10, // 10 MB file size limit
    },
});
