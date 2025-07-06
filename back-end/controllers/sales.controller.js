import product from '../models/Products.js';

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

        const types = ['T-shirt', 'Hoodie']

        if (!types.includes(type)) {
            return res.status(400).json({ error: "Invalid type. Must be 't-shirt' or 'hoodie'" });
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
        const { discount } = req.body;

        // Recupera il prodotto
        const prod = await product.findById(saleId);
        if (!prod) return res.status(404).json({ error: "Product not found" });

        // Aggiorna solo il campo sconto e calcola il nuovo prezzo scontato
        prod.discount = discount;
        prod.salePrice = prod.price * (1 - discount / 100);

        await prod.save();

        res.status(200).json(prod);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

export async function deleteSale(req, res) {
    try {
        const { saleId } = req.params;
        // Aggiorna solo i campi di saldo
        const updatedSale = await product.findByIdAndUpdate(
            saleId,
            { discount: 0, salePrice: null },
            { new: true }
        );

        if (!updatedSale) {
            return res.status(404).json({ error: 'Sale not found' });
        }

        res.status(200).json({ message: 'Saldo eliminato con successo', product: updatedSale });
    } catch (error) {
        console.error("Error deleting sale:", error);
        res.status(500).json({ error: error.message });
    }
}

