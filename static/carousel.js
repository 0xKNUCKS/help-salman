// Video Carousel functionality for Salman Support Website
let currentVideoIndex = 0;
let totalVideos = 0;
let videoList = [];

// YouTube video data for Salman's content
const youtubeVideos = [
    {
        id: 'ik35LzzOYvo', // Salman's original YouTube Shorts video
        title: 'Salman\'s YouTube Short',
        embedUrl: 'https://www.youtube.com/embed/ik35LzzOYvo?autoplay=1&mute=1&controls=1&rel=0'
    },
    {
        id: 'DMehfzksxr8',
        title: 'Honest attempt to hide from camerawoman, copes by singing.',
        embedUrl: 'https://www.youtube.com/embed/DMehfzksxr8?autoplay=1&mute=1&controls=1&rel=0'
    },
    {
        id: 'nkACd4vJrmM',
        title: 'Salman sings "in my solitude"',
        embedUrl: 'https://www.youtube.com/embed/nkACd4vJrmM?autoplay=1&mute=1&controls=1&rel=0'
    },
    {
        id: '5Ka4rQ_u0K0',
        title: 'Salman looks normal, why is everyone weirded out?',
        embedUrl: 'https://www.youtube.com/embed/5Ka4rQ_u0K0?autoplay=1&mute=1&controls=1&rel=0'
    },
    {
        id: '8WWq5X-excM',
        title: 'Salman goes against Adam in street maths.',
        embedUrl: 'https://www.youtube.com/embed/8WWq5X-excM?autoplay=1&mute=1&controls=1&rel=0'
    }
];

// Initialize video carousel when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎬 Video carousel initializing...');
    console.log('Available videos:', youtubeVideos);
    
    videoList = youtubeVideos;
    totalVideos = videoList.length;
    currentVideoIndex = 0;
    
    console.log('Total videos loaded:', totalVideos);
    
    // Add event listeners to arrow buttons
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            navigateVideoCarousel('prev');
        });
        console.log('✅ Previous button event listener added');
    } else {
        console.log('❌ Previous button not found');
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            navigateVideoCarousel('next');
        });
        console.log('✅ Next button event listener added');
    } else {
        console.log('❌ Next button not found');
    }
    
    // Load first video
    loadVideo(currentVideoIndex);
    console.log('✅ Carousel initialization complete');
});

// Load specific video
function loadVideo(index) {
    console.log('🔄 loadVideo called with index:', index);
    
    if (index < 0 || index >= totalVideos) {
        console.log('❌ Invalid index:', index, 'Total videos:', totalVideos);
        return;
    }
    
    const video = videoList[index];
    console.log('📹 Loading video:', video);
    
    const videoElement = document.getElementById('current-video');
    const titleElement = document.getElementById('video-title');
    
    console.log('🎯 Video element found:', !!videoElement);
    console.log('🏷️ Title element found:', !!titleElement);
    
    if (videoElement) {
        console.log('🔗 Setting video URL:', video.embedUrl);
        videoElement.src = video.embedUrl;
    }
    
    if (titleElement) {
        console.log('📝 Setting video title:', video.title);
        titleElement.textContent = video.title;
    }
    
    currentVideoIndex = index;
    console.log('✅ Video loaded successfully:', video.title, 'Index:', currentVideoIndex);
}

// Navigate video carousel (prev/next)
function navigateVideoCarousel(direction) {
    console.log('🔄 Video navigation clicked:', direction);
    console.log('📊 Current state - Index:', currentVideoIndex, 'Total:', totalVideos);
    
    if (totalVideos <= 0) {
        console.log('❌ No videos available');
        return;
    }
    
    const oldIndex = currentVideoIndex;
    
    // Calculate new video index
    if (direction === 'next') {
        currentVideoIndex = (currentVideoIndex + 1) % totalVideos;
        console.log('➡️ Moving to next video');
    } else if (direction === 'prev') {
        currentVideoIndex = currentVideoIndex === 0 ? totalVideos - 1 : currentVideoIndex - 1;
        console.log('⬅️ Moving to previous video');
    } else {
        console.log('❌ Invalid direction:', direction);
        return;
    }
    
    console.log('🔄 Index change:', oldIndex, '→', currentVideoIndex);
    loadVideo(currentVideoIndex);
}

// Make sure function is globally accessible
window.navigateVideoCarousel = navigateVideoCarousel;


// Handle keyboard navigation for video carousel
document.addEventListener('keydown', function(event) {
    if (event.key === 'ArrowLeft') {
        navigateVideoCarousel('prev');
        event.preventDefault();
    } else if (event.key === 'ArrowRight') {
        navigateVideoCarousel('next');
        event.preventDefault();
    }
});

// Auto-advance video carousel (optional - uncomment to enable)
// setInterval(() => {
//     navigateVideoCarousel('next');
// }, 10000); // Change video every 10 seconds