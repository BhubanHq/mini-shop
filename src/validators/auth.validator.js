import { body, param } from "express-validator";

const emailValidator = () =>
    body("email")
        .isString()
        .withMessage("Email must be a string")
        .bail()
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .bail()
        .isEmail()
        .withMessage("Invalid email address")
        .toLowerCase();

const passwordValidator = (field, minimum = 1) =>
    body(field)
        .isString()
        .withMessage(`${field} must be a string`)
        .bail()
        .notEmpty()
        .withMessage(`${field} is required`)
        .bail()
        .isLength({ min: minimum })
        .withMessage(`${field} must be at least ${minimum} characters long`);

const userRegisterValidator = () => [
    emailValidator(),
    body("name")
        .isString()
        .withMessage("Name must be a string")
        .bail()
        .trim()
        .isLength({ min: 3 })
        .withMessage("Name must be at least 3 characters long"),
    passwordValidator("password", 6),
];

const userLoginValidator = () => [emailValidator(), passwordValidator("password")];

const changePasswordValidator = () => [
    passwordValidator("currentPassword"),
    passwordValidator("newPassword", 6),
];

const userForgotPasswordValidator = () => [emailValidator()];

const tokenValidator = () => [
    param("token")
        .matches(/^[a-f0-9]{64}$/i)
        .withMessage("Token must be a 64-character hexadecimal string"),
];

const resetPasswordValidator = () => [
    ...tokenValidator(),
    passwordValidator("newPassword", 6),
];

export {
    userRegisterValidator,
    userLoginValidator,
    changePasswordValidator,
    userForgotPasswordValidator,
    tokenValidator,
    resetPasswordValidator,
};
