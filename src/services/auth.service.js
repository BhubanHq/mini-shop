import User from "../models/user.model.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import {
    sendMail,
    emailVerificationMailGenContent,
    forgotPasswordMailGenContent,
} from "../utils/mail.js";

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
    const { unHashedToken, HashedToken, tokenExpiry } =
        user.generateTemporaryToken();

    user.emailVerificationToken = HashedToken;
    user.emailVerificationTokenExpiry = tokenExpiry;
    await user.save({ validateBeforeSave: false });

    await sendMail({
        email: user.email,
        subject: "Email Verification",
        mailgenContent: emailVerificationMailGenContent(
            user.name,
            `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHashedToken}`,
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

export { registerUserService };
