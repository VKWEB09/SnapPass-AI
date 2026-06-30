const path = require("path");
const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

exports.removeBackground = async (req, res) => {

    console.log("========== PYTHON REMOVE BG START ==========");

    const inputPath = req.file ? req.file.path : null;

    try {

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No image uploaded."
            });
        }

        // If Python server isn't ready yet (e.g. just after a cold start),
        // wait briefly instead of failing immediately.
        if (!global.pythonReady) {
            console.log("Python server not ready yet, waiting...");
            for (let i = 0; i < 30; i++) { // up to 60s
                if (global.pythonReady) break;
                await sleep(2000);
            }
        }

        if (!global.pythonReady) {
            fs.unlink(inputPath, () => { });
            return res.status(503).json({
                success: false,
                message: "Server is still starting up. Please try again in a moment."
            });
        }

        const outputFileName = `bg-removed-${Date.now()}.png`;
        const outputPath = path.join(__dirname, "../uploads", outputFileName);

        const form = new FormData();
        form.append("image", fs.createReadStream(inputPath));

        // Retry a couple of times in case of a transient connection issue
        let response;
        let lastErr;
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                response = await axios.post(
                    "http://127.0.0.1:5001/remove",
                    form,
                    {
                        headers: form.getHeaders(),
                        responseType: "arraybuffer",
                        timeout: 90000,
                    }
                );
                lastErr = null;
                break;
            } catch (err) {
                lastErr = err;
                console.error(`Attempt ${attempt} failed: ${err.message}`);
                await sleep(2000);
            }
        }

        if (lastErr) throw lastErr;

        fs.writeFileSync(outputPath, response.data);
        fs.unlink(inputPath, () => { });

        return res.json({
            success: true,
            image: outputFileName
        });

    } catch (err) {

        console.error(err.message);

        if (inputPath) fs.unlink(inputPath, () => { });

        return res.status(500).json({
            success: false,
            message: "Background removal failed."
        });

    }

};