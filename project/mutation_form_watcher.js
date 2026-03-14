class MutationFormWatcher {
    constructor(tracker) {
        this.tracker = tracker;
        this.observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            if (node.matches && node.matches('input, select, textarea')) {
                                this.tracker.trackElement(node);
                            }
                            if (node.querySelectorAll) {
                                node.querySelectorAll('input, select, textarea').forEach(child => {
                                    this.tracker.trackElement(child);
                                });
                            }
                        }
                    });
                }
            }
        });
    }

    start() {
        // Initial pass
        document.querySelectorAll('input, select, textarea').forEach(el => {
            this.tracker.trackElement(el);
        });
        
        // Observe body for React/Angular asynchronous rendering
        this.observer.observe(document.body, { 
            childList: true, 
            subtree: true 
        });
        console.log("AntiGravity MutationWatcher active.");
    }
}

window.MutationFormWatcher = MutationFormWatcher;
