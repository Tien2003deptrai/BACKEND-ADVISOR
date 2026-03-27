const userModel = require("../models/user.model");
const RevokedAccessToken = require("../models/revokedAccessToken.model");
const { verifyAccessToken } = require("../utils/jwt");

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Missing or invalid Authorization header" });
        }

        const token = authHeader.split(" ")[1];
        const decoded = verifyAccessToken(token);
        if (decoded.token_type !== "access") {
            return res.status(401).json({ message: "Invalid access token" });
        }

        const revoked = await RevokedAccessToken.findOne({ jti: decoded.jti }).select("_id");
        if (revoked) {
            return res.status(401).json({ message: "Access token has been revoked" });
        }

        const user = await userModel.findById(decoded.userId);
        if (!user) return res.status(401).json({ message: "User not found" });

        req.user = { userId: user._id, role: user.role };
        req.auth = {
            accessTokenJti: decoded.jti,
            accessTokenExp: decoded.exp,
        };
        // console.log('req.user', req.user)
        next();
    } catch (err) {
        return res.status(401).json({ message: "Unauthorized" });
    }
};

module.exports = authMiddleware;
