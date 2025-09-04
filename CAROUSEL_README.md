# 📸 Carousel Setup Instructions

## How to Add Your Pictures

1. **Add your images** to the `static/images/` directory
   - Supported formats: JPG, PNG, GIF, WebP
   - Recommended size: 800x600px or similar aspect ratio for best display

2. **Update the carousel images** in `src/main.rs`:
   ```rust
   let sample_images = vec![
       CarouselImage {
           filename: "your-photo1.jpg".to_string(),
           caption: "Your funny caption here 😄".to_string(),
           alt_text: "Description for accessibility".to_string(),
       },
       // Add more images...
   ];
   ```

3. **Restart the server** with `cargo run`

## Current Features

✅ **Navigation**: Left/right arrow buttons  
✅ **Dot indicators**: Click to jump to specific images  
✅ **Responsive**: Works on mobile and desktop  
✅ **Fallback**: Shows placeholder when images don't exist  
✅ **HTMX-powered**: Smooth transitions without page reloads  

## File Structure
```
static/
├── images/          # Put your photos here
│   ├── photo1.jpg
│   ├── photo2.png
│   └── ...
├── style.css
└── ...
```

## Example Captions
- "Me looking distinguished 🎩"
- "Me attempting to cook 🍳"
- "Me pretending to work 💻"
- "Me with my favorite plant 🌱"
- "Me being photogenic 📸"

The carousel will automatically handle the navigation and display your dumb pictures in style! 🎠