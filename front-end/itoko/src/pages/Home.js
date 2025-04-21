import React from 'react';
import { Container } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import { useDesign } from '../context/DesignContext';
import ProductList from '../components/ProductList';


const Home = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('search') || '';
  
  // Usa il context per accedere all'immagine frontale
  const { frontImage, loading } = useDesign();
  console.log('frontImage:', frontImage);

  return (
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
  );
};

export default Home;