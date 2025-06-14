import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config/config.js';

// Creazione del contesto
const CartContext = createContext();

// Hook personalizzato
export const useCart = () => useContext(CartContext);

export function CartProvider({ children }) {
    const [cartItems, setCartItems] = useState([]);
    const [itemCount, setItemCount] = useState(0);
    const [cartTotal, setCartTotal] = useState(0);
    const [loading, setLoading] = useState(false);

    // Funzione per generare o recuperare sessionId
    const getSessionId = useCallback(() => {
        let sessionId = localStorage.getItem("sessionId");
        if (!sessionId) {
            sessionId = crypto?.randomUUID?.() || 
                'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                    const r = Math.random() * 16 | 0;
                    const v = c === 'x' ? r : (r & 0x3 | 0x8);
                    return v.toString(16);
                });
            localStorage.setItem("sessionId", sessionId);
        }
        return sessionId;
    }, []);

    // Recupera il carrello (stesse implementazioni come prima)
    const fetchCart = useCallback(async () => {
        /* Implementazione */
        const sessionId = getSessionId();
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/cart/getCart`, {
                params: { sessionId }
            });
            
            if (response.data && response.data.items) {
                setCartItems(response.data.items);
                
                const count = response.data.items.reduce((total, item) => 
                    total + (item.quantity || 0), 0);
                setItemCount(count);
                
                const total = response.data.items.reduce((sum, item) => 
                    sum + ((item.product?.price || item.productID?.price || 0) * item.quantity), 0);
                setCartTotal(total);
            } else {
                setCartItems([]);
                setItemCount(0);
                setCartTotal(0);
            }
        } catch (error) {
            console.error("Errore nel recupero del carrello:", error);
        } finally {
            setLoading(false);
        }
    }, [getSessionId]);

    // Effetto per caricare il carrello all'avvio
    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    // Implementazioni di addProductToCart, removeProductFromCart, ecc.
    const addProductToCart = useCallback(async (product, quantity = 1) => {
        /* Implementazione */
        const sessionId = getSessionId();
        setLoading(true);
        
        try {
            const response = await axios.post(`${API_URL}/cart/addToCart`, {
                sessionId,
                productID: product._id,
                quantity
            });
            
            await fetchCart();
            return response.data;
        } catch (error) {
            console.error("Errore nell'aggiunta del prodotto al carrello:", error);
            return null;
        } finally {
            setLoading(false);
        }
    }, [fetchCart, getSessionId]);

    // Esponi le funzioni e i valori tramite il Provider
    return (
        <CartContext.Provider value={{
            cartItems,
            itemCount, 
            cartTotal,
            loading,
            addProductToCart,
            removeProductFromCart: async () => {}, // implementa le altre funzioni
            updateProductInCart: async () => {}, // implementa le altre funzioni
            clearCart: async () => {} // implementa le altre funzioni
        }}>
            {children}
        </CartContext.Provider>
    );
}
