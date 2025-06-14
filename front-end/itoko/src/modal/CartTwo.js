import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { Button, Modal, Badge } from 'react-bootstrap';
import axios from 'axios';
import { API_URL } from '../config/config.js';
import { useAuth } from '../context/AuthContext';

// Esporta il contesto direttamente
export const CartContext = createContext();

// Esporta l'hook separatamente
export const useCart = () => useContext(CartContext);

function CartTwo() {
    // Stati
    const [show, setShow] = useState(false);
    const [cartItems, setCartItems] = useState([]);
    const [itemCount, setItemCount] = useState(0);
    const [cartTotal, setCartTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const { currentUser } = useAuth();

    // Funzioni per gestire il modale
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

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

    // Funzione per recuperare il carrello
    const fetchCart = useCallback(async () => {
        const sessionId = getSessionId();
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/cart/getCart`, {
                params: { sessionId }
            });
            
            // Aggiorna i dati del carrello
            if (response.data && response.data.items) {
                setCartItems(response.data.items);
                
                // Calcola il numero totale di articoli
                const count = response.data.items.reduce((total, item) => 
                    total + (item.quantity || 0), 0);
                setItemCount(count);
                
                // Calcola il totale del carrello
                const total = response.data.items.reduce((sum, item) => 
                    sum + ((item.product?.price || item.productID?.price || 0) * item.quantity), 0);
                setCartTotal(total);
            } else {
                setCartItems([]);
                setItemCount(0);
                setCartTotal(0);
            }
            return response.data;
        } catch (error) {
            console.error("Errore nel recupero del carrello:", error);
            setError("Impossibile caricare il carrello");
            return null;
        } finally {
            setLoading(false);
        }
    }, [getSessionId]);

    // Recupera il carrello all'avvio
    useEffect(() => {
        fetchCart();
    }, [fetchCart]);
    
    // Aggiungi prodotto al carrello - funzione esposta
    const addProductToCart = useCallback(async (product, quantity = 1) => {
        const sessionId = getSessionId();
        setLoading(true);
        
        try {
            const response = await axios.post(`${API_URL}/cart/addToCart`, {
                sessionId,
                productID: product._id,
                quantity
            });
            
            await fetchCart(); // Ricarica il carrello aggiornato
            return response.data;
        } catch (error) {
            console.error("Errore nell'aggiunta del prodotto al carrello:", error);
            setError("Impossibile aggiungere il prodotto al carrello");
            return null;
        } finally {
            setLoading(false);
        }
    }, [fetchCart, getSessionId]);

    // Rimuovi prodotto dal carrello - funzione esposta
    const removeProductFromCart = useCallback(async (productID) => {
        const sessionId = getSessionId();
        setLoading(true);
        
        try {
            const response = await axios.delete(`${API_URL}/cart/removeFromCart`, {
                data: { sessionId, productID }
            });
            
            await fetchCart(); // Ricarica il carrello aggiornato
            return response.data;
        } catch (error) {
            console.error("Errore nella rimozione del prodotto dal carrello:", error);
            setError("Impossibile rimuovere il prodotto dal carrello");
            return null;
        } finally {
            setLoading(false);
        }
    }, [fetchCart, getSessionId]);

    // Aggiorna quantità di un prodotto nel carrello - funzione esposta
    const updateProductInCart = useCallback(async (productID, quantity) => {
        const sessionId = getSessionId();
        setLoading(true);
        
        try {
            const response = await axios.put(`${API_URL}/cart/updateCart`, {
                sessionId,
                productID,
                quantity
            });
            
            await fetchCart(); // Ricarica il carrello aggiornato
            return response.data;
        } catch (error) {
            console.error("Errore nell'aggiornamento del prodotto nel carrello:", error);
            setError("Impossibile aggiornare il prodotto nel carrello");
            return null;
        } finally {
            setLoading(false);
        }
    }, [fetchCart, getSessionId]);

    // Svuota il carrello - funzione esposta
    const clearCart = useCallback(async () => {
        const sessionId = getSessionId();
        setLoading(true);
        
        try {
            const response = await axios.delete(`${API_URL}/cart/clearCart`, {
                data: { sessionId }
            });
            
            setCartItems([]);
            setItemCount(0);
            setCartTotal(0);
            return response.data;
        } catch (error) {
            console.error("Errore nello svuotamento del carrello:", error);
            setError("Impossibile svuotare il carrello");
            return null;
        } finally {
            setLoading(false);
        }
    }, [getSessionId]);

    // Funzione per generare il messaggio Instagram
    const createInstagramMessage = () => {
        // Intestazione del messaggio
        let message = "Ciao! Vorrei ordinare questi prodotti:\n\n";
        
        // Aggiungi ogni prodotto al messaggio
        cartItems.forEach((item, index) => {
            const product = item.product || item.productID || {};
            message += `${index + 1}. ${product.name} - ${product.type || ''}\n`;
            message += `   Quantità: ${item.quantity}\n`;
            message += `   Prezzo: €${(product.price * item.quantity).toFixed(2)}\n\n`;
        });
        
        // Aggiungi il totale
        message += `Totale ordine: €${cartTotal.toFixed(2)}\n\n`;
        
        // Aggiungi info utente se disponibili
        if (currentUser) {
            message += `Nome: ${currentUser.displayName || ''}\n`;
            message += `Email: ${currentUser.email || ''}\n\n`;
        }
        
        message += "Vorrei completare l'ordine. Grazie!";
        
        return encodeURIComponent(message);
    };

    // Reindirizza alla chat Instagram con messaggio precompilato
    const handleInstagramCheckout = () => {
        const message = createInstagramMessage();
        // Sostituisci 'itokonolab' con il tuo handle Instagram
        const instagramUrl = `https://www.instagram.com/direct/t/itokonolab?text=${message}`;
        
        // Apre in una nuova scheda
        window.open(instagramUrl, '_blank');
        handleClose();
    };

    // Cambio quantità prodotto
    const handleQuantityChange = (productID, newQuantity) => {
        if (newQuantity <= 0) {
            removeProductFromCart(productID);
        } else {
            updateProductInCart(productID, newQuantity);
        }
    };

    // Valore del contesto del carrello
    const cartContextValue = {
        addProductToCart,
        removeProductFromCart,
        updateProductInCart,
        clearCart,
        cartItems,
        itemCount,
        cartTotal,
        loading,
        showCart: handleShow
    };

    return (
        <CartContext.Provider value={cartContextValue}>
            <Button 
                variant="outline-primary"
                className="position-relative ms-2"
                onClick={handleShow}
            >
                <i className="bi bi-cart"></i>
                
                {itemCount > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                        {itemCount}
                    </span>
                )}
            </Button>

            {/* Modal del carrello */}
            <Modal
                backdrop="static"
                onHide={handleClose}
                show={show}
                keyboard={false}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Il tuo carrello</Modal.Title>
                </Modal.Header>
                
                <Modal.Body>
                    {loading ? (
                        <div className="text-center p-4">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Caricamento...</span>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="alert alert-danger">{error}</div>
                    ) : cartItems.length === 0 ? (
                        <div className="alert alert-info">Il carrello è vuoto</div>
                    ) : (
                        <div>
                            {cartItems.map((item) => {
                                const product = item.product || item.productID || {};
                                return (
                                    <div key={item._id || product._id} className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
                                        <div className="d-flex align-items-center">
                                            {product.imageUrl && product.imageUrl[0] && (
                                                <img 
                                                    src={product.imageUrl[0]} 
                                                    alt={product.name}
                                                    className="me-2"
                                                    style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                                />
                                            )}
                                            <div>
                                                <div className="fw-bold">{product.name}</div>
                                                <div className="small text-muted">€{product.price?.toFixed(2)}</div>
                                            </div>
                                        </div>
                                        
                                        <div className="d-flex align-items-center">
                                            <div className="input-group input-group-sm me-2" style={{ width: '100px' }}>
                                                <Button 
                                                    variant="outline-secondary" 
                                                    onClick={() => handleQuantityChange(product._id, item.quantity - 1)}
                                                >
                                                    −
                                                </Button>
                                                <input 
                                                    type="text" 
                                                    className="form-control text-center" 
                                                    value={item.quantity}
                                                    readOnly 
                                                />
                                                <Button 
                                                    variant="outline-secondary" 
                                                    onClick={() => handleQuantityChange(product._id, item.quantity + 1)}
                                                >
                                                    +
                                                </Button>
                                            </div>
                                            
                                            <Button 
                                                variant="outline-danger" 
                                                size="sm"
                                                onClick={() => removeProductFromCart(product._id)}
                                            >
                                                <i className="bi bi-trash"></i>
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                            
                            <div className="d-flex justify-content-between align-items-center mt-3">
                                <Button 
                                    variant="outline-secondary" 
                                    size="sm"
                                    onClick={clearCart}
                                >
                                    Svuota carrello
                                </Button>
                                <div className="fs-5">
                                    Totale: <span className="fw-bold">€{cartTotal.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </Modal.Body>
                
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Continua acquisti
                    </Button>
                    <Button 
                        variant="primary" 
                        onClick={handleInstagramCheckout}
                        disabled={cartItems.length === 0 || loading}
                    >
                        <i className="bi bi-instagram me-2"></i>
                        Ordina su Instagram
                    </Button>
                </Modal.Footer>
            </Modal>
        </CartContext.Provider>
    );
}

export default CartTwo;