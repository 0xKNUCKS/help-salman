# Salman Support Website

A retro-style donation and support website featuring an interactive notes wall, video carousel, and photo gallery.

## Features

- **Interactive Notes Wall** - Pannable/zoomable post-it notes with TypeScript support
- **Video Carousel** - YouTube Shorts integration with navigation
- **Photo Gallery** - Modal image viewer with full-size enlargement
- **Security** - Content Security Policy, rate limiting, input sanitization
- **Responsive Design** - Works on desktop and mobile

## Tech Stack

- **Backend**: Node.js with Express
- **Frontend**: HTMX for dynamic interactions
- **Database**: Convex for real-time data
- **Styling**: Retro CSS with table-based layouts
- **Security**: Helmet, rate limiting, input validation

## Railway Deployment

### Prerequisites

1. **Convex Account**: Set up at [convex.dev](https://convex.dev)
2. **Environment Variables**: Configure in Railway dashboard

### Required Environment Variables

```bash
# Convex Configuration
CONVEX_URL=https://your-convex-deployment-url.convex.cloud

# Production Environment
NODE_ENV=production

# Railway will automatically set PORT
```

### Deploy to Railway

1. **Fork/Clone** this repository
2. **Connect to Railway**:
   - Go to [railway.app](https://railway.app)
   - Create new project from GitHub
   - Select this repository
3. **Set Environment Variables**:
   - Add `CONVEX_URL` in Railway dashboard
   - Railway automatically sets `PORT`
4. **Deploy**:
   - Railway will automatically build and deploy using `railway.json`

### File Structure

```
├── static/           # CSS, JS, images
├── templates/        # HTML templates
├── convex/          # Convex backend functions
├── server.js        # Express server
├── security.js      # Security middleware
├── Dockerfile       # Docker configuration
├── railway.json     # Railway deployment config
└── package.json     # Node.js dependencies
```

### Local Development

```bash
# Install dependencies
npm install

# Set environment variables
cp .env.example .env
# Edit .env with your Convex URL

# Start development server
npm run dev
```

### Production Deployment

```bash
# Install dependencies
npm install

# Set environment variables
export CONVEX_URL=your_convex_url
export NODE_ENV=production

# Start production server
npm start
```

### Health Check

The application includes a health check endpoint at `/` that Railway uses to monitor service health.

### Support

For deployment issues, check:
1. Railway build logs
2. Environment variables are set correctly
3. Convex backend is deployed and accessible

## Pages

- `/` - Main donation page with video carousel and recent messages
- `/write-note` - Interactive notes wall for writing support messages
- `/gallery` - Photo gallery showcasing Salman's pictures

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request
