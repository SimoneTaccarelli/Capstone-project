import { useParams } from "react-router-dom";
import { useProducts } from "../context/ProductContext";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config/config.js';
import { Row, Col, Button, Form, Badge, ButtonGroup, Toast, ToastContainer } from 'react-bootstrap';
import InnerImageZoom from 'react-inner-image-zoom';
import '../styles/imageZoom.css';
import { useCart } from '../context/CartContext';

const Details = () => {
  const { paginationProduct, loading, error } = useProducts();
  const { id } = useParams();
  const [activeIndex, setActiveIndex] = useState(0);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState('T-shirt');
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState('success');
  
  // Recupera il prodotto corrente e quelli correlati
  useEffect(() => {
    if (paginationProduct.products && paginationProduct.products.length > 0) {
      // Trova il prodotto corrente
      const product = paginationProduct.products.find(p => p._id === id);
      
      if (product) {
        setCurrentProduct(product);
        
        // CORREZIONE: Trova correttamente tutti i prodotti con la stessa grafica
        // Assicurandoci che graphic sia una stringa (non un oggetto)
        const graphicId = typeof product.graphic === 'string' 
          ? product.graphic 
          : product.graphic?._id || null;
          
        if (graphicId) {
          const related = paginationProduct.products.filter(p => 
            (typeof p.graphic === 'string' ? p.graphic === graphicId : p.graphic?._id === graphicId) 
            && p._id !== product._id
          );
          
          console.log("Prodotti correlati trovati:", related);
          setRelatedProducts(related);
        }
        
        // Imposta il tipo selezionato in base al prodotto corrente
        setSelectedVariant(product.type || 'T-shirt');
      }
    }
  }, [paginationProduct.products, id]);

  // Cambia il prodotto selezionato in base al tipo
  const handleVariantChange = (variant) => {
    // Se il tipo è già quello selezionato, non fare nulla
    if (currentProduct.type === variant) return;
    
    setSelectedVariant(variant);
    
    // Cerca un prodotto del tipo selezionato tra i correlati
    const variantProduct = relatedProducts.find(p => p.type === variant);
    
    // Se trovato, imposta come prodotto corrente e AGGIORNA i prodotti correlati
    if (variantProduct) {
      // Quando cambio prodotto, quello corrente diventa "correlato"
      const newRelatedProducts = [
        ...relatedProducts.filter(p => p._id !== variantProduct._id), // rimuovi il nuovo prodotto corrente
        currentProduct // aggiungi il vecchio prodotto corrente
      ];
      
      console.log("Aggiornamento prodotti correlati:", newRelatedProducts);
      
      setCurrentProduct(variantProduct);
      setRelatedProducts(newRelatedProducts);
      setActiveIndex(0); // Reset dell'immagine selezionata
    } 
  };

  // Funzione per generare o recuperare sessionId
  function getSessionId() {
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
  }

  // Usa le funzioni del carrello direttamente dal provider
  const { addProductToCart } = useCart();

  // Funzione per aggiungere al carrello
  const handleAddToCart = async () => {
    setAddingToCart(true);
    
    try {
      // CORREZIONE: Inserisci un console.log per debug
      console.log("Tentativo di aggiungere al carrello:", {
        prodotto: currentProduct,
        quantità: quantity
      });
      
      // Usa la funzione condivisa dal CartContext
      await addProductToCart(currentProduct, quantity);
      
      // Feedback positivo
      setToastVariant('success');
      setToastMessage(`${currentProduct.name} (${currentProduct.type}) aggiunto al carrello!`);
      setShowToast(true);
      
    } catch (error) {
      console.error("Errore nell'aggiunta al carrello:", error);
      
      // Feedback negativo
      setToastVariant('danger');
      setToastMessage(`Impossibile aggiungere il prodotto: ${error.message}`);
      setShowToast(true);
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) return <div className="spinner"></div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!currentProduct) return <div className="alert alert-warning">Prodotto non trovato</div>;

  // Determina quali tipi di prodotto sono disponibili
  const availableTypes = [
    ...(currentProduct.type ? [currentProduct.type] : []),
    ...relatedProducts.map(p => p.type)
  ].filter((value, index, self) => self.indexOf(value) === index); // Rimuovi duplicati

  return (
    <div className="container my-5">
      <div className="row">
        <div className="col-md-6">
          {currentProduct.imageUrl && currentProduct.imageUrl.length > 0 ? (
            <>
              {/* Visualizzazione principale con effetto lente d'ingrandimento */}
              <div className="main-image-container mb-3 text-center" style={{ 
                width: '100%',
                maxWidth: '80%',
                margin: '0 auto',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
              }}>
                <div className="iiz-container" style={{ display: 'inline-block', width: '100%' }}>
                  <InnerImageZoom
                    src={currentProduct.imageUrl[activeIndex]}
                    zoomSrc={currentProduct.imageUrl[activeIndex]}
                    zoomType="hover"
                    zoomPreload={true}
                    moveType="pan"
                    zoomScale={1.5}
                    cursor="zoom-in"
                    alt={`${currentProduct.name} - Immagine ${activeIndex + 1}`}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
              
              {/* Carosello thumbnails */}
              {currentProduct.imageUrl.length > 1 && (
                <Row className="thumbnail-gallery mt-3 justify-content-center" style={{
                  maxWidth: '80%',
                  margin: '0 auto'
                }}>
                  {currentProduct.imageUrl.map((img, idx) => (
                    <Col xs={3} key={idx} className="mb-2">
                      <img 
                        src={img} 
                        alt={`${currentProduct.name} - Thumbnail ${idx + 1}`}
                        className={`img-thumbnail rounded ${activeIndex === idx ? 'border-primary' : ''}`}
                        onClick={() => setActiveIndex(idx)}
                        style={{ 
                          cursor: 'pointer',
                          height: '70px',
                          objectFit: 'cover',
                          opacity: activeIndex === idx ? 1 : 0.7,
                          borderRadius: '8px'
                        }}
                      />
                    </Col>
                  ))}
                </Row>
              )}
            </>
          ) : (
            <div className="bg-light text-center p-5 rounded">
              <i className="bi bi-image text-muted" style={{ fontSize: '3rem' }}></i>
            </div>
          )}
        </div>
        <div className="col-md-6">
          <h1 className="mb-3">{currentProduct.name}</h1>
          
          {currentProduct.category && (
            <Badge bg="secondary" className="mb-3">{currentProduct.category}</Badge>
          )}
          
          {/* Selettore dedidato T-shirt/Hoodie - sostituisce il primo selettore */}
          <div className="mb-4">
            <h5 className="mb-2">Seleziona modello:</h5>
            <div className="d-flex gap-2 flex-wrap">
              <Button
                variant={selectedVariant === 'T-shirt' ? "primary" : "outline-primary"}
                onClick={() => {
                  // Verifica se esiste la variante T-shirt
                  if (currentProduct.type === 'T-shirt' || relatedProducts.some(p => p.type === 'T-shirt')) {
                    handleVariantChange('T-shirt');
                  } else {
                    alert('Siamo spiacenti, questo design non è disponibile come T-shirt al momento.');
                  }
                }}
                className="me-2 d-flex align-items-center"
              >
                 T-Shirt
                {!(currentProduct.type === 'T-shirt' || relatedProducts.some(p => p.type === 'T-shirt')) && (
                  <Badge bg="secondary" pill className="ms-2">Non disponibile</Badge>
                )}
              </Button>
              
              <Button
                variant={selectedVariant === 'Hoodie' ? "primary" : "outline-primary"}
                onClick={() => {
                  // Verifica se esiste la variante Hoodie
                  if (currentProduct.type === 'Hoodie' || relatedProducts.some(p => p.type === 'Hoodie')) {
                    handleVariantChange('Hoodie');
                  } else {
                    alert('Siamo spiacenti, questo design non è disponibile come Felpa con cappuccio al momento.');
                  }
                }}
                className="d-flex align-items-center"
              >
                 Hoodie
                {!(currentProduct.type === 'Hoodie' || relatedProducts.some(p => p.type === 'Hoodie')) && (
                  <Badge bg="secondary" pill className="ms-2">Non disponibile</Badge>
                )}
              </Button>
            </div>
          </div>

          {/* Mantenere il selettore per altri tipi di prodotto oltre a T-shirt e Hoodie */}
          {availableTypes.filter(type => type !== 'T-shirt' && type !== 'Hoodie').length > 0 && (
            <div className="mb-4">
              <h5 className="mb-2">Altri modelli disponibili:</h5>
              <div className="d-flex flex-wrap gap-2">
                {availableTypes
                  .filter(type => type !== 'T-shirt' && type !== 'Hoodie')
                  .map(type => (
                    <Button
                      key={type}
                      variant={selectedVariant === type ? "primary" : "outline-primary"}
                      onClick={() => handleVariantChange(type)}
                    >
                      {type}
                    </Button>
                  ))}
              </div>
            </div>
          )}
          
          <p className="lead mb-4">{currentProduct.description}</p>
          
          <h3 className="mb-4 text-primary">€{currentProduct.price?.toFixed(2) || '0.00'}</h3>
          
          {/* Colori disponibili */}
          {currentProduct.color && currentProduct.color.length > 0 && (
            <div className="mb-4">
              <h5 className="mb-2">Colori disponibili:</h5>
              <div className="d-flex flex-wrap gap-2">
                {Array.isArray(currentProduct.color) ? (
                  currentProduct.color.map((color, idx) => (
                    <Badge 
                      key={idx} 
                      bg="light" 
                      text="dark" 
                      className="p-2 border"
                    >
                      {color}
                    </Badge>
                  ))
                ) : (
                  <Badge bg="light" text="dark" className="p-2 border">
                    {currentProduct.color}
                  </Badge>
                )}
              </div>
            </div>
          )}
          
          {/* Taglie disponibili */}
          {currentProduct.size && currentProduct.size.length > 0 && (
            <div className="mb-4">
              <h5 className="mb-2">Taglie disponibili:</h5>
              <div className="d-flex flex-wrap gap-2">
                {Array.isArray(currentProduct.size) ? (
                  currentProduct.size.map((size, idx) => (
                    <Badge 
                      key={idx} 
                      bg="light" 
                      text="dark" 
                      className="p-2 border"
                    >
                      {size}
                    </Badge>
                  ))
                ) : (
                  <Badge bg="light" text="dark" className="p-2 border">
                    {currentProduct.size}
                  </Badge>
                )}
              </div>
            </div>
          )}
          
          {/* Informazioni aggiuntive */}
          <div className="mt-4 p-3 bg-light rounded">
            <h5>Informazioni prodotto</h5>
            <p className="mb-0 small">Categoria: {currentProduct.category || 'Non specificata'}</p>
            <p className="mb-0 small">Tipo: {currentProduct.type || 'Non specificato'}</p>
            <p className="mb-0 small">ID prodotto: {currentProduct._id}</p>
          </div>
          
          {/* Interfaccia per quantità e pulsante aggiungi al carrello */}
          <div className="d-flex align-items-center mb-4">
            <div className="input-group me-3" style={{ width: '150px' }}>
              <Button 
                variant="outline-secondary"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={addingToCart}
              >
                -
              </Button>
              <input
                type="number"
                className="form-control text-center"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                readOnly={addingToCart}
              />
              <Button
                variant="outline-secondary"
                onClick={() => setQuantity(quantity + 1)}
                disabled={addingToCart}
              >
                +
              </Button>
            </div>
            
            <Button
              variant="primary"
              size="lg"
              onClick={handleAddToCart}
              disabled={addingToCart}
              className="d-flex align-items-center"
            >
              {addingToCart ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Aggiunta...
                </>
              ) : (
                <>
                  <i className="bi bi-cart-plus me-2"></i>
                  Aggiungi al carrello
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Toast di notifica */}
      <ToastContainer position="bottom-end" className="p-3">
        <Toast 
          show={showToast} 
          onClose={() => setShowToast(false)} 
          delay={3000} 
          autohide
          bg={toastVariant}
        >
          <Toast.Header closeButton={true}>
            <strong className="me-auto">Carrello</strong>
          </Toast.Header>
          <Toast.Body className={toastVariant === 'success' ? 'text-white' : ''}>
            {toastMessage}
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
};

export default Details;