class FormMonitor {
    constructor(onLogCallback) {
        this.forms = [];
        this.inputs = [];
        this.onLogCallback = onLogCallback || console.log;
        this.detectForms();
        this.attachListeners();
    }

    detectForms() {
        this.forms = document.querySelectorAll('form');
        this.inputs = document.querySelectorAll('input, select, textarea');
        return this.forms.length;
    }

    attachListeners() {
        this.inputs.forEach(input => {
            // Prevent attaching multiple listeners
            if (input.dataset.antigravityMonitored) return;
            input.dataset.antigravityMonitored = "true";

            const handleFieldChange = (e) => {
                const target = e.target;
                const name = target.name || target.id || 'Unknown Field';
                let value = target.value;

                if (target.type === 'file' && target.files.length > 0) {
                    value = target.files[0].name;
                } else if (target.type === 'password') {
                    value = '********'; // Obfuscate passwords
                }

                const type = target.type || target.tagName.toLowerCase();

                // Pass to UI
                if (this.onLogCallback) {
                    this.onLogCallback({ name, value, type });
                }

                // Send to background script
                chrome.runtime.sendMessage({
                    type: 'LOG_FORM_FIELD',
                    data: { name, value, type, url: window.location.href }
                });
            };

            input.addEventListener('change', handleFieldChange);
            // Optional: Add debounced input event for real-time tracking if needed
            input.addEventListener('input', this.debounce(handleFieldChange, 800));
        });
    }

    debounce(func, wait) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    }

    getFormsCount() {
        return this.forms.length;
    }
}

// Make accessible in content.js context
window.FormMonitor = FormMonitor;
