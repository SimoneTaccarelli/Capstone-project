import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { useProducts } from '../context/ProductContext';
import { ModalBody } from 'react-bootstrap';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import InfoCheckout from './InfoCheckout';
// Aggiungi questi import
import { loadStripe } from '@stripe/stripe-js';
import { API_URL } from '../config/config';
import { STRIPE_API_KEY } from '../config/stripeConfig';

// Inizializza stripePromise
const stripePromise = loadStripe(STRIPE_API_KEY);

function Cart() {
    const { products } = useProducts();
    const { cartItems, itemCount, cartTotal, removeFromCart } = useCart();
    const [show, setShow] = useState(false);
    const [showCheckoutModal, setShowCheckoutModal] = useState(false);
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [shippingInfo, setShippingInfo] = useState({
        fullName: '',
        address: '',
        city: '',
        postalCode: '',
        country: 'IT'
    });

    const handleClose = () => { setShow(false); }
    const handleShow = () => { setShow(true); }

    const handleInputChange = (e) => {
        setShippingInfo({
            ...shippingInfo,
            [e.target.name]: e.target.value
        });
    };

    const handleOpenCheckout = () => {
        if (cartItems.length === 0) return;
        handleClose(); // Chiudi il carrello
        setShowCheckoutModal(true); // Apri il checkout
    };

    const handleCheckout = async (e) => {
        e.preventDefault();
        
        try {
            setLoading(true);
            setError(null);
            
            let token = '';
            if (currentUser) {
                token = await currentUser.getIdToken();
            }
            
            const checkoutData = {
                items: cartItems,
                shippingInfo,
                userId: currentUser?.uid || null
            };
            
            const response = await fetch(`${API_URL}/stripe/create-checkout-session`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                },
                body: JSON.stringify(checkoutData)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Errore durante la creazione della sessione');
            }
            
            const { id: sessionId } = await response.json();
            
            const stripe = await stripePromise;
            const { error } = await stripe.redirectToCheckout({ sessionId });
            
            if (error) {
                throw new Error(error.message);
            }
        } catch (err) {
            setError(err.message || 'Si è verificato un errore');
            console.error('Checkout error:', err);
        } finally {
            setLoading(false);
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
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {itemCount}
                    <span className="visually-hidden">unread messages</span>
                </span>
            </Button>

            {/* Modal del carrello */}
            <Modal
                backdrop="static"
                onHide={handleClose}
                show={show}
                keyboard={false}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Carrello</Modal.Title>
                </Modal.Header>
                
                <ModalBody>
                    {cartItems.length === 0 ? (
                        <div className="alert alert-info">Il carrello è vuoto</div>
                    ) : (
                        <div>
                            {cartItems.map((item) => (
                                <div key={item._id} className="d-flex justify-content-between align-items-center mb-2">
                                    <div>{item.name} - {item.quantity} x €{item.price}</div>
                                    <Button variant="danger" size="sm" onClick={() => removeFromCart(item._id)}>Rimuovi</Button>
                                </div>
                            ))}
                            <hr />
                            <div className="d-flex justify-content-between">
                                <strong>Totale:</strong>
                                <span>€{cartTotal.toFixed(2)}</span>
                            </div>
                        </div>
                    )}
                </ModalBody>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Continua acquisti
                    </Button>
                    <Button 
                        variant="primary" 
                        onClick={handleOpenCheckout}
                        disabled={cartItems.length === 0}
                    >
                        Procedi al pagamento
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Componente InfoCheckout separato */}
            <InfoCheckout 
                show={showCheckoutModal} 
                onHide={() => setShowCheckoutModal(false)}
                cartItems={cartItems}
            />
        </>
    );
}

export default Cart;