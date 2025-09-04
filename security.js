// Security Module for Salman Support Website
// This file contains all cybersecurity measures
// Comment out the require() in server.js to disable all security during development

import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { body, validationResult } from 'express-validator';
import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import mongoSanitize from 'express-mongo-sanitize';

// Initialize DOMPurify with jsdom
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

// Security middleware configuration
function configureSecurityMiddleware(app) {
    // Helmet for security headers
    app.use(helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'", "https://unpkg.com", "https://cdn.tailwindcss.com"],
                styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com"],
                imgSrc: ["'self'", "data:", "https:"],
                connectSrc: ["'self'", "https://api.convex.cloud", "wss://api.convex.cloud"],
                fontSrc: ["'self'"],
                objectSrc: ["'none'"],
                mediaSrc: ["'self'"],
                frameSrc: ["'self'", "https://www.youtube.com", "https://youtube.com"],
            },
        },
        crossOriginEmbedderPolicy: false
    }));

    // NoSQL injection prevention
    app.use(mongoSanitize());
}

// Rate limiting configurations
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

const noteLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 5, // limit each IP to 5 note submissions per 5 minutes
    message: 'Too many notes submitted, please wait before submitting another.',
    standardHeaders: true,
    legacyHeaders: false,
});

// Input validation middleware
const validateNoteInput = [
    body('message')
        .trim()
        .isLength({ min: 1, max: 500 })
        .withMessage('Message must be between 1 and 500 characters')
        .matches(/^[\w\s.,!?'"-]*$/)
        .withMessage('Message contains invalid characters'),
    body('senderName')
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('Name must be between 1 and 50 characters')
        .matches(/^[\w\s'-]*$/)
        .withMessage('Name contains invalid characters')
];

// Utility function to sanitize HTML more thoroughly
function sanitizeInput(input) {
    if (typeof input !== 'string') return '';
    // Remove any HTML tags and sanitize
    const sanitized = DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
    // Additional filtering for common injection patterns
    return sanitized
        .replace(/<script[^>]*>.*?<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .replace(/data:text\/html/gi, '')
        .trim();
}

// Enhanced HTML escaping utility
function escapeHtml(unsafe) {
    if (typeof unsafe !== 'string') return '';
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;")
         .replace(/\//g, "&#x2F;")
         .replace(/`/g, "&#x60;")
         .replace(/=/g, "&#x3D;");
}

// Additional security utility functions
function isValidImageFormat(filename) {
    const validExtensions = /\.(jpg|jpeg|png|gif|webp)$/i;
    return validExtensions.test(filename);
}

function sanitizeFilename(filename) {
    return filename.replace(/[^a-zA-Z0-9._-]/g, '');
}

// Secure note creation middleware
function createSecureNoteHandler(convex, api) {
    return [noteLimiter, validateNoteInput, async (req, res) => {
        try {
            // Check validation results
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ 
                    error: 'Invalid input', 
                    details: errors.array().map(err => err.msg)
                });
            }

            let { message, senderName } = req.body;
            
            // Additional sanitization
            message = sanitizeInput(message);
            senderName = sanitizeInput(senderName);
            
            if (!message || !senderName) {
                return res.status(400).json({ error: 'Message and sender name are required after sanitization' });
            }

            const noteId = await convex.mutation(api.notes.createNote, {
                message,
                senderName
            });

            res.json({ id: noteId, success: true });
        } catch (error) {
            console.error('Error creating note:', error);
            res.status(500).json({ error: 'Failed to create note' });
        }
    }];
}

// CORS configuration
function getSecureCorsOptions() {
    return {
        origin: process.env.NODE_ENV === 'production' ? 'https://salman.help' : true,
        credentials: true
    };
}

export {
    configureSecurityMiddleware,
    generalLimiter,
    noteLimiter,
    validateNoteInput,
    sanitizeInput,
    escapeHtml,
    isValidImageFormat,
    sanitizeFilename,
    createSecureNoteHandler,
    getSecureCorsOptions
};