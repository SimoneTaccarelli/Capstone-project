import { useState } from 'react';
import { Button, Modal, Badge } from 'react-bootstrap';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { API_URL } from '../config/config.js';

function CartTwo() {
    // Stato locale solo per il modale
    const [show, setShow] = useState(false);
    const [processingOrder, setProcessingOrder] = useState(false);
    
    // Usa il context del carrello per dati e funzionalità
    const { 
        cartItems, 
        itemCount, 
        cartTotal, 
        loading,
        removeProductFromCart, 
        updateProductInCart,
        clearCart,
        getSessionId
    } = useCart();
    
    const { currentUser } = useAuth();

    // Funzioni per gestire il modale
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    // Gestione checkout con Instagram
    const handleInstagramCheckout = async () => {
        if (cartItems.length === 0) return;
        
        setProcessingOrder(true);
        try {
            // Chiamata al backend per generare il messaggio
            const response = await axios.post(`${API_URL}/orders/create-instagram-message`, {
                sessionId: getSessionId(),
                userData: currentUser ? {
                    name: currentUser.displayName,
                    email: currentUser.email,
                    uid: currentUser.uid
                } : null
            });
            
            // Utilizza il messaggio generato dal backend
            const message = response.data.message;
            
            // Apre Instagram con il messaggio
            const instagramUrl = `https://www.instagram.com/direct/t/itokonolab?text=${message}`;
            window.open(instagramUrl, '_blank');
            
            handleClose();
        } catch (error) {
            console.error("Errore nella generazione del messaggio:", error);
            alert("Si è verificato un errore. Riprova più tardi.");
        } finally {
            setProcessingOrder(false);
        }
    };

    // Cambio quantità prodotto
    const handleQuantityChange = (productID, newQuantity) => {
        if (newQuantity <= 0) {
            removeProductFromCart(productID);
        } else {
            updateProductInCart(productID, newQuantity);
        }
    };

    return (
        <>
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
                        disabled={cartItems.length === 0 || loading || processingOrder}
                    >
                        {processingOrder ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Elaborazione...
                            </>
                        ) : (
                            <>
                                <i className="bi bi-instagram me-2"></i>
                                Ordina su Instagram
                            </>
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default CartTwo;