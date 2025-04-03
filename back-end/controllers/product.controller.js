import Product from '../models/Products.js';

export async function getAllProducts(request, response,next) {
    try {
        const products = await Product.find().populate('category', 'name');
        if (!products || products.length === 0) {
            return response.status(404).json({ error: 'No products found' });
        }
        // Filter products based on query parameters
        const { category } = request.query;
        if (category) {
            products = products.filter(product => product.category.toLowerCase().includes(category.toLowerCase()));
        }
     
        // Pagination logic
        const { page = 1, limit = 10 } = request.query;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const totalProducts = products.length;
        const totalPages = Math.ceil(totalProducts / limit);
        const paginatedProducts = products.slice(startIndex, endIndex);
        const pagination = {
            totalProducts,
            totalPages,
            currentPage: parseInt(page),
            productsPerPage: parseInt(limit),
        };
        response.set('X-Pagination', JSON.stringify(pagination));

       
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

