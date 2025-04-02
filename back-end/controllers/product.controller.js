import Product from '../models/product.model.js';

export async function getAllProducts(request, response,next) {
    try {
        const products = await Product.find().populate('categoryId', 'name');
        response.status(200).json(products);
    } catch (error) {
        response.status(500).json({ error: error.message });
    }
}

export async function getProductById(request, response,next) {
    try {
        const { productId } = request.params;
        const product = await Product.findById(productId).populate('categoryId', 'name');
        if (!product) {
            return response.status(404).json({ error: 'Product not found' });
        }
        response.status(200).json(product);
    } catch (error) {
        response.status(500).json({ error: error.message });
    }
}

export async function createProduct(request, response,next) {
    try {
        const { name, description, price, categoryId } = request.body;
        const imageUrl = request.file.path; // Assuming you are using multer for file uploads

        const newProduct = new Product({
            name,
            description,
            price,
            categoryId,
            imageUrl
        });

        await newProduct.save();
        response.status(201).json(newProduct);
    } catch (error) {
        response.status(500).json({ error: error.message });
    }
}

export async function updateProduct (request, response , next){
    try{
        const { productId } = request.params;
        const { name, description, price, categoryId } = request.body;
        const imageUrl = request.file.path; // Assuming you are using multer for file uploads

        const modifyProduct = await Product.findByIdAndUpdate(
            productId,
            {
                name,
                description,
                price,
                categoryId,
                imageUrl
            },
            { new: true }
        );
        if (!modifyProduct) {
            return response.status(404).json({ error: 'Product not found' });
        }
        response.status(200).json(modifyProduct);
    } catch (error) {
        response.status(500).json({ error: error.message });
    }
}

export async function eliminateProduct (request, response , next){
    try{
        const { productId } = request.params;
        const deleteProduct = await Product.findByIdAndDelete(productId);
        if (!deleteProduct) {
            return response.status(404).json({ error: 'Product not found' });
        }
        response.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        response.status(500).json({ error: error.message });
    }
}

