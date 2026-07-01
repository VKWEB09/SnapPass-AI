const express = require("express");
const cors = require("cors");
const path = require("path");

const uploadRoutes = require("./routes/upload");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.static("C:\\Users\\Dell\\Desktop\\snappass-1"));

// Home Route
// app.get("/", (req, res) => {
//     res.send("SnapPass AI Backend is Running 🚀");
// });

// Removed home route — express.static serves index.html automatically

// Upload Route
app.use("/api/upload", uploadRoutes);

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});