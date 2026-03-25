const ROLE_ALIAS = {
    admin: "ADMIN",
    user: "STUDENT",
};

const normalizeRole = (role) => ROLE_ALIAS[role] || role;

const authorizeRoles = (...roles) => {
    const allowedRoles = roles.map(normalizeRole);

    return (req, res, next) => {
        if (!req.user) return res.status(401).json({ message: "Unauthorized" });

        const currentRole = normalizeRole(req.user.role);
        if (!allowedRoles.includes(currentRole)) {
            return res.status(403).json({ message: "Forbidden: insufficient permissions" });
        }

        next();
    };
};

module.exports = authorizeRoles;
