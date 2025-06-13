import { useContext } from "react";
import { useState } from "react";
import axios from "axios";


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
    
    const addProductToCart = (product, quantity) => {
        const sessionId = getSessionId();

        


        
        // Funzione per aggiungere un prodotto al carrello
        console.log("Aggiungi prodotto al carrello:", product);
    };
        

    return (
        <CartTwoContext.Provider value={{}}>
            {children}
        </CartTwoContext.Provider>)
    };




