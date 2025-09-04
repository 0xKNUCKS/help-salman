# 🚂 Railway Deployment Guide

This guide will help you deploy the Salman Support website to Railway.

## Prerequisites

1. **GitHub Repository**: Make sure all changes are committed and pushed
2. **Convex Production Deployment**: Your Convex backend should be deployed to production
3. **Railway Account**: Sign up at [railway.app](https://railway.app)

## Deployment Steps

### 1. Create Railway Project

1. Go to [railway.app](https://railway.app) and sign in with GitHub
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your `help-salman-htmx` repository
5. Railway will automatically detect it's a Node.js app

### 2. Configure Environment Variables

In the Railway dashboard, go to your project **Variables** tab and add:

```bash
# Required Variables
CONVEX_URL=https://compassionate-bloodhound-355.convex.cloud
NODE_ENV=production

# Optional (Railway sets PORT automatically, but you can override)
PORT=3000
```

### 3. Deploy

1. Railway will automatically deploy when you push to main branch
2. First deployment takes 2-3 minutes
3. You'll get a URL like `https://your-app-name.up.railway.app`

### 4. Custom Domain Setup (Optional)

To use `salman.help`:

1. In Railway dashboard, go to **Settings** → **Domains**
2. Click **"Custom Domain"**
3. Enter `salman.help`
4. Update your DNS settings:
   - Add CNAME record: `salman.help` → `your-app.up.railway.app`
   - Or A record pointing to Railway's IP (they'll provide this)

### 5. Monitoring

- **Logs**: Check Railway dashboard → **Deployments** → **View Logs**
- **Metrics**: Monitor CPU/Memory usage in the dashboard
- **Health**: Railway automatically restarts if your app crashes

## Troubleshooting

### Build Failures
- Check the build logs in Railway dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

### Runtime Errors
- Check application logs for errors
- Verify environment variables are set correctly
- Ensure Convex URL is accessible

### Custom Domain Issues
- DNS changes can take up to 48 hours
- Use online DNS checkers to verify propagation
- Check Railway's domain status in dashboard

## Files Created for Railway

- `railway.json` - Railway-specific configuration
- `Procfile` - Process definition for web service
- `.env.production.example` - Environment variable template
- This deployment guide

## Automatic Deployments

Railway is now configured to automatically deploy when you:
1. Push changes to the `main` branch
2. Railway detects changes and rebuilds
3. Zero-downtime deployment with health checks

Your site will be live at the Railway-provided URL and optionally at `salman.help` once DNS is configured!