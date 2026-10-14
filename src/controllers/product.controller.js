import { AsyncHandler } from "../utils/async-handler.js";
import { ApiResponse } from "../utils/api-response.js";
import {
    createProductService,
    getProductsService,
    getProductByIdService,
    updateProductService,
    deleteProductService,
} from "../services/product.service.js";

const createProduct = AsyncHandler(async (req, res) => {
    const product = await createProductService(req.body);

    res.status(201).json(
        new ApiResponse(201, product, "Product created successfully"),
    );
});

const getProducts = AsyncHandler(async (req, res) => {
    const result = await getProductsService(req.query);

    res.status(200).json(
        new ApiResponse(200, result, "Products fetched successfully"),
    );
});

const getProductById = AsyncHandler(async (req, res) => {
    //   console.log("Routee params :", req.params);
    const product = await getProductByIdService(req.params.id);

    res.status(200).json(
        new ApiResponse(200, product, "Product fetched successfully"),
    );
});

const updateProduct = AsyncHandler(async (req, res) => {
    //    console.log("Update Controller Reached");
    //    console.log("Routee params :", req.params);
    //    console.log("Request Body :", req.body);
    const product = await updateProductService(req.params.id, req.body);

    res.status(200).json(
        new ApiResponse(200, product, "Product updated successfully"),
    );
});

const deleteProduct = AsyncHandler(async (req, res) => {
    const product = await deleteProductService(req.params.id);

    res.status(200).json(
        new ApiResponse(200, product, "Product deleted successfully"),
    );
});

export {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
};
