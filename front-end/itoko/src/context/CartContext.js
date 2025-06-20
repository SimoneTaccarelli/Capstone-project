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
                params: { sessionID: sessionId } 
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
        const sessionId = getSessionId();
        setLoading(true);
        
        try {
            // CORREZIONE: Assicuriamoci che product._id sia definito
            if (!product || !product._id) {
                console.error("Prodotto non valido:", product);
                throw new Error("ID prodotto mancante");
            }
            
            // CORREZIONE: Verifica che la chiamata API utilizzi la struttura corretta
            const response = await axios.post(`${API_URL}/cart/addToCart`, {
                sessionID: sessionId, // CORREZIONE: Usa sessionID come si aspetta il backend
                productID: product._id,
                quantity
            });
            
            // CORREZIONE: Aggiungi un log per verificare la risposta
            console.log("Risposta API addToCart:", response.data);
            
            // IMPORTANTE: Ricarica il carrello per aggiornare i dati
            await fetchCart();
            return response.data;
        } catch (error) {
            console.error("Errore dettagliato:", error.response?.data || error.message);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [fetchCart, getSessionId]);

    // Funzione per rimuovere un prodotto dal carrello
    const removeProductFromCart = useCallback(async (productID) => {
        const sessionId = getSessionId();
        setLoading(true);
        
        try {
            await axios.delete(`${API_URL}/cart/removeFromCart`, {
                data: { sessionID: sessionId, productID }
            });
            
            // Ricarica il carrello dopo la rimozione
            await fetchCart();
            return true;
        } catch (error) {
            console.error("Errore nella rimozione del prodotto dal carrello:", error);
            return false;
        } finally {
            setLoading(false);
        }
    }, [fetchCart, getSessionId]);

    // Funzione per aggiornare la quantità di un prodotto
    const updateProductInCart = useCallback(async (productID, quantity) => {
        const sessionId = getSessionId();
        setLoading(true);
        
        try {
            await axios.put(`${API_URL}/cart/updateCart`, {
                sessionID: sessionId,
                items: [{ productID, quantity }]
            });
            
            // Ricarica il carrello dopo l'aggiornamento
            await fetchCart();
            return true;
        } catch (error) {
            console.error("Errore nell'aggiornamento del prodotto nel carrello:", error);
            return false;
        } finally {
            setLoading(false);
        }
    }, [fetchCart, getSessionId]);

    // Funzione per svuotare completamente il carrello
    const clearCart = useCallback(async () => {
        const sessionId = getSessionId();
        setLoading(true);
        
        try {
            await axios.delete(`${API_URL}/cart/clearCart`, {
                data: { sessionID: sessionId }
            });
            
            // Aggiorna lo stato locale per riflettere il carrello vuoto
            setCartItems([]);
            setItemCount(0);
            setCartTotal(0);
            return true;
        } catch (error) {
            console.error("Errore nello svuotamento del carrello:", error);
            return false;
        } finally {
            setLoading(false);
        }
    }, [getSessionId]);

    // Esponi le funzioni e i valori tramite il Provider
    return (
        <CartContext.Provider value={{
            cartItems,
            itemCount, 
            cartTotal,
            loading,
            addProductToCart,
            removeProductFromCart, // Funzione completa
            updateProductInCart, // Funzione completa
            clearCart, // Funzione completa
            getSessionId
        }}>
            {children}
        </CartContext.Provider>
    );
}
