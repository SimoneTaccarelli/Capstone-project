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
        response.set('X-Pagination', JSON.stringify(paginatedProducts));


        response.status(200).json(products);
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
            console.log("Ricevuto cloudinaryUrls:", cloudinaryUrls);
            try {
                imageUrl = JSON.parse(cloudinaryUrls);
                console.log("URL Cloudinary parsati:", imageUrl);
            } catch (error) {
                console.error("Errore parsing cloudinaryUrls:", error);
            }
        }
        
        const newProduct = new Product({
            name,
            description,
            price,
            category,
            stock,  // Verifica che il campo nel modello sia 'stock' e non 'strock'
            imageUrl // Assegna gli URL delle immagini
        });
        
        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);
    } catch (error) {
        console.error("Errore creazione prodotto:", error);
        res.status(500).json({ error: error.message });
    }
};

export async function updateProduct(request, response, next) {
    try {
        const { productId } = request.params;
        const { name, description, price, category, stock } = request.body;
        
        // Crea l'oggetto per l'aggiornamento
        const updateProduct = {};
        if (name) updateProduct.name = name;
        if (description) updateProduct.description = description;   
        if (price) updateProduct.price = price;
        if (category) updateProduct.category = category;
        if (stock !== undefined) updateProduct.stock = stock; // Corretto da 'strock' a 'stock'

        
        // Gestione di più immagini
        if (request.files && request.files.length > 0) {
            const imageUrls = [];
            for (const file of request.files) {
                imageUrls.push(file.path);
            }
            updateProduct.imageUrl = imageUrls; // Aggiorna con array di URL
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

