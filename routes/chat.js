const express = require("express");
const { GoogleGenAI } = require("@google/genai");

const router = express.Router();

router.post("/text-query", async (req, res) => {
    const { query, context } = req.body;

    if (!query) {
        return res.status(400).json({ error: "No query provided" });
    }

    if (!process.env.SARVAM_API_KEY) {
        return res.status(500).json({ error: "Sarvam API Key missing in server/.env" });
    }

    try {
        console.log(`💬 Processing text query: "${query}" via Sarvam AI...`);
        const apiKey = process.env.SARVAM_API_KEY;

        const response = await fetch('https://api.sarvam.ai/v1/chat/completions', {
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
                        "content": `You are an expert AI assistant helping Common Service Centre (CSC) operators in India navigate government service portals.
                        
                        Context (Current Page/Service): "${context || "General Query"}"
                        
                        Your Task:
                        1. Provide a concise explanation (2-3 sentences) to help the operator.
                        2. Suggest official government portals or specific service links if relevant.
                        3. Prefer domains like *.gov.in or *.nic.in.
                        
                        Return ONLY a raw JSON object with the following structure:
                        {
                          "response": "Your concise explanation here.",
                          "links": [
                            { "title": "Portal Name", "url": "https://example.gov.in" }
                          ]
                        }`
                    },
                    {
                        "role": "user",
                        "content": query
                    }
                ],
                temperature: 0.3
            })
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(`Sarvam AI Error: ${JSON.stringify(errData)}`);
        }

        const data = await response.json();
        const assistantAnswer = data.choices[0].message.content;

        // Robust JSON extraction from the string response
        let cleanJson = assistantAnswer.replace(/```json|```/g, "").trim();
        const firstBrace = cleanJson.indexOf('{');
        const lastBrace = cleanJson.lastIndexOf('}');
        
        if (firstBrace !== -1 && lastBrace !== -1) {
            cleanJson = cleanJson.substring(firstBrace, lastBrace + 1);
            try {
                const parsedResponse = JSON.parse(cleanJson);
                return res.json(parsedResponse);
            } catch (e) {
                // Fallback if JSON parsing fails but we have text
                return res.json({
                    response: assistantAnswer,
                    links: []
                });
            }
        }

        // Final fallback
        res.json({
            response: assistantAnswer,
            links: []
        });

    } catch (err) {
        console.error("Chat Pipeline Failed:", err);
        res.status(500).json({ error: "Chat Pipeline Failed: " + err.message });
    }
});

module.exports = router;
