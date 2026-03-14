class VoiceAssistant {
    constructor(speechCapture, voicePlayer, uiPanel) {
        this.capture = speechCapture;
        this.player = voicePlayer;
        this.ui = uiPanel;
        this.isBusy = false;
        this.backendUrl = 'http://localhost:5000/api/voice-query';
    }

    async handleVoiceRequest(buttonEl) {
        if (this.isBusy) return;
        this.isBusy = true;
        
        try {
            // UI State: Listening
            const originalText = buttonEl.innerHTML;
            buttonEl.innerHTML = "🎙️ Listening... (Speak Now)";
            buttonEl.style.backgroundColor = "#f38ba8"; // Red warning color
            buttonEl.style.color = "#11111b";

            // 1. Capture strict 5s audio
            const audioBlob = await this.capture.startRecording();

            // UI State: Processing
            buttonEl.innerHTML = "🧠 Processing Request...";
            buttonEl.style.backgroundColor = "#f9e2af"; // Yellow
            buttonEl.style.color = "#1e1e2e";

            // 2. Transmit to backend pipeline
            const formData = new FormData();
            formData.append('audio', audioBlob, 'query.webm');

            const response = await fetch(this.backendUrl, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                let errMsg = `Server returned ${response.status}`;
                try {
                    const errData = await response.json();
                    if (errData.error) errMsg = errData.error;
                } catch (e) {}
                throw new Error(errMsg);
            }

            const data = await response.json();

            if (data.audioChunk) {
                // UI State: Playing Answer
                buttonEl.innerHTML = "🔊 Assistant Speaking...";
                buttonEl.style.backgroundColor = "#a6e3a1"; // Green
                buttonEl.style.color = "#1e1e2e";
                
                await this.player.playBase64Audio(data.audioChunk);
            } else if (data.error) {
                throw new Error(data.error);
            }

            // Restore UI
            buttonEl.innerHTML = originalText;
            buttonEl.style.cssText = "";

        } catch (error) {
            console.error('Voice Assistant Failed:', error);
            alert(`Voice Assistant Error: ${error.message}`);
            buttonEl.innerHTML = "🎤 Ask Assistant";
            buttonEl.style.cssText = "";
        } finally {
            this.isBusy = false;
        }
    }
}
window.VoiceAssistant = VoiceAssistant;
