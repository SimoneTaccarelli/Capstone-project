import React, { useState, useEffect, useRef } from 'react'; // Aggiungi useRef
import { Container, Toast, ToastContainer } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import { useDesign } from '../context/DesignContext';
import ProductList from '../components/ProductList';
import { useOrder } from '../context/OrderContext';

const Home = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('search') || '';
  
  // Usa il context per accedere all'immagine frontale
  const { frontImage, loading } = useDesign();
  
  // Previeni chiamate dopo unmount
  const isMounted = useRef(true);
  
  const { getUserOrders } = useOrder();
  
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
    if (localStorage.getItem('registrationSuccess') === 'true') {
      setUserEmail(localStorage.getItem('userEmail') || '');
      setShowWelcomeToast(true);
      
      // Pulisci i flag dopo averli letti
      localStorage.removeItem('registrationSuccess');
      localStorage.removeItem('userEmail');
    }
  }, []);
  
  // Caricamento ordini con protezione
  useEffect(() => {
    // Protezione per evitare chiamate API inutili
    if (!getUserOrders) return;
    
    const loadData = async () => {
      try {
        if (!isMounted.current) return;
        
        // Ritardo solo all'inizio per dare tempo all'autenticazione
        await new Promise(resolve => setTimeout(resolve, 800));
        
        if (!isMounted.current) return;
        
        // Recupera ordini in modo sicuro
        getUserOrders().catch(err => {
          console.log("Errore recupero ordini (gestito):", err);
        });
      } catch (error) {
        console.log("Errore generico (gestito):", error);
      }
    };
    
    loadData();
  }, [getUserOrders]);
  
  return (
    <>
      <Container className="py-5">
        {/* Hero Banner - visibile solo se non c'è una ricerca attiva */}
        {!searchQuery && (
          <div 
            className="jumbotron text-center my-5 rounded-3 d-flex flex-column justify-content-center"
            style={{
              backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${frontImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              height: '550px',
              color: 'white',
            }}
          >
            <h1 className="display-4 fw-bold mb-4">Benvenuto su Itoko</h1>
            <p className="lead mb-4">Scopri la nostra collezione di prodotti unici e di alta qualità</p>
          </div>
        )}

        {/* Titolo dei risultati di ricerca - visibile solo durante la ricerca */}
        {searchQuery && (
          <div className="mt-5 mb-4">
            <h2>Risultati per: <span className="text-primary">"{searchQuery}"</span></h2>
          </div>
        )}

        {/* Sezione Prodotti */}
        <section className="my-5">
          <ProductList searchQuery={searchQuery} maxProducts={searchQuery ? 0 : 8} />
        </section>
      </Container>

      {/* Toast di benvenuto */}
      <ToastContainer position="top-end" className="p-3">
        <Toast 
          show={showWelcomeToast} 
          onClose={() => setShowWelcomeToast(false)}
          delay={5000}
          autohide
        >
          <Toast.Header>
            <strong className="me-auto">Benvenuto in ItokoNoLab!</strong>
          </Toast.Header>
          <Toast.Body>
            Registrazione completata con successo{userEmail ? ` per ${userEmail}` : ''}!
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  );
};

export default Home;