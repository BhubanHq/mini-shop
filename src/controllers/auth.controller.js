import { ApiResponse } from "../utils/api-response.js";
import { AsyncHandler } from "../utils/async-handler.js";
import {
    registerUserService,
    loginUserService,
    logoutUserService,
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

export { registerUser, loginUser, logoutUser };
