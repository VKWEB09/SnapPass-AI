const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "../uploads"));
    },
    filename: (req, file, cb) => {
        const uniqueName =
            Date.now() + "-" + Math.round(Math.random() * 1e9);

        cb(null, uniqueName + path.extname(file.originalname));
    },
});

const fileFilter = (req, file, cb) => {
    const allowed = /jpg|jpeg|png/;

    const mimeType = allowed.test(file.mimetype);

    const extension = allowed.test(
        path.extname(file.originalname).toLowerCase()
    );

    if (mimeType && extension) {
        return cb(null, true);
    }

    return cb(
        new Error("Only JPG, JPEG and PNG files are allowed."),
        false
    );
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024,
    },
});

module.exports = upload;