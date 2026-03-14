const express = require("express");
const multer = require("multer");
const Tesseract = require("tesseract.js");
const { GoogleGenAI } = require("@google/genai");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/analyze-document", upload.single("image"), async (req, res) => {
  if (!req.file) {
      return res.status(400).json({ error: "No image provided" });
  }

  console.log(`Analyzing file: ${req.file.path}`);
  
  try {
      // Step 1: Physical OCR Extraction via Tesseract
      console.log("Running Tesseract OCR...");
      const { data: { text } } = await Tesseract.recognize(
          req.file.path,
          'eng',
          { logger: m => console.log(`OCR Progress: ${m.status}`) }
      );
      
      console.log("--- RAW OCR TEXT ---");
      console.log(text);
      console.log("--------------------");

      // Step 2: Intelligent Extraction via Google Gemini
      if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_api_key_here') {
          console.warn("⚠️ GEMINI_API_KEY not found in .env! Falling back to raw text return.");
          return res.status(500).json({ error: "Gemini API Key missing in server/.env" });
      }

      console.log("Feeding OCR text to Gemini AI...");
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const prompt = `
      You are an expert identity document parser. I will provide you with raw, messy OCR text extracted from an Indian Aadhaar card.
      Your job is to cleanly extract the following 4 fields.
      Rules:
      - 'name': The person's full name. Ignore extraneous titles if possible.
      - 'dob': Date of birth. Format strictly as DD/MM/YYYY.
      - 'gender': Male, Female, or Transgender.
      - 'aadhaar_number': The 12 digit Aadhaar number. Format as continuous digits without spaces.
      
      If a field cannot be definitively found, return an empty string for it.
      
      Return ONLY a raw JSON object with those exact 4 keys. Do not include markdown formatting or backticks.
      
      RAW OCR TEXT:
      ${text}
      `;

      const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
              responseMimeType: "application/json",
          }
      });
      
      const parsedFields = JSON.parse(response.text);
      
      console.log("--- GEMINI JSON PAYLOAD ---");
      console.log(parsedFields);

      res.json({
        document_type: "aadhaar", 
        fields: parsedFields
      });

  } catch (err) {
      console.error("Pipeline Failed:", err);
      res.status(500).json({ error: "Document Pipeline Failed: " + err.message });
  }
});

module.exports = router;
