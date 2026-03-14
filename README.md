# AntiGravity AI Co-Pilot 🚀

An AI Assistant designed for government portals and CSC (Common Service Centre) operators to streamline form filling, document classification, and accessibility through voice and AI.

## ✨ Features
- **AI Form Detection**: Automatically identifies requirements for various government forms.
- **Smart Autofill**: Uses AI-driven field mapping to speed up data entry.
- **Voice Assistant**: Integrated speech capture and voice feedback for better accessibility.
- **Document Classification**: Built-in support for Aadhaar, PAN, and miscellaneous certificates.
- **Data Security**: Implements steganography and encryption for sensitive handling.
- **Visual Feedback**: Real-time form requirement UI and guidance panels.

## 📂 Project Structure
- `/`: Chrome Extension source files (JavaScript, HTML, CSS).
- `/server/`: Node.js backend server with Gemini and Sarvam AI integrations.
- `/assets/`: Media and static resources.

## 🚀 Setup Instructions

### 1. Backend Server
1. Navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example` and add your API keys:
   ```bash
   GEMINI_API_KEY=your_key_here
   SARVAM_API_KEY=your_key_here
   ```
4. Start the server:
   ```bash
   node server.js
   ```

### 2. Chrome Extension
1. Open Chrome and navigate to `chrome://extensions/`.
2. Enable **Developer mode** (toggle in the top right).
3. Click **Load unpacked** and select the root folder of this project.

## 🛠️ Security Note
The `.env` file contains sensitive information and is ignored by Git via `.gitignore`. Never upload your real `.env` file to any public repository.
