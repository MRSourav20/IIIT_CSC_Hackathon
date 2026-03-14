(function() {
    console.log("AntiGravity AI Page State Hook Injected (Main World)");

    function resolveKey(el) {
        return el.name || el.id || el.getAttribute('aria-label') || el.placeholder || "";
    }

    function dispatch(el, val) {
        // Find the internal programmatic key (e.g. districtCd)
        const programmaticKey = el.name || el.id;
        
        // Find the semantic key if tracker set it (e.g. District)
        const semanticKey = el.dataset.antigravityBackupKey;
        
        const nameToUse = semanticKey || programmaticKey || resolveKey(el);
        if (!nameToUse) return;
        
        let detail = { 
            name: nameToUse, 
            programmaticKey: programmaticKey,
            value: val, 
            isSelect: false 
        };
        
        if (el.tagName === 'SELECT') {
            detail.isSelect = true;
            // The DOM option might take a microtask to update when the value setter is called
            setTimeout(() => {
                if (el.selectedIndex >= 0) {
                    const opt = el.options[el.selectedIndex];
                    if (opt) detail.textValue = opt.innerText.trim();
                }
                window.dispatchEvent(new CustomEvent("AG_PAGE_STATE_HOOK", { detail }));
            }, 0);
        } else {
            window.dispatchEvent(new CustomEvent("AG_PAGE_STATE_HOOK", { detail }));
        }
    }

    // Intercept HTMLInputElement
    const nativeInputVal = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value");
    if (nativeInputVal && nativeInputVal.set) {
        Object.defineProperty(window.HTMLInputElement.prototype, "value", {
            set: function(val) {
                dispatch(this, val);
                return nativeInputVal.set.call(this, val);
            },
            get: nativeInputVal.get
        });
    }

    // Intercept HTMLSelectElement
    const nativeSelectVal = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, "value");
    if (nativeSelectVal && nativeSelectVal.set) {
        Object.defineProperty(window.HTMLSelectElement.prototype, "value", {
            set: function(val) {
                dispatch(this, val);
                return nativeSelectVal.set.call(this, val);
            },
            get: nativeSelectVal.get
        });
    }
    
    // Intercept HTMLTextAreaElement
    const nativeTextAreaVal = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value");
    if (nativeTextAreaVal && nativeTextAreaVal.set) {
        Object.defineProperty(window.HTMLTextAreaElement.prototype, "value", {
            set: function(val) {
                dispatch(this, val);
                return nativeTextAreaVal.set.call(this, val);
            },
            get: nativeTextAreaVal.get
        });
    }
})();
