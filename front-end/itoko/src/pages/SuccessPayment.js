import React, { useEffect } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link, useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const SuccessPayment = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');
  const cartContext = useCart();

  useEffect(() => {
    // Verifica se clearCart esiste prima di chiamarla
    if (cartContext && typeof cartContext.clearCart === 'function') {
      cartContext.clearCart();
    } else {
      console.warn('clearCart function not available in CartContext');
    }
  }, [cartContext]);

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6} className="text-center">
          <div className="bg-white p-5 shadow rounded">
            {/* Icona spunta verde semplice */}
            <div className="text-success mb-4">
              <i className="bi bi-check-circle-fill" style={{ fontSize: '80px' }}></i>
            </div>

            <h1 className="text-success mb-3">Pagamento completato!</h1>
            <p className="text-muted mb-4">
              Grazie per il tuo acquisto. Il tuo ordine è stato ricevuto e sarà elaborato a breve.
            </p>
            
            {orderId && (
              <div className="order-info p-3 bg-light rounded mb-4">
                <p className="mb-0">ID ordine: <strong>{orderId}</strong></p>
                <small>Conserva questo codice per riferimenti futuri</small>
              </div>
            )}

            <Link to="/">
              <Button variant="success" size="lg" className="px-5">
                Torna alla Home
              </Button>
            </Link>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default SuccessPayment;