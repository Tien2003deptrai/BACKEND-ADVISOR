const jwt = require("jsonwebtoken");

const signAccessToken = (payload, jwtId) => {
    return jwt.sign(
        { ...payload, token_type: "access" },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN || "7d",
            jwtid: jwtId,
        }
    );
};

const verifyAccessToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
};

const signRefreshToken = (payload, jwtId) => {
    return jwt.sign(
        { ...payload, token_type: "refresh" },
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "1d",
            jwtid: jwtId,
        }
    );
};

const verifyRefreshToken = (token) => {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
};

module.exports = { signAccessToken, verifyAccessToken, signRefreshToken, verifyRefreshToken };
