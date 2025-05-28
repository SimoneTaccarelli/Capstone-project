import Product from '../models/Products.js';
import Graphic from '../models/Graphic.js';

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
    const { name, description, tags } = request.body;
    const imageUrls = request.files.map(file => file.path); // Assuming multiple files are uploaded

    try {
        const newGraphic = new Graphic({
            name,
            description,
            tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
            imageUrls // Salva un array di URL delle immagini
        });
        const savedGraphic = await newGraphic.save();
        response.status(201).json(savedGraphic);
    } catch (error) {
        response.status(500).json({ error: error.message });
    }
}

export async function modifyGraphic(request, response) {
    const { graphicId } = request.params;
    const { name, description, tags } = request.body;
    const imageUrls = request.files.map(file => file.path); // Assuming multiple files are uploaded

    // Crea una costante per raccogliere i campi da aggiornare
    const updateData = {
        name,
        description,
        tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
        imageUrls // Salva un array di URL delle immagini
    };

    try {
        const updatedGraphic = await Graphic.findByIdAndUpdate(
            graphicId,
            { $set: updateData }, // Usa $set per aggiornare solo i campi specificati
            { new: true } // Restituisci il documento aggiornato
        );
        if (!updatedGraphic) return response.status(404).json({ error: 'Graphic not found' });
        response.status(200).json(updatedGraphic);
    } catch (error) {
        response.status(500).json({ error: error.message });
    }
}

export async function eliminateGraphic(request, response) {
    const { graphicId } = request.params;

    try {
        const deletedGraphic = await Graphic.findByIdAndDelete(graphicId);
        if (!deletedGraphic) return response.status(404).json({ error: 'Graphic not found' });
        
        // Elimina anche i prodotti associati
        await Product.deleteMany({ graphic: graphicId });

        response.status(200).json({ message: 'Graphic and associated products deleted successfully' });
    } catch (error) {
        response.status(500).json({ error: error.message });
    }
}
