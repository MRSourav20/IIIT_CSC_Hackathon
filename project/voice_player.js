class VoicePlayer {
    constructor() {
        this.audioContext = null;
    }

    playBase64Audio(base64Data) {
        if (!base64Data) return;
        
        try {
            // Attempt to play it via a standard Audio element
            const audioStr = 'data:audio/wav;base64,' + base64Data;
            const audio = new Audio(audioStr);
            
            return new Promise((resolve) => {
                audio.onended = () => {
                    resolve(true); 
                };
                audio.onerror = (e) => {
                    console.error("Audio playback error:", e);
                    resolve(false);
                };
                
                audio.play().catch(e => {
                    console.error("DOMException on audio playback:", e);
                    resolve(false);
                });
            });
        } catch (e) {
            console.error("VoicePlayer fail setup:", e);
            return Promise.resolve(false);
        }
    }
}

window.VoicePlayer = VoicePlayer;
