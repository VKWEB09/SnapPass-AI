const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const axios = require("axios");
const { spawn } = require("child_process");

const uploadRoutes = require("./routes/upload");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use("/uploads", express.static(uploadsDir));
app.use("/api/upload", uploadRoutes);

app.get("/", (req, res) => {
    res.send("SnapPass AI Backend Running 🚀");
});

const PORT = process.env.PORT || 5000;

// Track whether the Python Flask server is ready to accept requests
global.pythonReady = false;

const pythonServer = spawn("python", [
    "-u",
    path.join(__dirname, "python/rembg_server.py"),
]);

pythonServer.stdout.on("data", (data) => {
    console.log(`[PYTHON] ${data}`);
});

pythonServer.stderr.on("data", (data) => {
    console.error(`[PYTHON ERROR] ${data}`);
});

pythonServer.on("close", (code) => {
    console.log(`Python server exited with code ${code}`);
    global.pythonReady = false;
});

// Poll Flask's /health endpoint until it responds, instead of guessing a fixed delay
async function waitForPython() {
    for (let i = 0; i < 60; i++) { // up to ~2 minutes
        try {
            await axios.get("http://127.0.0.1:5001/health", { timeout: 2000 });
            global.pythonReady = true;
            console.log("✅ Python rembg server is ready");
            return;
        } catch (err) {
            await new Promise((r) => setTimeout(r, 2000));
        }
    }
    console.error("❌ Python server did not become ready in time");
}

waitForPython();

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});