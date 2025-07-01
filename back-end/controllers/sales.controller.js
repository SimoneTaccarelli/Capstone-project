import product from '../models/product.js';

export async function getAllSales(request , response){
    try {
        const {search , category , type} = request.query;

        const filter = {};
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { type: { $regex: search, $options: 'i' } },
                { tags: { $regex: search, $options: 'i' } }
            ];
        }

        if (category) {
            filter.category = category;
        }
        if (type) {
            filter.type = type;
        }

        const products = await product.find(filter)
        
        response.status(200).json({
            products: products
        });
    } catch (error) {
        console.error("Error fetching sales data:", error);
        response.status(500).json({ message: "Internal server error" });
    }
}

export async function getSaleById(request, response) {
    try {
        const { saleId } = request.params;
        const sale = await product.findById(saleId).populate('graphic', 'name');
        if (!sale) {
            return response.status(404).json({ error: 'Sale not found' });
        }
        response.status(200).json(sale);
    } catch (error) {
        response.status(500).json({ error: error.message });
    }
}

export async function createSale(req, res) {
    try {
        const { name, description, price, category, type, color, size, graphic, discount } = req.body;

        if (discount !== Number){
            return res.status(400).json({ error: "Sales price must be a number" });
        }

        const salesPrice = price - (price * (discount / 100));

        // Verifica se il prezzo scontato è valido
        if (salesPrice && (typeof salesPrice !== 'number' || salesPrice < 0)) {
            return res.status(400).json({ error: "Invalid sale price" });
        }

        
        const newSale = new product({
            name,
            description,
            price,
            category,
            type,
            color,
            size,
            graphic,
            imageUrl,
            discount,
            salePrice: salesPrice || salePrice, // Usa il prezzo scontato se fornito, altrimenti calcola
        });

        const savedSale = await newSale.save();
        res.status(201).json(savedSale);
    } catch (error) {
        console.error("Error creating sale:", error);
        res.status(500).json({ error: error.message });
    }
}

export async function updateSale(req, res) {
    try {
        const { saleId } = req.params;
        const { name, description, price, category, type, color, size, graphic, discount } = req.body;

        const salesPrice = price - (price * (discount / 100));

        if (salesPrice && (typeof salesPrice !== 'number' || salesPrice < 0)) {
            return res.status(400).json({ error: "Invalid sale price" });
        }

        const updatedSale = await product.findByIdAndUpdate(
            saleId,
            {
                name,
                description,
                price,
                category,
                type,
                color,
                size,
                graphic,
                discount,
                salePrice: salesPrice || salesPrice, // Usa il prezzo scontato se fornito, altrimenti calcola
            },
            { new: true }
        );

        if (!updatedSale) {
            return res.status(404).json({ error: 'Sale not found' });
        }

        res.status(200).json(updatedSale);
    } catch (error) {
        console.error("Error updating sale:", error);
        res.status(500).json({ error: error.message });
    }
}

export async function deleteSale(req, res) {
    try {
        const { saleId } = req.params;
        const deletedSale = await product.findByIdAndDelete(saleId);

        if (!deletedSale) {
            return res.status(404).json({ error: 'Sale not found' });
        }

        res.status(200).json({ message: 'Sale deleted successfully' });
    } catch (error) {
        console.error("Error deleting sale:", error);
        res.status(500).json({ error: error.message });
    }
}

