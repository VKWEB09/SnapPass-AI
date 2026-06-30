const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");

exports.removeBackground = async (req, res) => {

    console.log("========== PYTHON REMOVE BG START ==========");

    try {

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No image uploaded."
            });
        }

        const inputPath = req.file.path;

        const outputFileName = `bg-removed-${Date.now()}.png`;

        const outputPath = path.join(
            __dirname,
            "../uploads",
            outputFileName
        );

        console.log("Input:", inputPath);
        console.log("Output:", outputPath);

        const python = spawn("python", [

            path.join(__dirname, "../python/remove_bg.py"),

            inputPath,

            outputPath

        ]);

        python.stdout.on("data", (data) => {

            console.log(data.toString());

        });

        python.stderr.on("data", (data) => {

            console.error(data.toString());

        });

        python.on("close", (code) => {

            console.log("Python Exit Code:", code);

            // Clean up the original uploaded file to prevent disk fill
            fs.unlink(inputPath, () => {});

            if (code !== 0) {

                return res.status(500).json({

                    success: false,

                    message: "Background removal failed."

                });

            }

            return res.json({

                success: true,

                image: outputFileName

            });

        });

    }

    catch (err) {

        console.error(err);

        return res.status(500).json({

            success: false,

            message: err.message

        });

    }

};