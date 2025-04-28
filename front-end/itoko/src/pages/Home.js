import React, { useState, useEffect, useRef } from 'react';
import { Container, Toast, ToastContainer } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import { useDesign } from '../context/DesignContext';
import ProductList from '../components/ProductList';
import { useOrder } from '../context/OrderContext';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('search') || '';
  
  // Usa il context per accedere all'immagine frontale
  const { frontImage, loading } = useDesign();
  
  // Previeni chiamate dopo unmount
  const isMounted = useRef(true);
  
  const { getUserOrders } = useOrder();
  const { currentUser } = useAuth();
  
  const [showWelcomeToast, setShowWelcomeToast] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  
  // Cleanup quando il componente viene smontato
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  // Toast di benvenuto
  useEffect(() => {
    // Verifica se c'è un utente appena loggato
    if (currentUser && location.state?.fromLogin) {
      setUserEmail(currentUser.email);
      setShowWelcomeToast(true);
      
      // Carica ordini dell'utente
      getUserOrders();
    }
  }, [currentUser, location.state, getUserOrders]);

  return (
    <>
      {/* Hero section con immagine frontale */}
      <div 
        className="hero-section position-relative" 
        style={{
          backgroundImage: frontImage ? `url(${frontImage})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          height: '70vh', // Aumentato per dare più spazio
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {/* Overlay scuro */}
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.6)' // Overlay più scuro per miglior contrasto
          }}
        ></div>
        
        {/* Contenuto centrato */}
        <div className="container position-relative text-center">
          <div className="mx-auto" style={{ maxWidth: '800px' }}>
            <h1 className="display-3 fw-bold text-white mb-4">
              Benvenuto nel nostro negozio
            </h1>
            <p className="lead text-white fs-4 mb-5">
              Scopri i nostri prodotti di qualità
            </p>
          </div>
        </div>
      </div>

      {/* Lista prodotti */}
      <Container className="py-5">
        <h2 className="text-center mb-4">
          {searchQuery 
            ? `Risultati per: "${searchQuery}"` 
            : "I nostri prodotti"
          }
        </h2>
        <ProductList searchQuery={searchQuery} />
      </Container>

      {/* Toast di benvenuto */}
      <ToastContainer position="top-end" className="p-3">
        <Toast 
          onClose={() => setShowWelcomeToast(false)} 
          show={showWelcomeToast} 
          delay={3000} 
          autohide
          bg="success"
        >
          <Toast.Header>
            <strong className="me-auto">Benvenuto</strong>
          </Toast.Header>
          <Toast.Body className="text-white">
            Bentornato, {userEmail}!
          </Toast.Body>
        </Toast>
      </ToastContainer>

      <Footer />
    </>
  );
};

export default Home;