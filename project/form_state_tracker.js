window.antigravityFormState = {};

class FormStateTracker {
    constructor() {
        this.trackedElements = new Set();
        
        // Listen for internal JS value changes captured by page_state_hook
        window.addEventListener('AG_PAGE_STATE_HOOK', (e) => {
            if (e.detail) {
                const { name, value, isSelect, textValue, programmaticKey } = e.detail;
                if (name) {
                    // Try to map their basic name to our semantic label if available
                    let mappedName = name;
                    
                    // Fallback to updating the raw programmatic key
                    if (programmaticKey) {
                        window.antigravityFormState[programmaticKey] = value;
                        if (isSelect && textValue) {
                            window.antigravityFormState[programmaticKey + '_text'] = textValue;
                        }
                    }
                    
                    window.antigravityFormState[mappedName] = value;
                    if (isSelect && textValue) {
                        window.antigravityFormState[mappedName + '_text'] = textValue;
                    }
                }
            }
        });
        
        this._injectHook();
    }

    _injectHook() {
        if (document.getElementById('ag-page-hook')) return;
        const script = document.createElement('script');
        script.id = 'ag-page-hook';
        script.src = chrome.runtime.getURL('page_state_hook.js');
        // Prepend it so it hooks before React/Angular run
        (document.head || document.documentElement).appendChild(script);
    }
    
    _resolveName(el) {
        // Advanced naming logic using BackupEngine's semantic heuristic
        if (window.BackupEngine && window.BackupEngine.findLabelForInput) {
            return window.BackupEngine.findLabelForInput(el);
        }
        return el.name || el.id || el.dataset.antigravityBackupKey || "Unknown Field";
    }

    trackElement(el) {
        if (this.trackedElements.has(el)) return;
        this.trackedElements.add(el);
        
        const handleChange = () => {
            const name = this._resolveName(el);
            if (!name) return;
            
            // Link semantic label to raw DOM attributes so the hook can sync correctly later
            el.dataset.antigravityBackupKey = name;
            
            // Backup the internal programmatic key alongside the semantic one
            const rawKey = el.name || el.id;
            
            if (el.type === 'checkbox' || el.type === 'radio') {
                if (el.checked) {
                    window.antigravityFormState[name] = el.value || 'on';
                    if (rawKey) window.antigravityFormState[rawKey] = el.value || 'on';
                }
            } else if (el.tagName === 'SELECT') {
                window.antigravityFormState[name] = el.value;
                if (rawKey) window.antigravityFormState[rawKey] = el.value;
                
                const option = el.options[el.selectedIndex];
                if (option) {
                    window.antigravityFormState[name + '_text'] = option.innerText.trim();
                    if (rawKey) window.antigravityFormState[rawKey + '_text'] = option.innerText.trim();
                }
            } else {
                window.antigravityFormState[name] = el.value;
                if (rawKey) window.antigravityFormState[rawKey] = el.value;
            }
        };

        el.addEventListener('input', handleChange);
        el.addEventListener('change', handleChange);
        handleChange(); // Capture initial state
    }

    collectFormState() {
        // Final sweep before returning
        this.trackedElements.forEach(el => {
            const name = this._resolveName(el);
            if (!name) return;
            
            const rawKey = el.name || el.id;
            
            if (el.type === 'checkbox' || el.type === 'radio') {
                 if (el.checked) {
                     window.antigravityFormState[name] = el.value || 'on';
                     if(rawKey) window.antigravityFormState[rawKey] = el.value || 'on';
                 }
            } else if (el.tagName === 'SELECT') {
                 window.antigravityFormState[name] = el.value;
                 if(rawKey) window.antigravityFormState[rawKey] = el.value;
                 
                 const option = el.options[el.selectedIndex];
                 if (option) {
                     window.antigravityFormState[name + '_text'] = option.innerText.trim();
                     if(rawKey) window.antigravityFormState[rawKey + '_text'] = option.innerText.trim();
                 }
            } else {
                 window.antigravityFormState[name] = el.value;
                 if(rawKey) window.antigravityFormState[rawKey] = el.value;
            }
        });
        
        return window.antigravityFormState;
    }
}

window.FormStateTracker = FormStateTracker;
