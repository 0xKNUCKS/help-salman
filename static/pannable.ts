/**
 * TypeScript implementation of pannable notes wall with X, Y, and Z (zoom) axis support
 */

interface PanState {
    isPanning: boolean;
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
    offsetX: number;
    offsetY: number;
    scale: number;
}

interface PanConstraints {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    minScale: number;
    maxScale: number;
}

interface TouchEventLike {
    clientX: number;
    clientY: number;
    target: EventTarget | null;
    preventDefault(): void;
}

interface WheelEventData {
    deltaY: number;
    clientX: number;
    clientY: number;
    preventDefault(): void;
}

class PannableNotesWall {
    private notesWall: HTMLElement;
    private notesCanvas: HTMLElement;
    private state: PanState;
    private constraints: PanConstraints;
    private pinchData: { initialDistance: number; initialScale: number } | null = null;
    
    constructor(wallSelector: string) {
        const wall = document.querySelector(wallSelector) as HTMLElement;
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
            minScale: 0.8,
            maxScale: 2.0
        };
        
        this.setupEventListeners();
        this.updateTransform();
    }

    private initializeCanvas(): HTMLElement {
        let canvas = this.notesWall.querySelector('.notes-canvas') as HTMLElement;
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

    private setupEventListeners(): void {
        // Mouse events
        this.notesWall.addEventListener('mousedown', (e: MouseEvent) => this.startPan(e));
        document.addEventListener('mousemove', (e: MouseEvent) => this.doPan(e));
        document.addEventListener('mouseup', () => this.endPan());
        
        // Wheel event for zoom (Z-axis)
        this.notesWall.addEventListener('wheel', (e: WheelEvent) => this.handleWheel(e), { passive: false });
        
        // Touch events for mobile
        this.notesWall.addEventListener('touchstart', (e: TouchEvent) => this.handleTouchStart(e));
        this.notesWall.addEventListener('touchmove', (e: TouchEvent) => this.handleTouchMove(e));
        this.notesWall.addEventListener('touchend', () => this.handleTouchEnd());
        
        // Prevent default drag behavior
        this.notesWall.addEventListener('dragstart', (e: DragEvent) => e.preventDefault());
        
        // Handle pinch-to-zoom on mobile
        this.notesWall.addEventListener('gesturestart', (e: Event) => e.preventDefault());
        this.notesWall.addEventListener('gesturechange', (e: Event) => this.handleGesture(e));
        this.notesWall.addEventListener('gestureend', (e: Event) => e.preventDefault());
    }

    private startPan(e: MouseEvent | TouchEventLike): void {
        // Don't start panning if clicking on a note
        const target = e.target as HTMLElement;
        if (target.classList.contains('note') || target.closest('.note')) {
            return;
        }

        this.state.isPanning = true;
        this.state.startX = e.clientX - this.state.offsetX;
        this.state.startY = e.clientY - this.state.offsetY;
        this.notesWall.style.cursor = 'grabbing';
        e.preventDefault();
    }

    private doPan(e: MouseEvent | TouchEventLike): void {
        if (!this.state.isPanning) return;

        e.preventDefault();
        
        // Calculate new position
        const newX = e.clientX - this.state.startX;
        const newY = e.clientY - this.state.startY;
        
        // Apply constraints
        this.state.currentX = this.constrainValue(newX, this.constraints.minX, this.constraints.maxX);
        this.state.currentY = this.constrainValue(newY, this.constraints.minY, this.constraints.maxY);
        
        this.updateTransform();
    }

    private endPan(): void {
        if (!this.state.isPanning) return;
        
        this.state.isPanning = false;
        this.state.offsetX = this.state.currentX;
        this.state.offsetY = this.state.currentY;
        this.notesWall.style.cursor = 'grab';
    }

    private handleWheel(e: WheelEvent): void {
        e.preventDefault();
        
        // Get mouse position relative to the notes wall
        const rect = this.notesWall.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        // Calculate zoom delta with smaller increments for smoother zooming
        const zoomSpeed = 0.1;
        const delta = e.deltaY > 0 ? -zoomSpeed : zoomSpeed;
        
        this.zoomAtPoint(mouseX, mouseY, delta);
    }

    private zoomAtPoint(mouseX: number, mouseY: number, zoomDelta: number): void {
        // Store current state
        const oldScale = this.state.scale;
        const oldX = this.state.currentX;
        const oldY = this.state.currentY;
        
        // Calculate new scale
        const newScale = oldScale * (1 + zoomDelta);
        const constrainedScale = this.constrainValue(newScale, this.constraints.minScale, this.constraints.maxScale);
        
        // If scale didn't change due to constraints, don't do anything
        if (constrainedScale === oldScale) {
            return;
        }
        
        // Calculate scale factor
        const scaleFactor = constrainedScale / oldScale;
        
        // Calculate new position to keep the point under the mouse
        const newX = mouseX - (mouseX - oldX) * scaleFactor;
        const newY = mouseY - (mouseY - oldY) * scaleFactor;
        
        // Update state
        this.state.scale = constrainedScale;
        this.state.currentX = newX;
        this.state.currentY = newY;
        this.state.offsetX = newX;
        this.state.offsetY = newY;
        
        // Apply the transform
        this.updateTransform();
    }

    private handleTouchStart(e: TouchEvent): void {
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

    private handleTouchMove(e: TouchEvent): void {
        if (e.touches.length === 1 && this.state.isPanning) {
            const touch = e.touches[0];
            this.doPan({
                clientX: touch.clientX,
                clientY: touch.clientY,
                target: e.target,
                preventDefault: () => e.preventDefault()
            });
        } else if (e.touches.length === 2) {
            // Handle pinch-to-zoom
            this.handlePinchZoom(e);
        }
    }

    private handlePinchZoom(e: TouchEvent): void {
        if (e.touches.length !== 2) return;
        
        e.preventDefault();
        
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        
        // Calculate distance between touches
        const distance = Math.sqrt(
            Math.pow(touch2.clientX - touch1.clientX, 2) + 
            Math.pow(touch2.clientY - touch1.clientY, 2)
        );
        
        // Calculate center point relative to notes wall
        const rect = this.notesWall.getBoundingClientRect();
        const centerX = (touch1.clientX + touch2.clientX) / 2 - rect.left;
        const centerY = (touch1.clientY + touch2.clientY) / 2 - rect.top;
        
        // Initialize pinch data on first call
        if (!this.pinchData) {
            this.pinchData = {
                initialDistance: distance,
                initialScale: this.state.scale
            };
            return;
        }
        
        // Calculate zoom delta
        const scaleRatio = distance / this.pinchData.initialDistance;
        const targetScale = this.pinchData.initialScale * scaleRatio;
        const zoomDelta = (targetScale - this.state.scale) / this.state.scale;
        
        this.zoomAtPoint(centerX, centerY, zoomDelta);
    }

    private handleTouchEnd(): void {
        this.endPan();
        // Reset pinch data when touch ends
        this.pinchData = null;
    }

    private handleGesture(e: any): void {
        // Handle Safari gesture events
        e.preventDefault();
        if (e.scale) {
            this.state.scale = this.constrainValue(
                e.scale, 
                this.constraints.minScale, 
                this.constraints.maxScale
            );
            this.updateTransform();
        }
    }

    private constrainValue(value: number, min: number, max: number): number {
        return Math.max(min, Math.min(max, value));
    }

    private updateConstraints(): void {
        const wallRect = this.notesWall.getBoundingClientRect();
        const canvasWidth = this.notesCanvas.offsetWidth * this.state.scale;
        const canvasHeight = this.notesCanvas.offsetHeight * this.state.scale;
        
        this.constraints.minX = Math.min(0, -(canvasWidth - wallRect.width));
        this.constraints.minY = Math.min(0, -(canvasHeight - wallRect.height));
        this.constraints.maxX = 0;
        this.constraints.maxY = 0;
    }

    private updateTransform(): void {
        this.updateConstraints();
        
        // Apply constraints to current position
        this.state.currentX = this.constrainValue(this.state.currentX, this.constraints.minX, this.constraints.maxX);
        this.state.currentY = this.constrainValue(this.state.currentY, this.constraints.minY, this.constraints.maxY);
        
        // Apply transform
        this.notesCanvas.style.transform = 
            `translate(${this.state.currentX}px, ${this.state.currentY}px) scale(${this.state.scale})`;
    }

    // Public methods
    public resetView(): void {
        this.state.currentX = 0;
        this.state.currentY = 0;
        this.state.offsetX = 0;
        this.state.offsetY = 0;
        this.state.scale = 1.0;
        this.updateTransform();
    }

    public zoomIn(): void {
        const rect = this.notesWall.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        this.zoomAtPoint(centerX, centerY, 0.2);
    }

    public zoomOut(): void {
        const rect = this.notesWall.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        this.zoomAtPoint(centerX, centerY, -0.2);
    }

    public getState(): Readonly<PanState> {
        return { ...this.state };
    }
}

// Global instances storage
const pannableInstances = new Map<string, PannableNotesWall>();

// Initialize function for backward compatibility
function initPannableNotesWall(wallSelector: string): void {
    try {
        // Check if we're on index page and selector is for recent messages
        if (window.location.pathname === '/' && wallSelector === '#recent-messages') {
            console.log('🚫 Pannable disabled on index page for', wallSelector);
            console.log('👉 Visit /write-note for full interactive experience');
            return;
        }
        
        // Remove existing instance if any
        if (pannableInstances.has(wallSelector)) {
            pannableInstances.delete(wallSelector);
        }
        
        // Create new instance
        const instance = new PannableNotesWall(wallSelector);
        pannableInstances.set(wallSelector, instance);
        console.log('✅ Pannable notes wall initialized for', wallSelector);
    } catch (error) {
        console.warn(`Failed to initialize pannable notes wall for ${wallSelector}:`, error);
    }
}

// Global access
(window as any).initPannableNotesWall = initPannableNotesWall;
(window as any).PannableNotesWall = PannableNotesWall;
(window as any).pannableInstances = pannableInstances;