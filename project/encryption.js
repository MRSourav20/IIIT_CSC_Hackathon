class AESEncryption {
    constructor() {
        this.password = "AntiGravityPandaBackupKey123!";
    }

    async _getKey() {
        if (!crypto || !crypto.subtle) {
            throw new Error("Web Crypto API is not available. Please ensure you are running this page on HTTPS or localhost (Secure Context).");
        }
        const enc = new TextEncoder();
        const keyMaterial = await crypto.subtle.importKey(
            "raw",
            enc.encode(this.password),
            { name: "PBKDF2" },
            false,
            ["deriveBits", "deriveKey"]
        );
        return crypto.subtle.deriveKey(
            {
                name: "PBKDF2",
                salt: enc.encode("panda_salt"),
                iterations: 100000,
                hash: "SHA-256"
            },
            keyMaterial,
            { name: "AES-GCM", length: 256 },
            true,
            ["encrypt", "decrypt"]
        );
    }

    async encrypt(textPayload) {
        const key = await this._getKey();
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encodedText = new TextEncoder().encode(textPayload);

        const ciphertextBuffer = await crypto.subtle.encrypt(
            { name: "AES-GCM", iv: iv },
            key,
            encodedText
        );

        const ciphertextArray = new Uint8Array(ciphertextBuffer);
        
        // Combine IV and Ciphertext into one binary array
        const payload = new Uint8Array(iv.length + ciphertextArray.length);
        payload.set(iv, 0);
        payload.set(ciphertextArray, iv.length);
        return payload;
    }

    async decrypt(binaryPayload) {
        const key = await this._getKey();
        const iv = binaryPayload.slice(0, 12);
        const ciphertext = binaryPayload.slice(12);

        try {
            const decryptedBuffer = await crypto.subtle.decrypt(
                { name: "AES-GCM", iv: iv },
                key,
                ciphertext
            );
            return new TextDecoder().decode(decryptedBuffer);
        } catch (e) {
            console.error("Decryption failed:", e);
            throw new Error("Invalid or corrupted backup file. Decryption failed.");
        }
    }
}

window.AESEncryption = AESEncryption;
