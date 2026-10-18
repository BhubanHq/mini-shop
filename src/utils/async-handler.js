const AsyncHandler = (requestHandler) => {
    return async (req, res, next) => {
        return Promise.resolve(requestHandler(req, res, next)).catch((error) =>
            next(error),
        );
    };
};

export { AsyncHandler };
