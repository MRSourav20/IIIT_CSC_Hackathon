require('dotenv').config();
const fs = require('fs');
let logContent = "";

async function testTTS() {
    const apiKey = process.env.SARVAM_API_KEY;
    const url = 'https://api.sarvam.ai/text-to-speech';
    
    const payload1 = {
        inputs: ["Hello how are you"],
        target_language_code: "hi-IN",
        speaker: "shruti",
        pace: 1.1,
        speech_sample_rate: 16000,
        enable_preprocessing: true,
        model: "bulbul:v3"
    };

    // Test 2: Minimal payload
    const payload2 = {
        inputs: ["Hello how are you"],
        target_language_code: "hi-IN",
        speaker: "shruti",
        model: "bulbul:v3"
    };

    const payloads = [payload1, payload2];

    for (let i = 0; i < payloads.length; i++) {
        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'api-subscription-key': apiKey, 'Content-Type': 'application/json' },
                body: JSON.stringify(payloads[i])
            });
            const text = await res.text();
            fs.writeFileSync(`sarvam_out_${i+1}.txt`, text, 'utf8');
        } catch (e) {
            fs.writeFileSync(`sarvam_out_${i+1}.txt`, e.message, 'utf8');
        }
    }
}

testTTS();
