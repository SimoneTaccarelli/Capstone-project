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
    try {
        const { graphicId } = request.params;
        const { name, tags } = request.body;
        
        // 1. Recupera la grafica attuale per avere i dati esistenti
        const existingGraphic = await Graphic.findById(graphicId);
        if (!existingGraphic) {
            return response.status(404).json({ error: 'Graphic not found' });
        }
        
        // 2. Prepara i dati da aggiornare
        const updateData = {};
        
        // Aggiorna solo i campi forniti nella richiesta
        if (name !== undefined) {
            updateData.name = name;
        }
        
        // Gestisci i tag solo se forniti
        if (tags !== undefined) {
            try {
                // Caso 1: è una stringa JSON (array serializzato)
                if (typeof tags === 'string' && (tags.startsWith('[') || tags.startsWith('\"['))) {
                    const parsedTags = JSON.parse(tags);
                    updateData.tags = Array.isArray(parsedTags) ? parsedTags : [parsedTags];
                } 
                // Caso 2: è un semplice elenco separato da virgole
                else if (typeof tags === 'string') {
                    updateData.tags = tags.split(',').map(tag => tag.trim());
                } 
                // Caso 3: è già un array
                else if (Array.isArray(tags)) {
                    updateData.tags = tags.map(tag => {
                        // Gestisci il caso in cui un elemento dell'array sia a sua volta una stringa JSON
                        if (typeof tag === 'string' && tag.startsWith('[')) {
                            try {
                                const parsed = JSON.parse(tag);
                                return parsed;
                            } catch {
                                return tag;
                            }
                        }
                        return tag;
                    }).flat();
                }
            } catch (error) {
                // Fallback: usa i tag come semplice stringa
                updateData.tags = typeof tags === 'string' ? [tags] : tags;
            }
        }
        
        // 3. Gestisci le immagini SOLO se sono state caricate nuove immagini
        if (request.files && request.files.length > 0) {
            const newImageUrls = request.files.map(file => file.path);
            
            // Opzione 1: Sostituisci tutte le immagini
            updateData.imageUrl = newImageUrls;
            
            // Opzione 2: Aggiungi le nuove immagini alle esistenti
            // updateData.imageUrl = [...existingGraphic.imageUrl, ...newImageUrls];
        }
        
        // 4. Esegui l'aggiornamento usando $set per modificare solo i campi specificati
        const updatedGraphic = await Graphic.findByIdAndUpdate(
            graphicId,
            { $set: updateData },
            { new: true }
        );
        
        // 5. Aggiorna i prodotti associati se necessario
        if (name !== undefined) {
            await Product.updateMany(
                { graphic: graphicId },
                { $set: { name: updatedGraphic.name } }
            );
        }
        
        response.status(200).json(updatedGraphic);
    } catch (error) {
        console.error('Errore durante la modifica della grafica:', error);
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
        res.status(500).json({ error: error.message });
    }
}

export const getAllGraphics = async (req, res) => {
    try {
        const { search, category, page = 1, limit = 8 } = req.query;

        // Costruisci il filtro
        const filter = {};
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { tags: { $regex: search, $options: 'i' } }
            ];
        }
        if (category) {
            filter.tags = category;
        }

        // Conta il totale dei risultati filtrati
        const totalGraphics = await Graphic.countDocuments(filter);

        // Recupera solo le grafiche filtrate e paginate
        const graphics = await Graphic.find(filter)
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const totalPages = Math.ceil(totalGraphics / limit);

        const pagination = {
            totalGraphics,
            totalPages,
            currentPage: parseInt(page),
            graphicsPerPage: parseInt(limit),
        };

        res.status(200).json({
            graphics,
            pagination
        });

    } catch (error) {
        console.error("Errore durante il recupero delle grafiche:", error);
        res.status(500).json({ error: error.message });
    }
};
