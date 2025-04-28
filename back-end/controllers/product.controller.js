import Product from '../models/Products.js';

export async function getAllProducts(request, response, next) {
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
        const { page = 1, limit = 8 } = request.query;
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
        response.set('X-Pagination', JSON.stringify({
            products: paginatedProducts,
            pagination: pagination
        }));

        response.status(200).json(paginatedProducts);
    } catch (error) {
        response.status(500).json({ error: error.message });
    }
}

export async function getProductById(request, response, next) {
    try {
        const { productId } = request.params;
        const product = await Product.findById(productId).populate('category', 'name');
        if (!product) {
            return response.status(404).json({ error: 'Product not found' });
        }
        response.status(200).json(product);
    } catch (error) {
        response.status(500).json({ error: error.message });
    }
}

export const createProduct = async (req, res) => {
    try {
        const { name, description, price, category, stock, cloudinaryUrls } = req.body;
        
        // Array per memorizzare le immagini
        let imageUrl = [];
        
        // Gestisce file caricati direttamente (dal multer)
        if (req.files && req.files.length > 0) {
            imageUrl = req.files.map(file => file.path);
        } 
        // Gestisce URL Cloudinary
        else if (cloudinaryUrls) {
            try {
                imageUrl = JSON.parse(cloudinaryUrls);
            } catch (error) {
                return res.status(400).json({ error: "Errore nel formato degli URL Cloudinary" });
            }
        }
        
        const newProduct = new Product({
            name,
            description,
            price,
            category,
            stock,
            imageUrl
        });
        
        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export async function updateProduct(request, response, next) {
    try {
        const { productId } = request.params;
        const { name, description, price, category, stock } = request.body;
        let existingImages = [];
    
        // Parse JSON string to array
        if (request.body.existingImages) {
            try {
                existingImages = JSON.parse(request.body.existingImages);
            } catch (e) {
                return response.status(400).json({ error: 'Errore nel formato delle immagini esistenti' });
            }
        }
        
        // Crea l'oggetto per l'aggiornamento
        const updateProduct = {};
        if (name) updateProduct.name = name;
        if (description) updateProduct.description = description;   
        if (price) updateProduct.price = price;
        if (category) updateProduct.category = category;
        if (stock !== undefined) updateProduct.stock = stock;

        // Gestione immagini
        updateProduct.imageUrl = existingImages;
        
        // Aggiungi nuove immagini
        if (request.files && request.files.length > 0) {
            const newImageUrls = request.files.map(file => file.path);
            updateProduct.imageUrl = [...existingImages, ...newImageUrls];
        }

        const modifyProduct = await Product.findByIdAndUpdate(
            productId,
            { $set: updateProduct },
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

export async function eliminateProduct(request, response, next) {
    try {
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

export async function updateProductStock(request, response) {
    try {
        const { productId } = request.params;
        const { stock } = request.body;
        
        const updateStock = await Product.findByIdAndUpdate(
            productId,
            {stock: stock },
            { new: true }
        );
        
        if (!updateStock) {
            return response.status(404).json({ error: 'Product not found' });
        }
        
        response.status(200).json(updateStock);
    } catch (error) {
        response.status(500).json({ error: error.message });
    }
}

