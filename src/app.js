import express from "express";
import cors from "cors";

const app = express();

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
        allowHeaders: ["Content-Type", "Authorization"],
    }),
);

//import the routes
import healthCheckRouter from "./routes/healthcheck.routes.js";
import productRouter from "./routes/product.routes.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { notFoundMiddleware } from "./middlewares/notfound.middleware.js";

//use the routes
app.use("/api/v1", productRouter);
app.use("/api/v1", healthCheckRouter);

//middleware for error handling
app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
