const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const router = express.Router();
// Use memory storage so we can quickly turn the blob into base64 for Sarvam API
const upload = multer({ storage: multer.memoryStorage() });

router.post('/voice-query', upload.single('audio'), async (req, res) => {
    try {
        if (!process.env.SARVAM_API_KEY) {
            throw new Error("Missing SARVAM_API_KEY in .env");
        }
        
        if (!req.file) {
             return res.status(400).json({ error: "No audio file provided." });
        }

        console.log("🎤 Received voice query. Size:", req.file.size);
        const apiKey = process.env.SARVAM_API_KEY;

        // ---------------------------------------------------------
        // 1. SARVAM STT (Speech to Text)
        // ---------------------------------------------------------
        console.log("1. Transcribing audio via Sarvam STT...");
        
        // Sarvam REST STT requires a physical File/FormData in a standard HTTP post
        // So we temporarily write it to disk for the fetch payload
        const tempPath = path.join(__dirname, '../uploads/temp_audio.webm');
        fs.writeFileSync(tempPath, req.file.buffer);

        const sttFormData = new FormData();
        const blob = new Blob([fs.readFileSync(tempPath)], { type: 'audio/webm' });
        sttFormData.append('file', blob, 'audio.webm');
        sttFormData.append('language_code', 'hi-IN'); // Support Hindi
        sttFormData.append('model', 'saaras:v3'); // Standard Sarvam ASR

        const sttResponse = await fetch('https://api.sarvam.ai/speech-to-text', {
            method: 'POST',
            headers: {
                'api-subscription-key': apiKey
            },
            body: sttFormData
        });

        // Cleanup temp
        fs.unlinkSync(tempPath);

        const sttData = await sttResponse.json();
        const transcription = sttData.transcript;
        if (!transcription || transcription.trim() === '') {
            return res.status(400).json({ error: "Could not hear any speech. Please speak louder into the microphone." });
        }

        console.log("📝 Transcription: ", transcription);

        // ---------------------------------------------------------
        // 2. SARVAM LLM (Reasoning)
        // ---------------------------------------------------------
        console.log("2. Reasoning via Sarvam LLM...");
        
        // NOTE: We don't have `@sarvam/sdk` so we use Sarvam's open-compatible Chat Completions endpoint.
        const llmResponse = await fetch('https://api.sarvam.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-subscription-key': apiKey
            },
            body: JSON.stringify({
                model: "sarvam-30b",
                messages: [
                    {
                        "role": "system",
                        "content": "You are an AI assistant helping Common Service Centre operators fill government service forms. Provide accurate information about documents required, eligibility conditions, and form filling guidance. Keep your answers extremely concise, under 2 sentences. ALWAYS reply in conversational Hindi (written in English script ideally, or pure Hindi script)."
                    },
                    {
                        "role": "user",
                        "content": transcription
                    }
                ],
                temperature: 0.3
            })
        });

        const llmData = await llmResponse.json();
        if (!llmData.choices || llmData.choices.length === 0) {
            console.error("Sarvam LLM Error Response:", JSON.stringify(llmData, null, 2));
            throw new Error(`LLM Failed: ${JSON.stringify(llmData)}`);
        }
        const assistantAnswer = llmData.choices[0].message.content;
        console.log("🤖 LLM Answer: ", assistantAnswer);

        // ---------------------------------------------------------
        // 3. SARVAM TTS (Text to Speech)
        // ---------------------------------------------------------
        console.log("3. Synthesizing voice via Sarvam TTS...");

        const ttsResponse = await fetch('https://api.sarvam.ai/text-to-speech', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-subscription-key': apiKey
            },
            body: JSON.stringify({
                inputs: [assistantAnswer],
                target_language_code: "hi-IN",
                speaker: "shruti",
                pace: 1.1,
                speech_sample_rate: 16000,
                enable_preprocessing: true,
                model: "bulbul:v3"
            })
        });

        const ttsData = await ttsResponse.json();
        
        if (!ttsData.audios || ttsData.audios.length === 0) {
            console.error("Sarvam TTS Error Response:", JSON.stringify(ttsData, null, 2));
            throw new Error(`TTS failed to return audio: ${JSON.stringify(ttsData)}`);
        }

        console.log("✅ Pipeline Complete. Sending audio back to client.");
        
        // Return base64 string to the frontend voice_player
        res.json({
            audioChunk: ttsData.audios[0],
            transcription: transcription,
            answerText: assistantAnswer
        });

    } catch (error) {
        console.error("Voice Pipeline Error:", error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
