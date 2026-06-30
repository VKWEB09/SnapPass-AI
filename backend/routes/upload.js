const express = require("express");
const upload = require("../middleware/uploadMiddleware");
const { removeBackground } = require("../controllers/removeBgController");

const router = express.Router();

router.post("/", (req, res) => {

    upload.single("image")(req, res, async function (err) {

        if (err) {
            console.log(err);

            return res.status(400).json({
                success: false,
                error: err.message,
            });
        }

        console.log(req.file);

        await removeBackground(req, res);

    });

});

module.exports = router;