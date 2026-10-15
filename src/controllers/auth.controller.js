import { ApiResponse } from "../utils/api-response.js";
import { AsyncHandler } from "../utils/async-handler.js";
import { registerUserService } from "../services/auth.service.js";

const registerUser = AsyncHandler(async (req, res) => {
    const user = await registerUserService(req);

    res.status(201).json(
        new ApiResponse(201, user, "User registered successfully"),
    );
});

export { registerUser };
