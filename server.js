require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');
const seedAdmin = require("./src/bootstrap/seedAdmin");

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    await connectDB();
    try {
        await seedAdmin();
    } catch (error) {
        console.error("Admin seeding failed", error);
    }

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

startServer().catch((error) => {
    console.error("Failed to start server", error);
    process.exit(1);
});
