import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        name: {
            type: String,
            trim: true,
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [6, "Password must be at least 6 characters long"],
        },
        role: {
            type: String,
            enum: ["customer", "admin"],
            default: "customer",
        },
        isEmailVerified: {
            type: Boolean,
            default: false,
        },
        refreshToken: {
            type: String,
        },
        forgotPasswordToken: {
            type: String,
        },
        forgotPasswordTokenExpiry: {
            type: Date,
        },
        emailVerificationToken: {
            type: String,
        },
        emailVerificationTokenExpiry: {
            type: Date,
        },
    },
    {
        timestamps: true,
    },
);

userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            role: this.role,
        },
        process.env.JWT_ACCESS_SECRET,
        {
            expiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
        },
    );
};

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            role: this.role,
        },
        process.env.JWT_REFRESH_SECRET,
        {
            expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
        },
    );
};

userSchema.methods.generateTemporaryToken = function () {
    const unHashedToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
        .createHash("sha256")
        .update(unHashedToken)
        .digest("hex");
    const tokenExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes from now

    return { unHashedToken, hashedToken, tokenExpiry };
};

const User = mongoose.model("User", userSchema);
export default User;
