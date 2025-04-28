import { createContext, useContext, useEffect, useState } from "react";
import { useProducts } from "./ProductContext";

const CartContext = createContext();
const STORAGE_KEY = 'cartItems'; // Standardizza la chiave di localStorage

export const CartProvider = ({ children }) => {
    // Inizializza direttamente il carrello dal localStorage
    const [cartItems, setCartItems] = useState(() => {
        try {
            const storedItems = localStorage.getItem(STORAGE_KEY);
            return storedItems ? JSON.parse(storedItems) : [];
        } catch (error) {
            return [];
        }
    });
    
    // Aggiungi al carrello
    const addToCart = (product, quantity = 1) => {
        setCartItems(prevItems => {
            const existingItemIndex = prevItems.findIndex(item => item._id === product._id);
            
            let newItems;
            if (existingItemIndex >= 0) {
                newItems = [...prevItems];
                newItems[existingItemIndex] = {
                    ...newItems[existingItemIndex],
                    quantity: newItems[existingItemIndex].quantity + quantity
                };
            } else {
                newItems = [...prevItems, { ...product, quantity }];
            }
            
            // Salva immediatamente nel localStorage
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
            return newItems;
        });
    };

    // Rimuovi dal carrello
    const removeFromCart = (productId) => {
        setCartItems(prevItems => {
            const newItems = prevItems.filter(item => item._id !== productId);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
            return newItems;
        });
    };

    // Svuota il carrello
    const clearCart = () => {
        setCartItems([]);
        localStorage.removeItem(STORAGE_KEY);
    };

    // Calcola il numero degli articoli e il totale all'interno del provider
    const itemCount = cartItems.reduce((count, item) => 
        count + (Number(item?.quantity) || 0), 0);

    const cartTotal = cartItems.reduce((total, item) => {
        const price = Number(item?.price) || 0;
        const quantity = Number(item?.quantity) || 0;
        return total + (price * quantity);
    }, 0);
    
    return (
        <CartContext.Provider value={{ 
            cartItems,
            addToCart, 
            removeFromCart,
            clearCart,
            itemCount,
            cartTotal
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
