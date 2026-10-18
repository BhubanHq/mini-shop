import User from "../models/user.model.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import {
    sendMail,
    emailVerificationMailGenContent,
    forgotPasswordMailGenContent,
} from "../utils/mail.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
};

const registerUserService = async function (req) {
    const { email, name, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new ApiError(400, "User with this email already exists");
    }

    const user = await User.create({
        email,
        name,
        password,
        isEmailVerified: false,
    });

    // Generate email verification token and URL
    const { unHashedToken, hashedToken, tokenExpiry } =
        user.generateTemporaryToken();

    user.emailVerificationToken = hashedToken;
    user.emailVerificationTokenExpiry = tokenExpiry;
    await user.save({ validateBeforeSave: false });

    await sendMail({
        email: user.email,
        subject: "Email Verification",
        mailgenContent: emailVerificationMailGenContent(
            user.name,
            `${req.protocol}://${req.get("host")}/api/v1/auth/verify-email/${unHashedToken}`,
        ),
    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken -emailVerificationToken -emailVerificationTokenExpiry -forgotPasswordToken -forgotPasswordTokenExpiry",
    );

    if (!createdUser) {
        throw new ApiError(500, "Failed to retrieve created user");
    }
    return createdUser.toObject();
};

const loginUserService = async function (req) {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        throw new ApiError(401, "Invalid Email or Password");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Password is incorrect");
    }
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
        user._id,
    );

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken -emailVerificationToken -emailVerificationTokenExpiry -forgotPasswordToken -forgotPasswordTokenExpiry",
    );

    if (!loggedInUser) {
        throw new ApiError(500, "Failed to retrieve logged in user");
    }

    return {
        loggedInUser,
        accessToken,
        refreshToken,
    };
};

const logoutUserService = async function (req) {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: null,
            },
        },
        {
            new: true,
        },
    );
};

const verifyEmailService = async function (token) {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
        throw new ApiError(400, "Invalid or expired email verification token");
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationTokenExpiry = undefined;

    await user.save({ validateBeforeSave: false });

    return user.toObject();
};

const resendEmailVerificationService = async function (req) {
    const user = await User.findById(req.user._id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (user.isEmailVerified) {
        throw new ApiError(400, "Email is already verified");
    }

    // Generate a new email verification token and URL
    const { unHashedToken, hashedToken, tokenExpiry } =
        user.generateTemporaryToken();

    user.emailVerificationToken = hashedToken;
    user.emailVerificationTokenExpiry = tokenExpiry;
    await user.save({ validateBeforeSave: false });

    await sendMail({
        email: user.email,
        subject: "Email Verification",
        mailgenContent: emailVerificationMailGenContent(
            user.name,
            `${req.protocol}://${req.get("host")}/api/v1/auth/verify-email/${unHashedToken}`,
        ),
    });

    return {
        message: "Email verification link has been resent",
    };
};

const refreshAccessTokenService = async function (req) {
    const refreshToken =
        req.cookies?.refreshToken || req.headers.authorization?.split(" ")[1];

    if (!refreshToken) {
        throw new ApiError(401, "Unauthorized: No refresh token provided");
    }

    try {
        const decoded = jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_SECRET,
        );
        const user = await User.findById(decoded._id);
        if (!user || user.refreshToken !== refreshToken) {
            throw new ApiError(401, "Unauthorized: Invalid refresh token");
        }

        const { accessToken, refreshToken: newRefreshToken } =
            await generateAccessAndRefreshTokens(user._id);
        return { accessToken, refreshToken: newRefreshToken };
    } catch (error) {
        throw new ApiError(401, "Unauthorized: Invalid refresh token");
    }
};

export {
    registerUserService,
    loginUserService,
    logoutUserService,
    verifyEmailService,
    resendEmailVerificationService,
    refreshAccessTokenService,
};
