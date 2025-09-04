# 🗄️ ConvexDB Integration Setup

This project now uses ConvexDB for persistent storage of post-it notes instead of in-memory storage.

## 📋 Setup Steps

### 1. Install Node.js Dependencies
```bash
npm install
```

### 2. Set up Convex Account
1. Go to [convex.dev](https://convex.dev) and create an account
2. Create a new project

### 3. Initialize Convex
```bash
npx convex dev
```
This will:
- Generate the `convex/_generated` folder
- Deploy your schema and functions
- Give you a deployment URL

### 4. Configure Environment Variables
1. Copy `.env.example` to `.env`
2. Update `CONVEX_URL` with your deployment URL from step 3

```bash
cp .env.example .env
# Edit .env file with your actual Convex URL
```

### 5. Deploy Schema and Functions
```bash
npx convex deploy
```

## 🗃️ Database Schema

### Notes Table
- `message`: string - The post-it note message
- `senderName`: string - Name of the person who wrote the note  
- `createdAt`: number - Timestamp when note was created

### Carousel Images Table
- `filename`: string - Image filename in static/images/
- `caption`: string - Funny caption for the image
- `altText`: string - Alt text for accessibility
- `uploadedAt`: number - Timestamp when image was added

## 🔌 API Functions

### Notes
- `notes:createNote(message, senderName)` - Add new post-it note
- `notes:getRecentNotes(limit?)` - Get recent notes for homepage
- `notes:getAllNotes()` - Get all notes for messages page
- `notes:getNotesCount()` - Get total count of notes

### Carousel Images
- `carousel:addCarouselImage(filename, caption, altText)` - Add new image
- `carousel:getCarouselImages()` - Get all carousel images

## 🛡️ Fallback Behavior

The Rust application includes graceful fallbacks:
- **Notes**: Shows "No messages yet" when Convex is unavailable
- **Carousel**: Falls back to placeholder images when Convex is unavailable
- **Error Handling**: User-friendly error messages for connection issues

## 🚀 Running the Application

1. **Start Convex (in separate terminal):**
   ```bash
   npx convex dev
   ```

2. **Start Rust server:**
   ```bash
   cargo run
   ```

Your notes will now persist in ConvexDB! 🎉

## 🔧 Development Tips

- Use `npx convex dashboard` to view your data
- Check `convex/_generated/api.d.ts` for TypeScript types
- Monitor logs with `npx convex logs`
- Reset database with `npx convex run clearAll` (create this function if needed)

## 📁 File Structure
```
convex/
├── schema.ts          # Database schema definition
├── notes.ts           # Notes CRUD functions  
├── carousel.ts        # Carousel image functions
└── _generated/        # Auto-generated Convex code
```