const path = require("path");
const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");

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

        const outputFileName = `bg-removed-${Date.now()}.png`;
        const outputPath = path.join(__dirname, "../uploads", outputFileName);

        const form = new FormData();
        form.append("image", fs.createReadStream(inputPath));

        const response = await axios.post(
            "http://127.0.0.1:5001/remove",
            form,
            {
                headers: form.getHeaders(),
                responseType: "arraybuffer",
                timeout: 90000, // 90s safety timeout for inference itself
            }
        );

        fs.writeFileSync(outputPath, response.data);

        // Clean up original upload
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