import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import mongoose from "mongoose";
const productValidator = (req, res, next) => {
    const { name, description, price, stock, category, isActive } = req.body;

    if (
        typeof name !== "string" ||
        name.trim().length === 0 ||
        typeof category !== "string" ||
        category.trim().length === 0
    ) {
        return res.status(400).json({
            message:
                "Name and category are required and must be non-empty strings",
        });
    }

    if (description !== undefined && typeof description !== "string") {
        return res
            .status(400)
            .json({ message: "Description must be a string" });
    }

    if (!Number.isInteger(price) || price < 0) {
        return res.status(400).json({
            message: "Price must be a number greater than or equal to 0",
        });
    }

    if (!Number.isInteger(stock) || stock < 0) {
        return res.status(400).json({
            message: "Stock must be a number greater than or equal to 0",
        });
    }

    if (isActive !== undefined && typeof isActive !== "boolean") {
        return res.status(400).json({ message: "isActive must be a boolean" });
    }

    next();
};

const getProductByIdValidator = (req, res, next) => {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
        return next(new ApiError(400, "Invalid product ID"));
    }

    next();
};

const productUpdateValidator = (req, res, next) => {
    // console.log("Product Update Validator Reached");
    // console.log("Request Body :", req.body);
    // console.log("Request Params :", req.params);

    const body = req.body;

    if (!body || typeof body !== "object" || Array.isArray(body)) {
        return next(new ApiError(400, "Request body must be a valid object"));
    }

    const fieldNames = Object.keys(body);

    if (fieldNames.length === 0) {
        return next(
            new ApiError(
                400,
                "Request body must contain at least one field to update",
            ),
        );
    }

    const unknownFields = fieldNames.filter(
        (field) =>
            ![
                "name",
                "description",
                "price",
                "stock",
                "category",
                "isActive",
            ].includes(field),
    );

    if (unknownFields.length > 0) {
        return next(
            new ApiError(
                400,
                `Unknown fields in request body: ${unknownFields.join(", ")}`,
            ),
        );
    }

    if ("name" in body) {
        if (typeof body.name !== "string" || body.name.trim().length === 0) {
            return next(new ApiError(400, "Name must be a non-empty string"));
        }
        body.name = body.name.trim();
    }

    if ("description" in body) {
        if (typeof body.description !== "string") {
            return next(new ApiError(400, "Description must be a string"));
        }
        body.description = body.description.trim();
    }

    if ("price" in body) {
        if (!Number.isFinite(body.price) || body.price < 0) {
            return next(
                new ApiError(
                    400,
                    "Price must be a number greater than or equal to 0",
                ),
            );
        }
    }

    if ("stock" in body) {
        if (!Number.isFinite(body.stock) || body.stock < 0) {
            return next(
                new ApiError(
                    400,
                    "Stock must be a number greater than or equal to 0",
                ),
            );
        }
    }

    if ("category" in body) {
        if (
            typeof body.category !== "string" ||
            body.category.trim().length === 0
        ) {
            return next(
                new ApiError(400, "Category must be a non-empty string"),
            );
        }
        body.category = body.category.trim();
    }

    if ("isActive" in body) {
        if (typeof body.isActive !== "boolean") {
            return next(new ApiError(400, "isActive must be a boolean"));
        }
    }

    next();
};

export { productValidator, getProductByIdValidator, productUpdateValidator };
