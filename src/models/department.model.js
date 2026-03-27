const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema(
    {
        department_code: { type: String, required: true, unique: true, trim: true, uppercase: true },
        department_name: { type: String, required: true, trim: true },
    },
    { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

departmentSchema.index({ department_name: 1 });

module.exports = mongoose.model("Department", departmentSchema);
