import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
app.use(cookieParser());
// basic configuration
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));

// cors configuration
app.use(
    cors({
        origin: process.env.CORS_ORIGIN?.split(",") || "http://localhost:3000",
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    }),
);

//import the routes
import healthCheckRouter from "./routes/healthcheck.routes.js";
import productRouter from "./routes/product.routes.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { notFoundMiddleware } from "./middlewares/notfound.middleware.js";
import authRouter from "./routes/auth.route.js";

//use the routes
app.use("/api/v1", productRouter);
app.use("/api/v1", healthCheckRouter);

// auth routes
app.use("/api/v1/auth", authRouter);

//middleware for error handling
app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
