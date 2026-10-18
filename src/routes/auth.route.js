import { Router } from "express";
import {
    registerUser,
    loginUser,
    logoutUser,
    currentUser,
    verifyEmail,
    resendEmailVerification,
    refreshAccessToken,
    forgotPassword,
    resetPassword,
    changePassword,
} from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validator.middleware.js";
import {
    userRegisterValidator,
    userLoginValidator,
    userForgotPasswordValidator,
    tokenValidator,
    resetPasswordValidator,
    changePasswordValidator,
} from "../validators/auth.validator.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(userRegisterValidator(), validate, registerUser);
router.route("/login").post(userLoginValidator(), validate, loginUser);
router.route("/verify-email/:token").get(tokenValidator(), validate, verifyEmail);
router
    .route("/forgot-password")
    .post(userForgotPasswordValidator(), validate, forgotPassword);
router
    .route("/reset-password/:token")
    .post(resetPasswordValidator(), validate, resetPassword);

// Refresh authenticates using the refresh token, even after the access token expires.
router.route("/refresh-access-token").post(refreshAccessToken);

//secure routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/me").get(verifyJWT, currentUser);
router
    .route("/resend-verification-email")
    .post(verifyJWT, resendEmailVerification);
router
    .route("/change-password")
    .post(verifyJWT, changePasswordValidator(), validate, changePassword);

export default router;
