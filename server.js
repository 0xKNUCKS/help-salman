import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { ConvexHttpClient } from 'convex/browser';
import { api } from './convex/_generated/api.js';

// ES module compatibility setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize dotenv
dotenv.config();

// Security module (comment out the next line to disable all security during development)
import * as security from './security.js';

// Initialize the server
async function startServer() {
    const app = express();
    const PORT = process.env.PORT || 3000;

    // Railway deployment support
    if (!process.env.PORT) {
        console.log('⚠️  PORT environment variable not set, using default port 3000');
    }

    // Initialize Convex client
    const convex = new ConvexHttpClient(process.env.CONVEX_URL);

    // Apply security middleware (comment out to disable during development)
    if (security) {
        security.configureSecurityMiddleware(app);
        app.use(security.generalLimiter);
    }

    // Middleware
    app.use(cors(security ? security.getSecureCorsOptions() : {}));
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    app.use('/static', express.static('static'));

    // Serve templates directory
    app.use('/templates', express.static('templates'));

    // Routes
    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, 'templates', 'index.html'));
    });

    app.get('/write-note', (req, res) => {
        res.sendFile(path.join(__dirname, 'templates', 'write_note.html'));
    });

    app.get('/gallery', (req, res) => {
        res.sendFile(path.join(__dirname, 'templates', 'gallery.html'));
    });

    app.get('/modal/note', (req, res) => {
        res.sendFile(path.join(__dirname, 'templates', 'note-modal.html'));
    });

    app.get("/healthz", (req, res) => res.status(200).send("ok"));

    app.set("trust proxy", 1); // Railway terminates TLS before your app
    app.use((req, res, next) => {
        // Only redirect if truly needed; rely on X-Forwarded-Proto
        if (process.env.NODE_ENV === "production" && req.headers["x-forwarded-proto"] !== "https") {
            return res.redirect(301, "https://" + req.headers.host + req.originalUrl);
        }
        next();
    });

    // API Routes
    if (security) {
        // Use secure note handler with all security measures
        app.post('/api/notes', ...security.createSecureNoteHandler(convex, api));
    } else {
        // Development mode - minimal validation only
        app.post('/api/notes', async (req, res) => {
            try {
                const { message, senderName } = req.body;

                if (!message || !senderName) {
                    return res.status(400).json({ error: 'Message and sender name are required' });
                }

                const noteId = await convex.mutation(api.notes.createNote, {
                    message: message.trim(),
                    senderName: senderName.trim()
                });

                res.json({ id: noteId, success: true });
            } catch (error) {
                console.error('Error creating note:', error);
                res.status(500).json({ error: 'Failed to create note' });
            }
        });
    }

    app.get('/api/messages/recent', async (req, res) => {
        try {
            const limit = req.query.limit ? parseInt(req.query.limit) : 6;
            const notes = await convex.query(api.notes.getRecentNotes, { limit });

            // Convert to HTML for HTMX with regulated positioning and spacing
            const escapeFunction = security ? security.escapeHtml : (text) => text;
            
            // Calculate optimized positions for all notes
            const positions = [];
            for (let i = 0; i < notes.length; i++) {
                const col = i % 2;
                const row = Math.floor(i / 2);
                const baseLeft = col === 0 ? 15 + (Math.random() * 20) : 55 + (Math.random() * 20);
                const baseTop = (row * 130) + (Math.random() * 50);
                positions.push({
                    left: Math.min(baseLeft, 70),
                    top: baseTop
                });
            }
            
            const notesHtml = notes.map((note, index) => {
                const size = Math.floor(Math.random() * 4) + 1;
                const color = ['yellow', 'pink', 'green', 'orange', 'cyan'][Math.floor(Math.random() * 5)];
                const rotation = Math.floor(Math.random() * 6) + 1;
                const position = positions[index];

                return `
                    <div class="note note-size-${size} note-color-${color} note-rotate-${rotation}" 
                         style="left: ${position.left}%; top: ${position.top}px;">
                        <div class="note-content">${escapeFunction(note.message)}</div>
                        <div class="note-sender">- ${escapeFunction(note.senderName)}</div>
                    </div>
                `;
            }).join('');

            res.send(notesHtml);
        } catch (error) {
            console.error('Error fetching recent notes:', error);
            res.status(500).send('<div class="error">Failed to load notes</div>');
        }
    });

    app.get('/api/messages/all', async (req, res) => {
        try {
            const notes = await convex.query(api.notes.getAllNotes);

            // Convert to HTML for HTMX with regulated grid positioning and spacing
            const escapeFunction = security ? security.escapeHtml : (text) => text;
            
            // Calculate optimized positions for better spacing
            const positions = [];
            for (let i = 0; i < notes.length; i++) {
                const gridCols = 4;
                const row = Math.floor(i / gridCols);
                const col = i % gridCols;
                
                const baseLeft = (col * 20) + (Math.random() * 8); // Tighter columns
                const baseTop = (row * 160) + (Math.random() * 60); // Closer rows
                
                positions.push({
                    left: Math.max(8, Math.min(baseLeft, 72)),
                    top: Math.max(20, baseTop)
                });
            }
            
            const notesHtml = notes.map((note, index) => {
                const size = Math.floor(Math.random() * 4) + 1;
                const color = ['yellow', 'pink', 'green', 'orange', 'cyan'][Math.floor(Math.random() * 5)];
                const rotation = Math.floor(Math.random() * 6) + 1;
                const position = positions[index];

                return `
                    <div class="note note-size-${size} note-color-${color} note-rotate-${rotation}" 
                         style="left: ${position.left}%; top: ${position.top}px;">
                        <div class="note-content">${escapeFunction(note.message)}</div>
                        <div class="note-sender">- ${escapeFunction(note.senderName)}</div>
                        <div class="note-date">${new Date(note.createdAt).toLocaleDateString()}</div>
                    </div>
                `;
            }).join('');

            res.send(notesHtml);
        } catch (error) {
            console.error('Error fetching all notes:', error);
            res.status(500).send('<div class="error">Failed to load notes</div>');
        }
    });


    // Function to load carousel images from file (Convex file IDs)
    function loadCarouselImages() {
        try {
            const filePath = path.join(__dirname, 'carousel-pic-ids.txt');
            const fileContent = fs.readFileSync(filePath, 'utf8');
            const lines = fileContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));

            return lines.map((line, index) => {
                const trimmedLine = line.trim();
                if (trimmedLine.includes('|')) {
                    // Old format: fileId|caption|altText
                    const parts = trimmedLine.split('|');
                    return {
                        fileId: parts[0]?.trim() || '',
                        caption: parts[1]?.trim() || 'No caption',
                        altText: parts[2]?.trim() || parts[1]?.trim() || 'Salman photo'
                    };
                } else {
                    // New format: just fileId
                    return {
                        fileId: trimmedLine,
                        caption: `Salman photo ${index + 1}`,
                        altText: `Salman photo ${index + 1}`
                    };
                }
            }).filter(img => img.fileId);
        } catch (error) {
            console.error('Error loading carousel images:', error);
            // Fallback to empty array
            return [];
        }
    }

    // Carousel routes using local file approach
    app.get('/api/carousel/:index', async (req, res) => {
        try {
            // Get images from text file
            const images = loadCarouselImages();

            if (images.length === 0) {
                const imageHtml = `
                    <div class="carousel-slide">
                        <div class="carousel-placeholder">
                            <div style="width: 300px; height: 200px; border: 3px solid black; background-color: #f0f0f0; display: flex; align-items: center; justify-content: center; margin: 0 auto;">
                                <font size="2" color="gray">No images configured yet</font>
                            </div>
                        </div>
                        <div class="carousel-caption">Add image paths to carousel-pic-ids.txt!</div>
                        <div class="carousel-counter">0 / 0</div>
                    </div>
                `;
                return res.send(imageHtml);
            }

            const index = parseInt(req.params.index) || 0;
            const image = images[index % images.length];
            const escapeFunction = security ? security.escapeHtml : escapeHtml;

            const imageHtml = `
                <div class="carousel-slide">
                    <img src="${image.fileId}" 
                         alt="${escapeFunction(image.altText)}"
                         class="carousel-image"
                         onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                    <div class="carousel-error" style="display: none; width: 300px; height: 200px; border: 3px solid black; background-color: #ffcccc; align-items: center; justify-content: center; margin: 0 auto;">
                        <font size="2" color="red">Image failed to load</font>
                    </div>
                    <div class="carousel-caption">${escapeFunction(image.caption)}</div>
                    <div class="carousel-counter">${index + 1} / ${images.length}</div>
                </div>
            `;

            res.send(imageHtml);
        } catch (error) {
            console.error('Error fetching carousel images:', error);
            res.status(500).send('<div class="error">Failed to load carousel</div>');
        }
    });

    app.get('/api/carousel/next/:current', async (req, res) => {
        try {
            const images = loadCarouselImages();
            const current = parseInt(req.params.current) || 0;
            const next = (current + 1) % Math.max(images.length, 1);
            res.redirect(`/api/carousel/${next}`);
        } catch (error) {
            res.redirect('/api/carousel/0');
        }
    });

    app.get('/api/carousel/prev/:current', async (req, res) => {
        try {
            const images = loadCarouselImages();
            const current = parseInt(req.params.current) || 0;
            const prev = current === 0 ? Math.max(images.length - 1, 0) : current - 1;
            res.redirect(`/api/carousel/${prev}`);
        } catch (error) {
            res.redirect('/api/carousel/0');
        }
    });

    app.get('/api/carousel/dots', async (req, res) => {
        try {
            const images = loadCarouselImages();
            const dotsHtml = `
                <div class="carousel-dots">
                    ${images.map((_, index) =>
                `<button class="dot" onclick="loadCarouselSlide(${index})" data-index="${index}">•</button>`
            ).join('')}
                </div>
            `;
            res.send(dotsHtml);
        } catch (error) {
            res.send('<div class="carousel-dots">No navigation available</div>');
        }
    });

    // Admin endpoint to populate carousel images table from text file
    app.post('/api/admin/populate-carousel', async (req, res) => {
        try {
            const images = loadCarouselImages();

            if (images.length === 0) {
                return res.json({ error: 'No images found in carousel-pic-ids.txt' });
            }

            const results = [];
            for (const image of images) {
                try {
                    const imageId = await convex.mutation(api.carousel.addCarouselImage, {
                        storageId: image.fileId,
                        caption: image.caption,
                        altText: image.altText
                    });
                    results.push({ success: true, imageId, storageId: image.fileId });
                } catch (error) {
                    console.error('Failed to add image:', image.fileId, error);
                    results.push({ success: false, storageId: image.fileId, error: error.message });
                }
            }

            res.json({
                message: 'Population complete',
                total: images.length,
                results
            });
        } catch (error) {
            console.error('Error populating carousel:', error);
            res.status(500).json({ error: 'Failed to populate carousel images' });
        }
    });

    // Admin endpoint to clear all carousel images from database
    app.delete('/api/admin/clear-carousel', async (req, res) => {
        try {
            // Get all images first
            const images = await convex.query(api.carousel.getCarouselImages);

            // Delete each image
            const results = [];
            for (const image of images) {
                try {
                    await convex.mutation(api.carousel.deleteCarouselImage, { id: image.id });
                    results.push({ success: true, imageId: image.id });
                } catch (error) {
                    results.push({ success: false, imageId: image.id, error: error.message });
                }
            }

            res.json({
                message: 'Clear complete',
                total: images.length,
                results
            });
        } catch (error) {
            console.error('Error clearing carousel:', error);
            res.status(500).json({ error: 'Failed to clear carousel images' });
        }
    });


    app.listen(PORT, "0.0.0.0", () => {
        console.log("listening on", PORT);
    });
}

// Start the server
startServer().catch(console.error);