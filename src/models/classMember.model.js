const mongoose = require("mongoose");

const classMemberSchema = new mongoose.Schema(
    {
        class_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "AdvisorClass",
            required: true,
        },
        student_user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        joined_at: { type: Date, default: Date.now },
        status: { type: String, enum: ["ACTIVE", "INACTIVE"], default: "ACTIVE" },
    },
    { timestamps: true, collection: "class_members" }
);

classMemberSchema.index({ student_user_id: 1 }, { unique: true });
classMemberSchema.index({ class_id: 1, student_user_id: 1 }, { unique: true });
classMemberSchema.index({ class_id: 1, status: 1 });

module.exports = mongoose.model("ClassMember", classMemberSchema);
