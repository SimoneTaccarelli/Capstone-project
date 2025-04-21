import { useState } from 'react';
import { Modal, Button, Form, Row, Col, Spinner } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { loadStripe } from '@stripe/stripe-js';
import { STRIPE_API_KEY } from '../config/stripeConfig';
import { API_URL } from '../config/config';

const stripePromise = loadStripe(STRIPE_API_KEY);

function InfoCheckout({ show, onHide, cartItems }) {
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [shippingInfo, setShippingInfo] = useState({
        fullName: '',
        address: '',
        email: '',
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

    const handleCheckout = async (e) => {
        e.preventDefault();
        
        try {
            setLoading(true);
            setError(null);
            
            let token = '';
            if (currentUser) {
                token = await currentUser.getIdToken();
            }
            
            // Prepara i dati per il checkout con singola immagine per prodotto
            const checkoutData = {
                items: cartItems.map(item => ({
                    ...item,
                    // Se imageUrl è un array, prendi solo la prima immagine
                    imageUrl: Array.isArray(item.imageUrl) ? item.imageUrl[0] : item.imageUrl,
                    // Assicurati che l'id del prodotto sia disponibile
                    product: item._id
                })),
                shippingInfo,
                userId: currentUser?.uid || null
            };
            
            // Invia richiesta al backend
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
        <Modal
            show={show}
            onHide={onHide}
            size="lg"
            centered
            backdrop="static"
            keyboard={false}
        >
            <Modal.Header closeButton>
                <Modal.Title>Informazioni di spedizione</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <div className="alert alert-danger">{error}</div>}
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
                                <Form.Label>Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    name="email"
                                    value={shippingInfo.email}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="esempio@dominio.com"
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={12}>
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
    );
}

export default InfoCheckout;