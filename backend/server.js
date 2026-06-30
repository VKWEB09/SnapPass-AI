const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
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

// Serve uploaded images
app.use("/uploads", express.static(uploadsDir));

// Upload Route
app.use("/api/upload", uploadRoutes);

// Health Check
app.get("/", (req, res) => {
    res.send("SnapPass AI Backend Running 🚀");
});

const PORT = process.env.PORT || 5000;

// Start the persistent Python rembg server ONCE.
// It keeps the model + heavy libs loaded in memory for all future requests.
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
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});