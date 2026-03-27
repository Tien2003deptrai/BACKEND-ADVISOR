const User = require("../models/user.model");

const seedAdmin = async () => {
    const existingAdmin = await User.findOne({ role: "ADMIN" }).select("_id email username");
    if (existingAdmin) {
        console.log("Admin account exists, skip seeding");
        return existingAdmin;
    }

    const adminEmail = process.env.ADMIN_EMAIL || "admin@advisor.local";
    const adminUsername = process.env.ADMIN_USERNAME || "admin";
    const adminPassword = process.env.ADMIN_PASSWORD || "123456";
    const adminFullName = process.env.ADMIN_FULL_NAME || "System Administrator";

    try {
        const createdAdmin = await User.create({
            username: adminUsername,
            email: adminEmail,
            password_hash: adminPassword,
            role: "ADMIN",
            status: "ACTIVE",
            profile: {
                full_name: adminFullName,
            },
        });

        console.log("Seeded default admin account");
        return createdAdmin;
    } catch (error) {
        if (error?.code === 11000) {
            console.warn("Skip admin seeding due to duplicated email/username");
            return null;
        }

        throw error;
    }
};

module.exports = seedAdmin;
