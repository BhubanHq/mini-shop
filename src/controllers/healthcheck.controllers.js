import { ApiResponse } from "../utils/api-response.js";

const healthCheck = (req, res) => {
    try {
        res.status(200).json(
            new ApiResponse(200, { message: "Server is healthy" }),
        );
    } catch (error) {
        console.error("Health check error:", error);
        res.status(500).json(
            new ApiResponse(500, { message: "Internal server error" }),
        );
    }
};

export { healthCheck };
