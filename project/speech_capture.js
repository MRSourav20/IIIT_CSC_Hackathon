class SpeechCapture {
    constructor() {
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.maxRecordTime = 5000; // 5 seconds constraint
    }

    async startRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaRecorder = new MediaRecorder(stream);
            this.audioChunks = [];

            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.audioChunks.push(event.data);
                }
            };

            return new Promise((resolve, reject) => {
                this.mediaRecorder.onstop = () => {
                    // Create an audio blob
                    const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
                    // Stop all microphone tracks immediately
                    stream.getTracks().forEach(track => track.stop());
                    resolve(audioBlob);
                };

                this.mediaRecorder.start();
                
                // Stop after 5 seconds to prevent huge payloads going to Sarvam
                setTimeout(() => {
                    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
                        this.mediaRecorder.stop();
                    }
                }, this.maxRecordTime);
            });

        } catch (error) {
            console.error('Error accessing microphone:', error);
            throw new Error('Microphone access denied or unavailable.');
        }
    }
}
window.SpeechCapture = SpeechCapture;
