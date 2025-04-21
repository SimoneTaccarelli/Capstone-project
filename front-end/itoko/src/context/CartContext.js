import { createContext, useContext, useEffect } from "react";
import { useState } from "react";
import { useProducts } from "./ProductContext";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    // Inizializza con array vuoto
    const [cartItems, setCartItems] = useState([]);
    const { products = [] } = useProducts(); // Valore predefinito
    
    // Aggiungi al carrello
    const addToCart = (product) => {
        // Verifica se product è un oggetto o un ID
        const isProductId = typeof product === 'string';
        const productId = isProductId ? product : product?._id;
        
        // Se è un ID, trova il prodotto completo
        let productToAdd = isProductId 
            ? (products || []).find(p => p._id === productId)
            : product;
        
        if (!productToAdd) {
            console.error('Prodotto non trovato:', product);
            return;
        }
        
        setCartItems((prevItems = []) => {
            // Assicura che prevItems sia sempre un array
            const items = Array.isArray(prevItems) ? prevItems : [];
            
            const existingItem = items.find((item) => item._id === productToAdd._id);
            if (existingItem) {
                return items.map((item) =>
                    item._id === productToAdd._id
                        ? { ...item, quantity: (item.quantity || 0) + 1 }
                        : item
                );
            } else {
                return [...items, { ...productToAdd, quantity: 1 }];
            }
        });
    };

    // Rimuovi dal carrello
    const removeFromCart = (productId) => {
        setCartItems((prevItems = []) => {
            // Assicura che prevItems sia sempre un array
            const items = Array.isArray(prevItems) ? prevItems : [];
            return items.filter((item) => item._id !== productId);
        });
    };

    // Svuota il carrello
    const clearCart = () => {
        setCartItems([]);
        localStorage.removeItem('cartItems');
    };

    // Ripristina dal localStorage all'avvio
    useEffect(() => {
        try {
            const storedCartItems = localStorage.getItem("cartItems");
            if (storedCartItems) {
                const parsed = JSON.parse(storedCartItems);
                setCartItems(Array.isArray(parsed) ? parsed : []);
            }
        } catch (error) {
            console.error('Errore nel ripristino del carrello:', error);
            setCartItems([]);
        }
    }, []);

    // Aggiorna localStorage quando il carrello cambia
    useEffect(() => {
        if (Array.isArray(cartItems)) {
            localStorage.setItem("cartItems", JSON.stringify(cartItems));
        }
    }, [cartItems]);

    // Calcola il numero degli articoli
    const itemCount = Array.isArray(cartItems) 
        ? cartItems.reduce((count, item) => count + (Number(item?.quantity) || 0), 0)
        : 0;

    // Calcola il totale del carrello
    const cartTotal = Array.isArray(cartItems)
        ? cartItems.reduce((total, item) => {
            const price = Number(item?.price) || 0;
            const quantity = Number(item?.quantity) || 0;
            return total + (price * quantity);
        }, 0)
        : 0;
    
    // IMPORTANTE: Mantieni la stessa interfaccia di prima
    return (
        <CartContext.Provider value={{ 
            cartItems, // Restituisci direttamente cartItems
            addToCart, 
            removeFromCart,
            clearCart,
            itemCount,  // Esponi il conteggio degli elementi
            cartTotal   // Esponi il totale
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
