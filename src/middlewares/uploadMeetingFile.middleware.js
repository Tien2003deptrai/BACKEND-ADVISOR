const multer = require("multer");

const allowedMimeTypes = new Set([
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const storage = multer.memoryStorage();

const uploadMeetingFile = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        if (!allowedMimeTypes.has(file.mimetype)) {
            const error = new Error("only doc, docx, pdf files are allowed");
            error.statusCode = 422;
            return cb(error);
        }
        cb(null, true);
    },
});

module.exports = uploadMeetingFile;
