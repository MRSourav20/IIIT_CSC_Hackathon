class BackupEngine {
    constructor() {
        this.encryptor = new window.AESEncryption();
        this.stego = new window.SteganographyEngine();
        this.baseImageSrc = chrome.runtime.getURL('assets/panda.png');
    }

    static findLabelForInput(input) {
        // 1. Explicit <label for="id">
        if (input.id) {
            const label = document.querySelector(`label[for="${input.id}"]`);
            if (label && label.innerText.trim()) return label.innerText.trim();
        }
        
        // 2. Wrap-around <label> Text </label>
        const parentLabel = input.closest('label');
        if (parentLabel) {
            const clone = parentLabel.cloneNode(true);
            const childInput = clone.querySelector('input, select, textarea');
            if (childInput) clone.removeChild(childInput);
            const text = clone.innerText.trim();
            if (text) return text;
        }
        
        // 3. Aria-Label or Placeholder
        if (input.getAttribute('aria-label')) return input.getAttribute('aria-label').trim();
        if (input.placeholder && input.placeholder !== '') return input.placeholder.trim();
        
        // 4. Look across Grid/Flexbox Siblings (React pattern where label and input are in separate sibling divs)
        let parent = input;
        for (let i = 0; i < 3; i++) { // Walk up 3 levels max
            if (!parent) break;
            let prev = parent.previousElementSibling;
            while (prev) {
                // If the sibling is a label or contains a label
                if (prev.tagName === 'LABEL' && prev.innerText.trim()) return prev.innerText.trim();
                const childLabel = prev.querySelector('label');
                if (childLabel && childLabel.innerText.trim()) return childLabel.innerText.trim();
                
                // If the sibling is just a text block
                const text = prev.innerText ? prev.innerText.trim() : prev.textContent.trim();
                // Avoid picking up giant blocks of text or empty strings
                if (text && text.length > 0 && text.length < 50 && !text.includes('\n')) return text;
                
                prev = prev.previousElementSibling;
            }
            parent = parent.parentElement;
        }

        // 5. Clean Fallback
        return input.name || input.id || "Unknown Field";
    }

    _generateToken() {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            return crypto.randomUUID();
        }
        return Math.random().toString(36).substring(2) + Date.now().toString(36);
    }

    async createBackup(formData, citizenName) {
        if (!citizenName) citizenName = "Unknown";
        
        console.log("🐼 Initiating Panda Backup for:", citizenName);
        console.log("creating payload");
        
        const payload = {
            token: this._generateToken(),
            timestamp: new Date().toISOString(),
            citizen_name: citizenName,
            data: formData
        };

        const jsonString = JSON.stringify(payload);
        if (jsonString.length > 50000) {
            throw new Error("Form data too large for image backup.");
        }

        console.log("encrypting payload");
        const encryptedBinary = await this.encryptor.encrypt(jsonString);
        console.log("encryption complete");
        console.log("payload size:", encryptedBinary.length, "bytes");
        
        console.log("hiding data in image (steganography)...");
        
        const blob = await this.stego.encodeBinaryInImage(this.baseImageSrc, encryptedBinary);
        
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = `panda_backup_${citizenName.replace(/\s+/g, '_')}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        // Clean up the object URL after download completes
        setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
        
        console.log("✅ Panda Backup Created successfully!");
    }

    async readBackupPreview(file) {
        try {
            // Pass the raw File directly to Steganography instead of vulnerable FileReader data URIs
            const binaryPayload = await this.stego.decodeBinaryFromImage(file);
            const jsonString = await this.encryptor.decrypt(binaryPayload);
            const payload = JSON.parse(jsonString);
            return payload;
        } catch (err) {
            console.error("Backup Restore Exception:", err);
            throw new Error(`Failed to read steganography data: ${err.message}`);
        }
    }

    async restoreForm(payload) {
        return new Promise((resolve, reject) => {
            // Check if token was already used
            chrome.storage.local.get([payload.token], (result) => {
                if (result[payload.token]) {
                    reject(new Error("Backup already used"));
                    return;
                }
                
                // Mark token as used
                chrome.storage.local.set({ [payload.token]: true }, () => {
                    // Push data back to form directly by matching exact name/id
                    if (window.govvApp && window.govvApp.monitor) {
                        const inputsArray = Array.from(window.govvApp.monitor.inputs);
                        let restoredCount = 0;
                        
                        inputsArray.forEach(input => {
                            // Recover the semantic key we scraped during backup, or scrape it live if it's missing
                            const key = input.dataset.antigravityBackupKey || window.BackupEngine.findLabelForInput(input);
                            
                            if (key && payload.data[key] !== undefined && payload.data[key] !== "") {
                                // Only restore if it's not a file input or submit button
                                if (input.type && ['file', 'submit', 'button', 'hidden', 'image'].includes(input.type)) return;
                                
                                // Bypass React/Angular Synthetic Event wrappers by setting value natively
                                const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
                                const nativeSelectValueSetter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, "value").set;
                                const nativeTextAreaValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;
                                
                                const setNativeValue = (element, value) => {
                                    if (element.tagName === 'SELECT' && nativeSelectValueSetter) {
                                        nativeSelectValueSetter.call(element, value);
                                    } else if (element.tagName === 'TEXTAREA' && nativeTextAreaValueSetter) {
                                        nativeTextAreaValueSetter.call(element, value);
                                    } else if (element.tagName === 'INPUT' && nativeInputValueSetter) {
                                        nativeInputValueSetter.call(element, value);
                                    } else {
                                        element.value = value;
                                    }
                                };
                                
                                // For radios and checkboxes
                                if (input.type === 'checkbox' || input.type === 'radio') {
                                    if (input.value === payload.data[key] || payload.data[key] === 'on' || payload.data[key] === true) {
                                        input.checked = true;
                                        input.dispatchEvent(new Event('change', { bubbles: true }));
                                        input.dispatchEvent(new Event('click', { bubbles: true }));
                                    }
                                } else {
                                    setNativeValue(input, payload.data[key]);
                                }
                                
                                // Dispatch multiple event types to satisfy various framework listeners
                                input.dispatchEvent(new Event('input', { bubbles: true }));
                                input.dispatchEvent(new Event('change', { bubbles: true }));
                                input.dispatchEvent(new Event('blur', { bubbles: true }));
                                
                                // Visual styling
                                input.style.backgroundColor = '#e6fffa';
                                input.style.border = '1px solid #38bdf8';
                                setTimeout(() => {
                                    input.style.backgroundColor = '';
                                    input.style.border = '';
                                }, 3000);
                                
                                restoredCount++;
                            }
                        });
                        console.log(`🐼 Panda Restored ${restoredCount} exact fields from backup.`);
                        resolve(restoredCount);
                    } else {
                        reject(new Error("Form Monitor not available to inspect fields."));
                    }
                });
            });
        });
    }
}

window.BackupEngine = BackupEngine;
