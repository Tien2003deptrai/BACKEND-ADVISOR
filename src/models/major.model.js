const mongoose = require("mongoose");

const majorSchema = new mongoose.Schema(
    {
        major_code: { type: String, required: true, trim: true, uppercase: true },
        major_name: { type: String, required: true, trim: true },
        department_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Department",
            required: true,
            index: true,
        },
    },
    { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

majorSchema.index({ department_id: 1, major_code: 1 }, { unique: true });
majorSchema.index({ major_name: 1 });

module.exports = mongoose.model("Major", majorSchema);
