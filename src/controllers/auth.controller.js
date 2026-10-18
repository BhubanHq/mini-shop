import { ApiResponse } from "../utils/api-response.js";
import { AsyncHandler } from "../utils/async-handler.js";
import {
    registerUserService,
    loginUserService,
    logoutUserService,
    verifyEmailService,
    resendEmailVerificationService,
    refreshAccessTokenService,
    forgotPasswordService,
    resetPasswordService,
    changePasswordService,
} from "../services/auth.service.js";

const registerUser = AsyncHandler(async (req, res) => {
    const user = await registerUserService(req);

    res.status(201).json(
        new ApiResponse(201, user, "User registered successfully"),
    );
});

const loginUser = AsyncHandler(async (req, res) => {
    const user = await loginUserService(req);

    let options = {
        httpOnly: true,
        secure: true,
    };
    res.status(200)
        .cookie("accessToken", user.accessToken, options)
        .cookie("refreshToken", user.refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: user.loggedInUser,
                    accessToken: user.accessToken,
                    refreshToken: user.refreshToken,
                },
                "User logged in successfully",
            ),
        );
});

const logoutUser = AsyncHandler(async (req, res) => {
    await logoutUserService(req);

    let options = {
        httpOnly: true,
        secure: true,
    };
    res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, null, "User logged out successfully"));
});

const currentUser = AsyncHandler(async (req, res) => {
    res.status(200).json(
        new ApiResponse(200, req.user, "Current user retrieved successfully"),
    );
});

const verifyEmail = AsyncHandler(async (req, res) => {
    const { token } = req.params;
    await verifyEmailService(token);

    res.status(200).json(
        new ApiResponse(200, null, "Email verified successfully"),
    );
});

const resendEmailVerification = AsyncHandler(async (req, res) => {
    const result = await resendEmailVerificationService(req);

    res.status(200).json(
        new ApiResponse(200, result, "Email verification link has been resent"),
    );
});

const refreshAccessToken = AsyncHandler(async (req, res) => {
    const { accessToken, refreshToken } = await refreshAccessTokenService(req);

    let options = {
        httpOnly: true,
        secure: true,
    };
    res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                { accessToken, refreshToken },
                "Access token refreshed successfully",
            ),
        );
});

const forgotPassword = AsyncHandler(async (req, res) => {
    const result = await forgotPasswordService(req);

    res.status(200).json(
        new ApiResponse(200, result, "Password reset link has been sent"),
    );
});

const resetPassword = AsyncHandler(async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;

    const result = await resetPasswordService(token, newPassword);

    res.status(200).json(
        new ApiResponse(200, result, "Password has been reset successfully"),
    );
});

const changePassword = AsyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const result = await changePasswordService(
        req.user._id,
        currentPassword,
        newPassword,
    );
    res.status(200).json(
        new ApiResponse(200, result, "Password changed successfully"),
    );
});

export {
    registerUser,
    loginUser,
    logoutUser,
    currentUser,
    verifyEmail,
    refreshAccessToken,
    resendEmailVerification,
    forgotPassword,
    resetPassword,
    changePassword,
};
