class SteganographyEngine {
    constructor() {
        this.channelBits = 1; // Number of least significant bits to use per color channel
    }

    /**
     * Loads an image from a URL or Data URI into an HTML canvas
     */
    async _loadImageData(source) {
        return new Promise(async (resolve, reject) => {
            try {
                let blob;
                console.log("image loading...");
                
                if (source instanceof Blob) {
                    blob = source;
                } else if (typeof source === 'string') {
                    // Fetch the URL to get a Blob (works for chrome-extension:// paths)
                    const response = await fetch(source);
                    blob = await response.blob();
                } else {
                    throw new Error("Invalid image source for Steganography");
                }

                // createImageBitmap is a native memory operation immune to DOM CSP restrictions
                const bitmap = await createImageBitmap(blob, {
                    premultiplyAlpha: 'none',
                    colorSpaceConversion: 'none'
                });
                
                const canvas = document.createElement("canvas");
                canvas.width = bitmap.width;
                canvas.height = bitmap.height;
                const ctx = canvas.getContext("2d", { willReadFrequently: true });
                
                // Draw immutable bitmap into the canvas context
                ctx.drawImage(bitmap, 0, 0);
                
                resolve({
                    ctx: ctx,
                    canvas: canvas,
                    imageData: ctx.getImageData(0, 0, canvas.width, canvas.height)
                });
            } catch (err) {
                console.error("Steganography _loadImageData error:", err);
                reject(err);
            }
        });
    }

    /**
     * Hides binary data within the Least Significant Bits of the image pixels
     */
    async encodeBinaryInImage(imageSrc, binaryUint8Array) {
        const { ctx, canvas, imageData } = await this._loadImageData(imageSrc);
        const pixels = imageData.data; // [R, G, B, A, R, G, B, A...]

        // Calculate needed capacity in bits. 
        // 32 bits for length + (length_in_bytes * 8) bits for payload.
        const totalBits = 32 + (binaryUint8Array.length * 8);
        
        // We use 3 channels (RGB) per pixel, not Alpha to avoid visual artifacts.
        const totalAvailableBits = (pixels.length / 4) * 3;
        
        if (totalBits > totalAvailableBits) {
            throw new Error(`Data too large for image. Need ${totalBits} bits, but image only has ${totalAvailableBits} available.`);
        }

        // Convert payload length to a 32-bit binary string (padded)
        const lengthBinString = binaryUint8Array.length.toString(2).padStart(32, '0');

        let allBitsToEncode = lengthBinString;
        for (let i = 0; i < binaryUint8Array.length; i++) {
            allBitsToEncode += binaryUint8Array[i].toString(2).padStart(8, '0');
        }

        let bitIndex = 0;
        for (let i = 0; i < pixels.length && bitIndex < allBitsToEncode.length; i += 4) {
            // Encode in Red
            if (bitIndex < allBitsToEncode.length) {
                pixels[i] = (pixels[i] & ~1) | parseInt(allBitsToEncode[bitIndex++]);
            }
            // Encode in Green
            if (bitIndex < allBitsToEncode.length) {
                pixels[i + 1] = (pixels[i + 1] & ~1) | parseInt(allBitsToEncode[bitIndex++]);
            }
            // Encode in Blue
            if (bitIndex < allBitsToEncode.length) {
                pixels[i + 2] = (pixels[i + 2] & ~1) | parseInt(allBitsToEncode[bitIndex++]);
            }
            // We skip Alpha (i + 3)
        }

        // Write the modified pixels back to the canvas
        ctx.putImageData(imageData, 0, 0);
        
        // Return a raw Blob to completely bypass length limits & CSP restrictions on data URIs
        return new Promise(resolve => {
            canvas.toBlob((blob) => {
                resolve(blob);
            }, "image/png");
        });
    }

    /**
     * Extracts hidden binary data from the Least Significant Bits of the image pixels
     */
    async decodeBinaryFromImage(imageSrc) {
        const { imageData } = await this._loadImageData(imageSrc);
        const pixels = imageData.data;

        // 1. Read the first 32 bits to get the payload length
        let lengthBinString = "";
        let pixelIndex = 0;
        let bitsRead = 0;

        while (bitsRead < 32 && pixelIndex < pixels.length) {
            if (bitsRead < 32) { lengthBinString += (pixels[pixelIndex] & 1).toString(); bitsRead++; } // R
            if (bitsRead < 32) { lengthBinString += (pixels[pixelIndex + 1] & 1).toString(); bitsRead++; } // G
            if (bitsRead < 32) { lengthBinString += (pixels[pixelIndex + 2] & 1).toString(); bitsRead++; } // B
            pixelIndex += 4;
        }

        const payloadLengthBytes = parseInt(lengthBinString, 2);
        
        if (payloadLengthBytes === 0 || payloadLengthBytes > 100000) { // arbitrary sanity limit (100kb payload)
            throw new Error("No recognized steganography data found in image or data is corrupted.");
        }

        const totalPayloadBits = payloadLengthBytes * 8;
        let payloadBinString = "";
        bitsRead = 0;

        // Note: The previous loop might have stopped midway through a pixel's RGB channels.
        // To keep it simple, we re-parse from the absolute beginning, tracking overall bitIndex.
        
        let overallBitIndex = 0;
        for (let i = 0; i < pixels.length; i += 4) {
            for (let channel = 0; channel < 3; channel++) {
                if (overallBitIndex >= 32) { // Skip length prefix
                    if (bitsRead < totalPayloadBits) {
                        payloadBinString += (pixels[i + channel] & 1).toString();
                        bitsRead++;
                    } else {
                        break;
                    }
                }
                overallBitIndex++;
            }
            if (bitsRead >= totalPayloadBits) break;
        }

        // Convert big string of bits into Uint8Array
        const result = new Uint8Array(payloadLengthBytes);
        for (let i = 0; i < payloadLengthBytes; i++) {
            const byteStart = i * 8;
            const byteStr = payloadBinString.substring(byteStart, byteStart + 8);
            result[i] = parseInt(byteStr, 2);
        }

        return result;
    }
}

window.SteganographyEngine = SteganographyEngine;
