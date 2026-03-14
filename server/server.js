require("dotenv").config();
const express = require("express");
const cors = require("cors");
const documentRoutes = require("./routes/document");
const voiceRoutes = require("./routes/voice");
const chatRoutes = require("./routes/chat");

const app = express();

app.use(cors());
app.use(express.json());

// Mount the document OCR extraction route
app.use("/api", documentRoutes);

// Mount the Sarvam AI Voice Pipeline route
app.use("/api", voiceRoutes);

// Mount the Text Chat Pipeline route
app.use("/api", chatRoutes);

app.get("/", (req, res) => {
  res.send("AntiGravity AI Backend Running");
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
