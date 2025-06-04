import Product from '../models/Products.js';
import Graphic from '../models/Graphic.js';
import mongoose from 'mongoose';

export const getProductsByGraphic = async (req, res) => {
    try {
        const { graphicId } = req.params;
        const products = await Product.find({ graphic: graphicId });
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getGraphicById = async (req, res) => {
    try {
        const { graphicId } = req.params;
        const graphic = await Graphic.findById(graphicId);
        if (!graphic) return res.status(404).json({ error: 'Graphic not found' });
        res.status(200).json(graphic);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export async function graphicUpload(request, response) {
    const imageUrls = request.files.map(file => file.path); // URL generati da Cloudinary

    try {
        const newGraphic = new Graphic({
            name: request.body.name,
            description: request.body.description,
            tags: request.body.tags ? request.body.tags.split(',').map(tag => tag.trim()) : [],
            imageUrl: imageUrls, // Assicurati che questo campo corrisponda al modello
        });
        const savedGraphic = await newGraphic.save();
        response.status(201).json(savedGraphic);
    } catch (error) {
        console.error("Errore durante la creazione della grafica:", error);
        response.status(500).json({ error: error.message });
    }
}

export async function modifyGraphic(request, response) {
    const { graphicId } = request.params;
    const { name, description, tags } = request.body;

    if (!request.files || request.files.length === 0) {
        return response.status(400).json({ error: "È necessario caricare almeno un'immagine" });
    }

    const imageUrls = request.files.map(file => file.path); // Assuming multiple files are uploaded

    // Crea una costante per raccogliere i campi da aggiornare
    const updateData = {
        name,
        description,
        tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
        imageUrls // Salva un array di URL delle immagini
    };

    try {
        if (!mongoose.Types.ObjectId.isValid(graphicId)) {
            return response.status(400).json({ error: "ID grafica non valido" });
        }

        const updatedGraphic = await Graphic.findByIdAndUpdate(
            graphicId,
            { $set: updateData }, // Usa $set per aggiornare solo i campi specificati
            { new: true } // Restituisci il documento aggiornato
        );
        if (!updatedGraphic) return res.status(404).json({ error: 'Graphic not found' });
        response.status(200).json(updatedGraphic);
    } catch (error) {
        response.status(500).json({ error: error.message });
    }
}

export async function eliminateGraphic(request, response) {
    const { graphicId } = request.params;

    try {
        if (!mongoose.Types.ObjectId.isValid(graphicId)) {
            return response.status(400).json({ error: "ID grafica non valido" });
        }

        const deletedGraphic = await Graphic.findByIdAndDelete(graphicId);
        if (!deletedGraphic) return response.status(404).json({ error: 'Graphic not found' });
        
        // Elimina anche i prodotti associati
        await Product.deleteMany({ graphic: graphicId });

        response.status(200).json({ message: 'Graphic and associated products deleted successfully' });
    } catch (error) {
        response.status(500).json({ error: error.message });
    }
}

export const getAllGraphics = async (req, res) => {
    try {
        const graphics = await Graphic.find(); // Recupera tutte le grafiche dal database
        

        const {page =1 , limit = 8 }= req.query; // Imposta i parametri di paginazione
        const startIndex = (page - 1) * limit; // Calcola l'indice di inizio
        const endIndex = page * limit; // Calcola l'indice di fine
        const totalGraphics = graphics.length; // Ottiene il numero totale di grafiche
        const totalPages = Math.ceil(totalGraphics / limit); // Calcola il numero totale di pagine
        const paginatedGraphics = graphics.slice(startIndex, endIndex); // Applica la paginazione   

        const pagination = {
            totalGraphics,
            totalPages,
            currentPage: parseInt(page),
            graphicsPerPage: parseInt(limit),
        };
        res.set('X-Pagination-Graphic', JSON.stringify({
            graphics: paginatedGraphics,
            pagination: pagination
        })); // Imposta l'header di paginazione

        res.status(200).json(paginatedGraphics); // Restituisce le grafiche paginate
        3.
    } catch (error) {
        console.error("Errore durante il recupero delle grafiche:", error);
        res.status(500).json({ error: error.message }); // Restituisce un errore con status 500
    }
};
