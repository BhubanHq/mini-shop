const asyncHandler = (requeseHandler) => {
    return async (req, res, next) => {
        Promise.resolve(requeseHandler(req, res, next)).catch((error) =>
            next(error),
        );
    };
};

export { asyncHandler };
