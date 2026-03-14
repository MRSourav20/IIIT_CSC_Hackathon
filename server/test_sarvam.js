require('dotenv').config();
const fs = require('fs');

async function test() {
    const apiKey = process.env.SARVAM_API_KEY;
    console.log("Using API Key:", apiKey ? "Loaded length " + apiKey.length : "MISSING");

    try {
        console.log("Testing Sarvam LLM (sarvam-30b)...");
        const llmResponse = await fetch('https://api.sarvam.ai/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-subscription-key': apiKey
            },
            body: JSON.stringify({
                model: "sarvam-30b",
                messages: [
                    { "role": "user", "content": "How are you?" }
                ],
                temperature: 0.3
            })
        });

        const llmData = await llmResponse.json();
        fs.writeFileSync('sarvam_out.json', JSON.stringify(llmData, null, 2));
        console.log("Wrote out to sarvam_out.json");

    } catch (err) {
        console.error("LLM Test Failed:", err);
    }
}

test();
