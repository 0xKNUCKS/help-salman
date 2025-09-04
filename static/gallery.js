// Gallery functionality for Salman Support Website
let currentPhotoIndex = 0;
let totalPhotos = 0;
let photoList = [];

// Photo data for Salman's gallery
const galleryPhotos = [
    {
        id: 'photo1',
        imagePath: '/static/images/salman1.jpg'
    },
    {
        id: 'photo2',
        imagePath: '/static/images/salman2.jpg'
    },
    {
        id: 'photo3',
        imagePath: '/static/images/salman3.jpg'
    },
    {
        id: 'photo4',
        imagePath: '/static/images/salman4.png'
    },
    {
        id: 'photo5',
        imagePath: '/static/images/salman5.jpg'
    },
    {
        id: 'photo6',
        imagePath: '/static/images/salman6.jpg'
    }
];

// Initialize gallery when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('📸 Gallery initializing...');
    console.log('Available photos:', galleryPhotos);
    
    photoList = galleryPhotos;
    totalPhotos = photoList.length;
    
    console.log('Total photos loaded:', totalPhotos);
    
    // Load photos into gallery grid
    loadGalleryPhotos();
    console.log('✅ Gallery initialization complete');
});

// Load photos into gallery grid
function loadGalleryPhotos() {
    console.log('🔄 Loading gallery photos...');
    
    const galleryContainer = document.getElementById('photo-gallery');
    if (!galleryContainer) {
        console.log('❌ Gallery container not found');
        return;
    }
    
    // Clear existing placeholder content
    galleryContainer.innerHTML = '';
    
    // Create photo cards for each photo
    photoList.forEach((photo, index) => {
        const photoCard = createPhotoCard(photo, index);
        galleryContainer.appendChild(photoCard);
    });
    
    console.log('✅ All photos loaded into gallery');
}

// Create individual photo card
function createPhotoCard(photo, index) {
    console.log('🖼️ Creating photo card for photo:', index + 1);
    
    const photoCard = document.createElement('div');
    photoCard.className = 'photo-card';
    photoCard.setAttribute('data-photo-index', index);
    
    // Create placeholder SVG for when image fails to load
    const placeholderSvg = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect width='200' height='200' fill='%23f0f0f0'/%3E%3Ctext x='50%' y='50%' font-family='Arial' font-size='16' fill='%23999' text-anchor='middle' dominant-baseline='middle'%3EPhoto ${index + 1}%3C/text%3E%3C/svg%3E`;
    
    photoCard.innerHTML = `
        <img src="${photo.imagePath}" alt="Salman Photo ${index + 1}" 
             onerror="this.src='${placeholderSvg}'"
             onclick="openPhotoModal(${index})">
    `;
    
    return photoCard;
}

// Open photo in modal/lightbox
function openPhotoModal(index) {
    console.log('🔍 Opening photo modal for index:', index);
    const photo = photoList[index];
    if (photo) {
        console.log('📸 Opening photo:', index + 1);
        
        // Get modal elements
        const modal = document.getElementById('photoModal');
        const modalPhoto = document.getElementById('modalPhoto');
        
        if (modal && modalPhoto) {
            // Set modal content
            modalPhoto.src = photo.imagePath;
            modalPhoto.alt = `Salman Photo ${index + 1}`;
            
            // Show modal
            modal.style.display = 'block';
            console.log('✅ Modal opened successfully');
        } else {
            console.log('❌ Modal elements not found');
        }
    }
}

// Close photo modal
function closePhotoModal() {
    console.log('🔙 Closing photo modal');
    const modal = document.getElementById('photoModal');
    if (modal) {
        modal.style.display = 'none';
        console.log('✅ Modal closed successfully');
    }
}

// Add click handlers for photo interaction
document.addEventListener('click', function(event) {
    if (event.target.closest('.photo-card img')) {
        const photoCard = event.target.closest('.photo-card');
        const photoIndex = parseInt(photoCard.getAttribute('data-photo-index'));
        if (!isNaN(photoIndex)) {
            openPhotoModal(photoIndex);
        }
    }
    
    // Close modal when clicking outside the image or on close button
    if (event.target.classList.contains('photo-modal') || 
        event.target.classList.contains('photo-modal-close')) {
        closePhotoModal();
    }
});

// Make functions globally accessible
window.loadGalleryPhotos = loadGalleryPhotos;
window.openPhotoModal = openPhotoModal;
window.closePhotoModal = closePhotoModal;

// Handle keyboard navigation for gallery
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closePhotoModal();
        event.preventDefault();
    }
});

console.log('✅ Gallery script loaded successfully');