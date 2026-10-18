import { ApiResponse } from "../utils/api-response.js";
import { AsyncHandler } from "../utils/async-handler.js";
import {
    registerUserService,
    loginUserService,
    logoutUserService,
    verifyEmailService,
    resendEmailVerificationService,
    refreshAccessTokenService,
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

export {
    registerUser,
    loginUser,
    logoutUser,
    currentUser,
    verifyEmail,
    refreshAccessToken,
    resendEmailVerification,
};
