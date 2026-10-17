import User from "../models/user.model.js";
import { AsyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import jwt from "jsonwebtoken";

export const verifyJWT = AsyncHandler(async (req, res, next) => {
    const token =
        req.cookies?.accessToken || req.headers.authorization?.split(" ")[1];
    if (!token) {
        throw new ApiError(401, "Unauthorized: No token provided");
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        const user = await User.findById(decoded._id).select(
            "-password -refreshToken -emailVerificationToken -emailVerificationTokenExpiry -forgotPasswordToken -forgotPasswordTokenExpiry",
        );
        if (!user) {
            throw new ApiError(401, "Unauthorized: User not found");
        }
        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, "Unauthorized: Invalid token");
    }
});
