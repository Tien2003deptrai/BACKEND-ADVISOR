const mongoose = require('mongoose');
const bcrypt = require("bcryptjs");

const profileSchema = new mongoose.Schema(
    {
        full_name: { type: String, trim: true },
        phone: { type: String, trim: true },
        date_of_birth: { type: Date },
        gender: { type: String, enum: ["MALE", "FEMALE", "OTHER"] },
        address: { type: String, trim: true },
        avatar_url: { type: String, trim: true },
    },
    { _id: false }
);

const orgSchema = new mongoose.Schema(
    {
        department_id: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
        major_id: { type: mongoose.Schema.Types.ObjectId, ref: "Major" },
    },
    { _id: false }
);

const studentInfoSchema = new mongoose.Schema(
    {
        student_code: { type: String, trim: true },
        cohort_year: { type: Number, min: 1900, max: 3000 },
        advisor_user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        enrollment_status: {
            type: String,
            enum: ["ENROLLED", "ON_LEAVE", "GRADUATED", "DROPPED"],
            default: "ENROLLED",
        },
    },
    { _id: false }
);

const advisorInfoSchema = new mongoose.Schema(
    {
        staff_code: { type: String, trim: true },
        title: { type: String, trim: true },
    },
    { _id: false }
);

const userSchema = new mongoose.Schema(
    {
        username: { type: String, required: true, unique: true, trim: true },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password_hash: { type: String, minlength: 6, select: false },
        role: {
            type: String,
            enum: ["STUDENT", "ADVISOR", "FACULTY", "ADMIN"],
            default: "STUDENT",
        },
        status: { type: String, enum: ["ACTIVE", "INACTIVE", "LOCKED"], default: "ACTIVE" },
        profile: { type: profileSchema, default: {} },
        org: { type: orgSchema, default: {} },
        student_info: { type: studentInfoSchema, default: undefined },
        advisor_info: { type: advisorInfoSchema, default: undefined },
        last_login_at: { type: Date },
    },
    { timestamps: true }
);

userSchema.index({ "student_info.student_code": 1 }, { unique: true, sparse: true });
userSchema.index({ "student_info.advisor_user_id": 1 });
userSchema.index({ "org.department_id": 1 });
userSchema.index({ "org.major_id": 1 });
userSchema.index({ role: 1 });
userSchema.index({ role: 1, "student_info.advisor_user_id": 1 });

userSchema.pre("validate", function () {
    if (!this.username && this.email) {
        const localPart = String(this.email).split("@")[0];
        this.username = localPart;
    }
    if (!this.profile) this.profile = {};

    if (this.role === "STUDENT" && !this.student_info?.student_code) {
        this.invalidate("student_info.student_code", "student_info.student_code is required for STUDENT role");
    }
});

userSchema.pre("save", async function () {
    if (this.isModified("password_hash") && this.password_hash) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(this.password_hash, salt);
        this.password_hash = hashedPassword;
    }
});

userSchema.methods.comparePassword = async function (plainPassword) {
    const targetHash = this.password_hash;
    if (!targetHash) return false;
    return bcrypt.compare(plainPassword, targetHash);
};

module.exports = mongoose.model('User', userSchema);
