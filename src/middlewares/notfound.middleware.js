import { ApiError } from "../utils/api-error.js";

const notFoundMiddleware = (req, res, next) => {
    next(
        new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`),
    );
};

export { notFoundMiddleware };
