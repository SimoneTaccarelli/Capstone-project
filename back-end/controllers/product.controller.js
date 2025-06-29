import Product from '../models/Products.js';

export async function getAllProducts(request, response, next) {
  try {
    // Estrai parametri di ricerca e paginazione dalla query
    const { search, category, type, } = request.query;

    // Costruisci il filtro dinamico
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

    // Conta il totale dei prodotti filtrati
    const producs = await Product.find(filter)

    // Recupera solo i prodotti filtrati e paginati
    

    response.status(200).json(producs );
  } catch (error) {
    console.error("Errore durante il recupero dei prodotti:", error);
    response.status(500).json({ error: error.message });
  }
}

export async function getProductById(request, response, next) {
  try {
    const { productId } = request.params;
    const product = await Product.findById(productId).populate('graphic', 'name');
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
    const { name, description, price, category, type, color, size, graphic, cloudinaryUrls } = req.body;

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
      type,
      color: Array.isArray(color) ? color : [color], // Assicurati che sia un array
      size: Array.isArray(size) ? size : [size], // Assicurati che sia un array
      graphic,
      imageUrl,
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
    const { name, description, price, category, type, graphic } = request.body;
    let { color, size } = request.body;
    let existingImages = [];

    // Parse JSON string to array for existingImages
    if (request.body.existingImages) {
      try {
        existingImages = JSON.parse(request.body.existingImages);
      } catch (e) {
        return response.status(400).json({ error: 'Errore nel formato delle immagini esistenti' });
      }
    }

    // Parse color if it's a string
    if (color) {
      try {
        // Se è una stringa, prova a parsarla come JSON
        if (typeof color === 'string') {
          color = JSON.parse(color);
        }
        // Assicurati che sia un array
        if (!Array.isArray(color)) {
          color = [color];
        }
        // Se gli elementi dell'array sono ancora stringhe JSON, parsali
        color = color.map(item => {
          if (typeof item === 'string' && (item.startsWith('[') || item.startsWith('"'))) {
            try {
              return JSON.parse(item);
            } catch (e) {
              return item;
            }
          }
          return item;
        });
        // Appiattisci l'array nel caso ci siano array nested
        color = color.flat();
      } catch (e) {
        // Se il parsing fallisce, usa la stringa come un singolo valore
        color = [color];
      }
    }

    // Parse size if it's a string
    if (size) {
      try {
        // Se è una stringa, prova a parsarla come JSON
        if (typeof size === 'string') {
          size = JSON.parse(size);
        }
        // Assicurati che sia un array
        if (!Array.isArray(size)) {
          size = [size];
        }
        // Se gli elementi dell'array sono ancora stringhe JSON, parsali
        size = size.map(item => {
          if (typeof item === 'string' && (item.startsWith('[') || item.startsWith('"'))) {
            try {
              return JSON.parse(item);
            } catch (e) {
              return item;
            }
          }
          return item;
        });
        // Appiattisci l'array nel caso ci siano array nested
        size = size.flat();
      } catch (e) {
        // Se il parsing fallisce, usa la stringa come un singolo valore
        size = [size];
      }
    }

    // Crea l'oggetto per l'aggiornamento
    const updateProduct = {};
    if (name) updateProduct.name = name;
    if (description) updateProduct.description = description;   
    if (price) updateProduct.price = price;
    if (category) updateProduct.category = category;
    if (type) updateProduct.type = type;
    if (color) updateProduct.color = color;
    if (size) updateProduct.size = size;
    if (graphic) updateProduct.graphic = graphic;

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
    console.error("Errore nell'aggiornamento del prodotto:", error);
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

