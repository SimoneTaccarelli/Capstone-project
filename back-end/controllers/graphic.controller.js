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
    const imageUrls = request.files.map(file => file.path);

    try {
        const newGraphic = new Graphic({
            name: request.body.name,
            tags: request.body.tags ? request.body.tags.split(',').map(tag => tag.trim()) : [],
            imageUrl: imageUrls,
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
    const { name, tags } = request.body;

    const imageUrls = request.files.map(file => file.path);

    const updateData = {
        name,
        tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
        imageUrl: imageUrls,
    };

    try {
        if (!mongoose.Types.ObjectId.isValid(graphicId)) {
            return response.status(400).json({ error: "ID grafica non valido" });
        }

        const updatedGraphic = await Graphic.findByIdAndUpdate(
            graphicId,
            { $set: updateData },
            { new: true }
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

        await Product.deleteMany({ graphic: graphicId });

        response.status(200).json({ message: 'Graphic and associated products deleted successfully' });
    } catch (error) {
        response.status(500).json({ error: error.message });
    }
}

export const getAllGraphics = async (req, res) => {
    try {
        const graphics = await Graphic.find();

        const { page = 1, limit = 8 } = req.query;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const totalGraphics = graphics.length;
        const totalPages = Math.ceil(totalGraphics / limit);
        const paginatedGraphics = graphics.slice(startIndex, endIndex);

        const pagination = {
            totalGraphics,
            totalPages,
            currentPage: parseInt(page),
            graphicsPerPage: parseInt(limit),
        };

        res.set('X-Pagination-Graphic', JSON.stringify({
            graphics: paginatedGraphics,
            pagination: pagination
        }));

        res.status(200).json(paginatedGraphics);
    } catch (error) {
        console.error("Errore durante il recupero delle grafiche:", error);
        res.status(500).json({ error: error.message });
    }
};
