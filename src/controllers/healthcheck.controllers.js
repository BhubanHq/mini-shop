import { ApiResponse } from "../utils/api-response.js";
import { AsyncHandler } from "../utils/async-handler.js";

const healthCheck = AsyncHandler(async (req, res) => {
    res.status(200).json(new ApiResponse(200, null, "Server is healthy"));
});

export { healthCheck };
