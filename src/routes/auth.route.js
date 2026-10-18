import Router from "express";
import {
    registerUser,
    loginUser,
    logoutUser,
    currentUser,
    verifyEmail,
    resendEmailVerification,
    refreshAccessToken,
} from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validator.middleware.js";
import {
    userRegisterValidator,
    userLoginValidator,
} from "../validators/auth.validator.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(userRegisterValidator(), validate, registerUser);
router.route("/login").post(userLoginValidator(), validate, loginUser);
router.route("/verify-email/:token").get(verifyEmail);

//secure routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/me").get(verifyJWT, currentUser);
router
    .route("/resend-verification-email")
    .post(verifyJWT, resendEmailVerification);
router.route("/refresh-access-token").post(verifyJWT, refreshAccessToken);

export default router;
