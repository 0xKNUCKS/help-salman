// Comprehensive Notes Wall Refresh System
// Multiple fallback methods to ensure notes walls always refresh

class NotesRefreshSystem {
    constructor() {
        this.refreshMethods = [];
        this.setupMethods();
        this.init();
    }

    init() {
    }

    setupMethods() {
        // Method 1: HTMX Trigger (Primary)
        this.refreshMethods.push({
            name: 'HTMX Trigger',
            method: () => {
                if (typeof htmx !== 'undefined') {
                    const walls = document.querySelectorAll('[hx-get*="/api/messages"]');
                    let triggered = 0;
                    
                    walls.forEach(wall => {
                        htmx.trigger(wall, 'refresh');
                        triggered++;
                    });
                    
                    return triggered > 0;
                }
                return false;
            }
        });

        // Method 2: HTMX Ajax (Fallback 1)
        this.refreshMethods.push({
            name: 'HTMX Ajax',
            method: async () => {
                if (typeof htmx !== 'undefined') {
                    const targets = [
                        { element: '#notes-wall-desktop', url: '/api/messages/all' },
                        { element: '#notes-wall-mobile', url: '/api/messages/all' },
                        { element: '#recent-messages', url: '/api/messages/recent' }
                    ];

                    let success = 0;
                    for (const target of targets) {
                        const element = document.querySelector(target.element);
                        if (element) {
                            try {
                                htmx.ajax('GET', target.url, {
                                    target: element,
                                    swap: 'innerHTML'
                                });
                                success++;
                            } catch (error) {
                                console.warn(`HTMX Ajax failed for ${target.element}:`, error);
                            }
                        }
                    }
                    
                    return success > 0;
                }
                return false;
            }
        });

        // Method 3: Direct Fetch (Fallback 2)
        this.refreshMethods.push({
            name: 'Direct Fetch',
            method: async () => {
                const targets = [
                    { element: 'notes-wall-desktop', url: '/api/messages/all' },
                    { element: 'notes-wall-mobile', url: '/api/messages/all' },
                    { element: 'recent-messages', url: '/api/messages/recent' }
                ];

                let success = 0;
                for (const target of targets) {
                    const element = document.getElementById(target.element);
                    if (element) {
                        try {
                            const response = await fetch(target.url);
                            if (response.ok) {
                                const html = await response.text();
                                element.innerHTML = html;
                                success++;

                                // Re-initialize pannable if it's a notes wall
                                if (target.element.includes('notes-wall') && typeof initPannableNotesWall === 'function') {
                                    setTimeout(() => {
                                        initPannableNotesWall('#' + target.element);
                                    }, 100);
                                }
                            }
                        } catch (error) {
                            console.warn(`Direct fetch failed for ${target.element}:`, error);
                        }
                    }
                }

                return success > 0;
            }
        });

        // Method 4: Full Page Reload (Nuclear Option)
        this.refreshMethods.push({
            name: 'Page Reload',
            method: () => {
                console.log('💥 Nuclear option: Full page reload');
                window.location.reload();
                return true;
            }
        });
    }

    // Try all methods in sequence until one works
    async refresh(maxRetries = 3) {
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            
            for (const refreshMethod of this.refreshMethods) {
                try {
                    const success = await refreshMethod.method();
                    
                    if (success) {
                        
                        // Clear cache if refresh was successful
                        if (typeof window.notesCache !== 'undefined') {
                            window.notesCache.clearCache();
                        }
                        
                        return true;
                    }
                } catch (error) {
                }
            }
            
            if (attempt < maxRetries) {
                await this.sleep(1000 * attempt); // Progressive delay
            }
        }
        
        return false;
    }

    // Refresh specific wall by ID
    async refreshWall(wallId, endpoint) {
        const element = document.getElementById(wallId);
        if (!element) {
            return false;
        }

        // Try HTMX first
        if (typeof htmx !== 'undefined') {
            try {
                htmx.ajax('GET', endpoint, {
                    target: element,
                    swap: 'innerHTML'
                });
                return true;
            } catch (error) {
            }
        }

        // Fallback to direct fetch
        try {
            const response = await fetch(endpoint);
            if (response.ok) {
                const html = await response.text();
                element.innerHTML = html;
                
                // Re-initialize pannable if needed
                if (wallId.includes('notes-wall') && typeof initPannableNotesWall === 'function') {
                    setTimeout(() => {
                        initPannableNotesWall('#' + wallId);
                    }, 100);
                }
                
                return true;
            }
        } catch (error) {
        }

        return false;
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Get refresh stats
    getStats() {
        return {
            availableMethods: this.refreshMethods.length,
            methods: this.refreshMethods.map(m => m.name),
            htmxAvailable: typeof htmx !== 'undefined',
            wallsFound: document.querySelectorAll('[hx-get*="/api/messages"], #notes-wall-desktop, #notes-wall-mobile, #recent-messages').length
        };
    }
}

// Initialize the refresh system
window.notesRefresh = new NotesRefreshSystem();

// Export methods for manual use
window.refreshNotesWalls = () => window.notesRefresh.refresh();
window.refreshSpecificWall = (wallId, endpoint) => window.notesRefresh.refreshWall(wallId, endpoint);
window.getRefreshStats = () => window.notesRefresh.getStats();

// Enhanced form submission handler
document.addEventListener('DOMContentLoaded', function() {
    // Override the existing form handlers with the comprehensive refresh
    const forms = document.querySelectorAll('form[hx-post="/api/notes"]');
    
    forms.forEach(form => {
        form.addEventListener('htmx:afterRequest', async function(event) {
            if (event.detail.successful) {
                
                // Try comprehensive refresh first
                const refreshSuccess = await window.notesRefresh.refresh();
                
                if (!refreshSuccess) {
                    window.location.reload();
                }
            }
        });
    });
});

