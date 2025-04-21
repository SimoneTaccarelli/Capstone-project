import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { STRIPE_API_KEY } from '../config/stripeConfig';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config/config';
import { Button, Spinner, Modal, Form, Row, Col } from 'react-bootstrap';

const stripePromise = loadStripe(STRIPE_API_KEY);

function Checkout() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { cartItems, itemCount } = useCart();
    const { currentUser } = useAuth();
    const [showModal, setShowModal] = useState(false);
    const [shippingInfo, setShippingInfo] = useState({
        fullName: '',
        address: '',
        city: '',
        postalCode: '',
        country: 'IT'
    });

    const handleInputChange = (e) => {
        setShippingInfo({
            ...shippingInfo,
            [e.target.name]: e.target.value
        });
    };

    const handleOpenCheckout = () => {
        if (itemCount === 0) {
            setError('Il carrello è vuoto');
            return;
        }
        setShowModal(true);
    };

    const handleCheckout = async (e) => {
        e.preventDefault();
        
        try {
            setLoading(true);
            setError(null);
            
            // Ottieni il token di autenticazione
            const token = await currentUser.getIdToken();
            
            // Prepara i dati per il checkout
            const checkoutData = {
                items: cartItems,
                shippingInfo,
                userId: currentUser?.uid || null
            };
            
            // Invia richiesta al backend
            const response = await fetch(`${API_URL}/stripe/create-checkout-session`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(checkoutData)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Errore durante la creazione della sessione');
            }
            
            const { id: sessionId } = await response.json();
            
            // Redirect a Stripe Checkout
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
                onClick={handleOpenCheckout} 
                disabled={itemCount === 0}
                className="w-100 btn-success"
            >
                Procedi al Checkout
            </Button>
            
            {error && <div className="text-danger mt-2">{error}</div>}

            {/* Modal di checkout */}
            <Modal 
                show={showModal} 
                onHide={() => setShowModal(false)}
                centered
                size="lg"
            >
                <Modal.Header closeButton>
                    <Modal.Title>Informazioni di spedizione</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleCheckout}>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Nome completo</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="fullName"
                                        value={shippingInfo.fullName}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Indirizzo</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="address"
                                        value={shippingInfo.address}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Città</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="city"
                                        value={shippingInfo.city}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>CAP</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="postalCode"
                                        value={shippingInfo.postalCode}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Paese</Form.Label>
                                    <Form.Select
                                        name="country"
                                        value={shippingInfo.country}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="IT">Italia</option>
                                        <option value="US">Stati Uniti</option>
                                        <option value="UK">Regno Unito</option>
                                        <option value="FR">Francia</option>
                                        <option value="DE">Germania</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>

                        <div className="d-grid gap-2 mt-4">
                            <Button 
                                type="submit" 
                                variant="primary"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                                        {' '}Elaborazione...
                                    </>
                                ) : (
                                    'Procedi al pagamento'
                                )}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </>
    );
}

export default Checkout;