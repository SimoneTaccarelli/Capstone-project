import e from 'express';
import cart from '../models/Cart.js';
import product from '../models/Products.js';

// Aggiungi un prodotto al carrello
export async function addToCart(request, resposnse) {
    const { sessionID, productID, quantity } = request.body;
    if (!sessionID || !productID || !quantity) {
        return resposnse.status(400).json({ error: 'Dati mancanti' });
    }

    try {
        let useCart = await cart.findOne({ sessionID: sessionID });
        if (!useCart) {
            useCart = new cart({ sessionID: sessionID, items: [] });
        }
        const existingItem = useCart.items.find(item => item.productID.toString() === productID);
        if (existingItem) {
            existingItem.quantity += quantity;
            const productDetails = await product.findById(productID);
            existingItem.totalPrice = existingItem.quantity * productDetails.price;
        } else {
            const productDetails = await product.findById(productID);
            useCart.items.push({
                productID: productID,
                quantity: quantity,
                totalPrice: quantity * productDetails.price
            });
        }
        await useCart.save();
        return resposnse.status(200).json({ message: 'Prodotto aggiunto al carrello', cart: useCart });


    }
    catch (error) {
        console.error(error);
        return resposnse.status(500).json({ error: 'Errore durante l\'aggiunta al carrello' });
    }
}

export async function getCart(request, response) {
    const { sessionID } = request.query;
    if (!sessionID) {
        return response.status(400).json({ error: 'Session ID mancante' });
    }

    try {
        const useCart = await cart.findOne({ sessionID: sessionID }).populate('items.productID');
        if (!useCart) {
            return response.status(404).json({ error: 'Carrello non trovato' });
        }
        return response.status(200).json(useCart);
    } catch (error) {
        console.error(error);
        return response.status(500).json({ error: 'Errore durante il recupero del carrello' });
    }

}

export async function removeFromCart(request, response) {
    const { sessionID, productID } = request.body;
    if (!sessionID || !productID) {
        return response.status(400).json({ error: 'Dati mancanti' });
    }

    try {
        const useCart = await cart.findOne({ sessionID: sessionID });
        if (!useCart) {
            return response.status(404).json({ error: 'Carrello non trovato' });
        }

        useCart.items = useCart.items.filter(item => item.productID.toString() !== productID);
        await useCart.save();
        return response.status(200).json({ message: 'Prodotto rimosso dal carrello', cart: useCart });
    } catch (error) {
        console.error(error);
        return response.status(500).json({ error: 'Errore durante la rimozione dal carrello' });
    }
}

export async function clearCart(request, response) {
    const { sessionID } = request.body;
    if (!sessionID) {
        return response.status(400).json({ error: 'Session ID mancante' });
    }

    try {
        const useCart = await cart.findOneAndDelete({ sessionID: sessionID });
        if (!useCart) {
            return response.status(404).json({ error: 'Carrello non trovato' });
        }
        return response.status(200).json({ message: 'Carrello svuotato con successo' });
    } catch (error) {
        console.error(error);
        return response.status(500).json({ error: 'Errore durante lo svuotamento del carrello' });
    }
}

export async function updateCart(request, response) {
    const { sessionID, items } = request.body;
    if (!sessionID || !Array.isArray(items)) {
        return response.status(400).json({ error: 'Dati mancanti' });
    }

    try {
        let useCart = await cart.findOne({ sessionID: sessionID });
        if (!useCart) {
            useCart = new cart({ sessionID: sessionID, items: [] });
        }

        for (const item of items) {
            const existingItem = useCart.items.find(i => i.productID.toString() === item.productID);
            if (existingItem) {
                existingItem.quantity = item.quantity;
                const productDetails = await product.findById(item.productID);
                existingItem.totalPrice = existingItem.quantity * productDetails.price;
            } else {
                const productDetails = await product.findById(item.productID);
                useCart.items.push({
                    productID: item.productID,
                    quantity: item.quantity,
                    totalPrice: item.quantity * productDetails.price
                });
            }
        }

        await useCart.save();
        return response.status(200).json({ message: 'Carrello aggiornato con successo', cart: useCart });
    } catch (error) {
        console.error(error);
        return response.status(500).json({ error: 'Errore durante l\'aggiornamento del carrello' });
    }
}

export async function createInstagramMessage(request, response) {
    try {
    const { sessionID } = request.body;

    const cart = await cart.findOne({ sessionID: sessionID }).populate('items.productID');
    if (!cart) {
        return response.status(404).json({ error: 'Carrello non trovato' });
    }

    let message = "Ciao! Ecco i prodotti che ho scelto:\n\n";
    cart.items.forEach((item, index) => {
        const product = item.productID;
        message += `${index + 1}. ${product.name} - ${product.type || ''}\n`;
        message += `   Quantità: ${item.quantity}\n`;
        message += `   Prezzo: €${(product.price * item.quantity).toFixed(2)}\n\n`;
    });

    const total = cart.items.reduce((sum, item) => sum + (item.productID.price * item.quantity), 0);
    message += `Totale: €${total.toFixed(2)}\n\n`;

    message += "Vorrei completare l'acquisto. Grazie!";

    const encodedMessage = encodeURIComponent(message);
   
    res.status(200).json({message: encodedMessage});
} catch (error) {
    console.error('Errore nella creazione del messaggio Instagram:', error);
    response.status(500).json({ error: 'Errore durante la creazione del messaggio Instagram' });
  }
}