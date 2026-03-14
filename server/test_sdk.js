const { GoogleGenAI } = require("@google/genai");
const ai = new GoogleGenAI({ apiKey: "test" });
console.log("ai.models:", ai.models);
console.log("ai.models.generateContent:", ai.models ? typeof ai.models.generateContent : "undefined");
