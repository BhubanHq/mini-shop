import Product from "../models/product.model.js";
import { ApiError } from "../utils/api-error.js";

const createProductService = async (productData) => {
    const existingProduct = await Product.findOne({ name: productData.name });

    if (existingProduct) {
        throw new ApiError(400, "Product with the same name already exists");
    }
    return await Product.create(productData);
};

const escapeRegex = (text) => {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

const getProductsService = async (query) => {
    const requestedPage = Number.parseInt(query.page, 10);
    const requestedLimit = Number.parseInt(query.limit, 10);

    const page =
        Number.isInteger(requestedPage) && requestedPage > 0
            ? requestedPage
            : 1;
    const limit =
        Number.isInteger(requestedLimit) && requestedLimit > 0
            ? Math.min(requestedLimit, 100)
            : 10;

    const skip = (page - 1) * limit;
    const filter = { isActive: true };

    if (query.category?.trim()) {
        filter.category = query.category.trim();
    }

    if (query.search?.trim()) {
        filter.name = {
            $regex: escapeRegex(query.search.trim()),
            $options: "i",
        };
    }
    const [products, totalProducts] = await Promise.all([
        Product.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),

        Product.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalProducts / limit);

    return {
        products,
        pagination: {
            page,
            limit,
            totalProducts,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
        },
    };
};

const getProductByIdService = async (productId) => {
    const product = await Product.findById(productId).lean();

    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    return product;
};

const updateProductService = async (productId, updateData) => {
    // console.log("Update Service Reached");
    // console.log("ID :", productId);
    // console.log("Update Data :", updateData);
    const product = await Product.findById(productId);

    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    Object.assign(product, updateData);
    product.updatedAt = new Date();

    await product.save();

    return product.toObject();
};

const deleteProductService = async (productId) => {
    const product = await Product.findById(productId);

    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    product.isActive = false;
    product.updatedAt = new Date();

    await product.save();

    return product.toObject();
};

export {
    createProductService,
    getProductsService,
    getProductByIdService,
    updateProductService,
    deleteProductService,
};
