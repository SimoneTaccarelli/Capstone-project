import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { use } from "react";
import {API_URL} from "../config";



const CartTwoContext = React.createContext();
export const CartTwoContextProvider = ({ children }) => {
    const[ addProduct , setAddProduct ] = useState(null);
    const[removeProduct , setRemoveProduct ] = useState(null);
    const[updateProduct , setUpdateProduct ] = useState(null);
    const[clearCart , setClearCart ] = useState(false);

    function getSessionId(){
        let sessionId = localStorage.getItem("sessionId");
        if (!sessionId) {
            sessionId = crypto.randomUUID();
            localStorage.setItem("sessionId", sessionId);
        }
        return sessionId;
    }

    useEffect(() => {
        // Funzione per ottenere il carrello
        const fetchCart = async () => {
            const sessionId = getSessionId();
            try {
                const response = await axios.get(`${API_URL}/cart/getCart`, {
                    params: { sessionId }
                });
                console.log("Carrello ottenuto:", response.data);
            } catch (error) {
                console.error("Errore nel recupero del carrello:", error);
            }
        };

        fetchCart();
    }, [addProduct, removeProduct, updateProduct, clearCart]);
    
    const addProductToCart = (addProduct, quantity) => {
        const sessionId = getSessionId();

        const response = axios.post(`${API_URL}/cart/addToCart`, {
            sessionId,
            product: addProduct,
            quantity
        });
        response.then((res) => {
            console.log("Prodotto aggiunto al carrello:", res.data);
            setAddProduct(res.data);
        }).catch((error) => {
            console.error("Errore nell'aggiunta del prodotto al carrello:", error);
        });
        // Funzione per aggiungere un prodotto al carrello
        console.log("Aggiungi prodotto al carrello:", product);
    };

    const removeProductFromCart = (removeProduct) => {
        const sessionId = getSessionId();
        axios.delete(`${API_URL}/cart/removeFromCart`, {
            data: { sessionId, product: removeProduct }
        }).then((res) => {
            console.log("Prodotto rimosso dal carrello:", res.data);
            setRemoveProduct(res.data);
        }).catch((error) => {
            console.error("Errore nella rimozione del prodotto dal carrello:", error);
        });
    };

    const updateProductInCart = (updateProduct, quantity) => {
        const sessionId = getSessionId();
        axios.put(`${API_URL}/cart/updateCart`, {
            sessionId,
            product: updateProduct,
            quantity
        }).then((res) => {
            console.log("Prodotto aggiornato nel carrello:", res.data);
            setUpdateProduct(res.data);
        }).catch((error) => {
            console.error("Errore nell'aggiornamento del prodotto nel carrello:", error);
        });
    };

    const removeCart = () => {
        const sessionId = getSessionId();
        axios.delete(`${API_URL}/cart/clearCart`, {
            data: { sessionId }
        }).then((res) => {
            console.log("Carrello svuotato:", res.data);
            setClearCart(true);
        }).catch((error) => {
            console.error("Errore nello svuotamento del carrello:", error);
        });
    };
    const contextValue = {
        addProductToCart,
        removeProductFromCart,
        updateProductInCart,
        removeCart,
        addProduct,
        removeProduct,
        updateProduct,
        clearCart
    };

    return (
        <CartTwoContext.Provider value={{}}>
            {children}
        </CartTwoContext.Provider>)
    };

    export const useCartTwo = () => useContext(CartTwoContext);




