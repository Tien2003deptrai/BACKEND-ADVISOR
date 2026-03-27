const mongoose = require("mongoose");

const termSchema = new mongoose.Schema(
    {
        term_code: { type: String, required: true, unique: true, trim: true },
        academic_year: { type: String, required: true, trim: true },
        term_name: { type: String, required: true, trim: true },
        start_date: { type: Date, required: true },
        end_date: { type: Date, required: true },
        status: { type: String, enum: ["ACTIVE", "INACTIVE"], default: "INACTIVE" },
    },
    { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

termSchema.index(
    { status: 1 },
    { unique: true, partialFilterExpression: { status: "ACTIVE" } }
);
termSchema.index({ start_date: 1, end_date: 1 });

module.exports = mongoose.model("Term", termSchema);
