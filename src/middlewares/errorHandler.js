module.exports = (err, req, res, next) => {
    if (err?.name === "MulterError" && err?.code === "LIMIT_FILE_SIZE") {
        return res.status(422).json({ message: "file size must be less than or equal to 5MB" });
    }
    res.status(err.statusCode || 500).json({ message: err.message || "Internal server error" });
};
