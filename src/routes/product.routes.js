import { Router } from "express";
import {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
} from "../controllers/product.controller.js";

import {
    productValidator,
    productQueryValidator,
    getProductByIdValidator,
    productUpdateValidator,
} from "../validators/product.validator.js";

const router = Router();

router.get("/products", productQueryValidator, getProducts);
router.post("/products", productValidator, createProduct);
router.get("/products/:id", getProductByIdValidator, getProductById);
router.patch(
    "/products/:id",
    getProductByIdValidator,
    productUpdateValidator,
    updateProduct,
);
router.delete("/products/:id", getProductByIdValidator, deleteProduct);

export default router;
