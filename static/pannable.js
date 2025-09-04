/**
 * TypeScript implementation of pannable notes wall with X, Y, and Z (zoom) axis support
 */
class PannableNotesWall {
    constructor(wallSelector) {
        const wall = document.querySelector(wallSelector);
        if (!wall) {
            throw new Error(`Notes wall element not found: ${wallSelector}`);
        }
        this.notesWall = wall;
        this.notesCanvas = this.initializeCanvas();
        this.state = {
            isPanning: false,
            startX: 0,
            startY: 0,
            currentX: 0,
            currentY: 0,
            offsetX: 0,
            offsetY: 0,
            scale: 1.0
        };
        this.constraints = {
            minX: -2000,
            maxX: 0,
            minY: -2000,
            maxY: 0,
            minScale: 0.5,
            maxScale: 3.0
        };
        this.setupEventListeners();
        this.updateTransform();
    }
    initializeCanvas() {
        let canvas = this.notesWall.querySelector('.notes-canvas');
        if (!canvas) {
            // Create canvas if it doesn't exist and wrap existing content
            canvas = document.createElement('div');
            canvas.className = 'notes-canvas';
            // Move all existing children to the canvas
            while (this.notesWall.firstChild) {
                canvas.appendChild(this.notesWall.firstChild);
            }
            this.notesWall.appendChild(canvas);
        }
        return canvas;
    }
    setupEventListeners() {
        // Mouse events
        this.notesWall.addEventListener('mousedown', (e) => this.startPan(e));
        document.addEventListener('mousemove', (e) => this.doPan(e));
        document.addEventListener('mouseup', () => this.endPan());
        // Wheel event for zoom (Z-axis)
        this.notesWall.addEventListener('wheel', (e) => this.handleWheel(e), { passive: false });
        // Touch events for mobile
        this.notesWall.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.notesWall.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        this.notesWall.addEventListener('touchend', () => this.endPan());
        // Prevent default drag behavior
        this.notesWall.addEventListener('dragstart', (e) => e.preventDefault());
        // Handle pinch-to-zoom on mobile
        this.notesWall.addEventListener('gesturestart', (e) => e.preventDefault());
        this.notesWall.addEventListener('gesturechange', (e) => this.handleGesture(e));
        this.notesWall.addEventListener('gestureend', (e) => e.preventDefault());
    }
    startPan(e) {
        // Don't start panning if clicking on a note
        const target = e.target;
        if (target.classList.contains('note') || target.closest('.note')) {
            return;
        }
        this.state.isPanning = true;
        this.state.startX = e.clientX - this.state.offsetX;
        this.state.startY = e.clientY - this.state.offsetY;
        this.notesWall.style.cursor = 'grabbing';
        e.preventDefault();
    }
    doPan(e) {
        if (!this.state.isPanning)
            return;
        e.preventDefault();
        // Calculate new position
        const newX = e.clientX - this.state.startX;
        const newY = e.clientY - this.state.startY;
        // Apply constraints
        this.state.currentX = this.constrainValue(newX, this.constraints.minX, this.constraints.maxX);
        this.state.currentY = this.constrainValue(newY, this.constraints.minY, this.constraints.maxY);
        this.updateTransform();
    }
    endPan() {
        if (!this.state.isPanning)
            return;
        this.state.isPanning = false;
        this.state.offsetX = this.state.currentX;
        this.state.offsetY = this.state.currentY;
        this.notesWall.style.cursor = 'grab';
    }
    handleWheel(e) {
        e.preventDefault();
        // Calculate zoom delta
        const zoomSpeed = 0.001;
        const delta = -e.deltaY * zoomSpeed;
        const newScale = this.state.scale + delta;
        // Apply scale constraints
        this.state.scale = this.constrainValue(newScale, this.constraints.minScale, this.constraints.maxScale);
        // Zoom towards mouse position
        this.zoomToPoint(e.clientX, e.clientY);
    }
    zoomToPoint(clientX, clientY) {
        const rect = this.notesWall.getBoundingClientRect();
        const mouseX = clientX - rect.left;
        const mouseY = clientY - rect.top;
        // Calculate the point in canvas coordinates before zoom
        const canvasX = (mouseX - this.state.currentX) / this.state.scale;
        const canvasY = (mouseY - this.state.currentY) / this.state.scale;
        // Update transform and then adjust position to keep mouse point steady
        this.updateTransform();
        // Calculate new position to keep the same canvas point under the mouse
        const newMouseX = canvasX * this.state.scale + this.state.currentX;
        const newMouseY = canvasY * this.state.scale + this.state.currentY;
        this.state.currentX += mouseX - newMouseX;
        this.state.currentY += mouseY - newMouseY;
        this.state.offsetX = this.state.currentX;
        this.state.offsetY = this.state.currentY;
        this.updateTransform();
    }
    handleTouchStart(e) {
        if (e.touches.length === 1) {
            const touch = e.touches[0];
            this.startPan({
                clientX: touch.clientX,
                clientY: touch.clientY,
                target: e.target,
                preventDefault: () => e.preventDefault()
            });
        }
    }
    handleTouchMove(e) {
        if (e.touches.length === 1 && this.state.isPanning) {
            const touch = e.touches[0];
            this.doPan({
                clientX: touch.clientX,
                clientY: touch.clientY,
                target: e.target,
                preventDefault: () => e.preventDefault()
            });
        }
        else if (e.touches.length === 2) {
            // Handle pinch-to-zoom
            this.handlePinchZoom(e);
        }
    }
    handlePinchZoom(e) {
        if (e.touches.length !== 2)
            return;
        e.preventDefault();
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        // Calculate distance between touches
        const distance = Math.sqrt(Math.pow(touch2.clientX - touch1.clientX, 2) +
            Math.pow(touch2.clientY - touch1.clientY, 2));
        // Store initial distance if not set
        if (!this.state.startX) {
            this.state.startX = distance;
            return;
        }
        // Calculate scale change
        const scaleChange = distance / this.state.startX;
        const newScale = this.state.scale * scaleChange;
        this.state.scale = this.constrainValue(newScale, this.constraints.minScale, this.constraints.maxScale);
        // Calculate center point of pinch
        const centerX = (touch1.clientX + touch2.clientX) / 2;
        const centerY = (touch1.clientY + touch2.clientY) / 2;
        this.zoomToPoint(centerX, centerY);
        this.state.startX = distance;
    }
    handleGesture(e) {
        // Handle Safari gesture events
        e.preventDefault();
        if (e.scale) {
            this.state.scale = this.constrainValue(e.scale, this.constraints.minScale, this.constraints.maxScale);
            this.updateTransform();
        }
    }
    constrainValue(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }
    updateConstraints() {
        const wallRect = this.notesWall.getBoundingClientRect();
        const canvasWidth = this.notesCanvas.offsetWidth * this.state.scale;
        const canvasHeight = this.notesCanvas.offsetHeight * this.state.scale;
        this.constraints.minX = Math.min(0, -(canvasWidth - wallRect.width));
        this.constraints.minY = Math.min(0, -(canvasHeight - wallRect.height));
        this.constraints.maxX = 0;
        this.constraints.maxY = 0;
    }
    updateTransform() {
        this.updateConstraints();
        // Apply constraints to current position
        this.state.currentX = this.constrainValue(this.state.currentX, this.constraints.minX, this.constraints.maxX);
        this.state.currentY = this.constrainValue(this.state.currentY, this.constraints.minY, this.constraints.maxY);
        // Apply transform
        this.notesCanvas.style.transform =
            `translate(${this.state.currentX}px, ${this.state.currentY}px) scale(${this.state.scale})`;
    }
    // Public methods
    resetView() {
        this.state.currentX = 0;
        this.state.currentY = 0;
        this.state.offsetX = 0;
        this.state.offsetY = 0;
        this.state.scale = 1.0;
        this.updateTransform();
    }
    zoomIn() {
        const newScale = this.state.scale * 1.2;
        this.state.scale = this.constrainValue(newScale, this.constraints.minScale, this.constraints.maxScale);
        this.updateTransform();
    }
    zoomOut() {
        const newScale = this.state.scale * 0.8;
        this.state.scale = this.constrainValue(newScale, this.constraints.minScale, this.constraints.maxScale);
        this.updateTransform();
    }
    getState() {
        return { ...this.state };
    }
}
// Global instances storage
const pannableInstances = new Map();
// Initialize function for backward compatibility
function initPannableNotesWall(wallSelector) {
    try {
        // Remove existing instance if any
        if (pannableInstances.has(wallSelector)) {
            pannableInstances.delete(wallSelector);
        }
        // Create new instance
        const instance = new PannableNotesWall(wallSelector);
        pannableInstances.set(wallSelector, instance);
    }
    catch (error) {
        console.warn(`Failed to initialize pannable notes wall for ${wallSelector}:`, error);
    }
}
// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PannableNotesWall, initPannableNotesWall };
}
window.initPannableNotesWall = initPannableNotesWall;
window.PannableNotesWall = PannableNotesWall;
window.pannableInstances = pannableInstances;
