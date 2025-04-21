import { useParams } from "react-router-dom";
import { useProducts } from "../context/ProductContext";
import { useCart } from "../context/CartContext";
import { useState } from 'react';
import { Row, Col, Button, Form, Badge } from 'react-bootstrap';
// Importa la libreria per l'effetto lente d'ingrandimento
import InnerImageZoom from 'react-inner-image-zoom';
// Importa il tuo CSS personalizzato invece di quello della libreria
import '../styles/imageZoom.css';

const Details = () => {
  const { products, loading, error } = useProducts();
  const { addToCart } = useCart();
  const { id } = useParams();
  const [activeIndex, setActiveIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  
  const product = products?.find(p => p._id === id);

  if (loading) return <div className="spinner"></div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!product) return <div className="alert alert-warning">Prodotto non trovato</div>;

  const handleAddToCart = () => {
    addToCart({
      ...product,
      quantity
    });
    
    // Feedback visivo
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <div className="container my-5">
      <div className="row">
        <div className="col-md-6">
          {product.imageUrl && product.imageUrl.length > 0 ? (
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
                    src={product.imageUrl[activeIndex]}
                    zoomSrc={product.imageUrl[activeIndex]}
                    zoomType="hover"
                    zoomPreload={true}
                    moveType="pan"
                    zoomScale={1.5}
                    cursor="zoom-in"
                    alt={`${product.name} - Immagine ${activeIndex + 1}`}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
              
              {/* Carosello thumbnails */}
              {product.imageUrl.length > 1 && (
                <Row className="thumbnail-gallery mt-3 justify-content-center" style={{
                  maxWidth: '80%',
                  margin: '0 auto'
                }}>
                  {product.imageUrl.map((img, idx) => (
                    <Col xs={3} key={idx} className="mb-2">
                      <img 
                        src={img} 
                        alt={`${product.name} - Thumbnail ${idx + 1}`}
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
          <h1 className="mb-3">{product.name}</h1>
          
          {product.category && (
            <Badge bg="secondary" className="mb-3">{product.category}</Badge>
          )}
          
          <p className="lead mb-4">{product.description}</p>
          
          <h3 className="mb-4 text-primary">€{product.price?.toFixed(2) || '0.00'}</h3>
          
          <div className="d-flex align-items-center mb-4">
            <Form.Group className="me-3" style={{ width: '100px' }}>
              <Form.Label>Quantità</Form.Label>
              <Form.Control
                type="number"
                min="1"
                max={product.stock || 10}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
              />
            </Form.Group>
            
            <div>
              {product.stock > 0 ? (
                <p className="text-success mb-0">
                  <i className="bi bi-check-circle me-1"></i>
                  Disponibile: {product.stock} in magazzino
                </p>
              ) : (
                <p className="text-danger mb-0">
                  <i className="bi bi-x-circle me-1"></i>
                  Esaurito
                </p>
              )}
            </div>
          </div>
          
          <Button 
            variant={addedToCart ? "success" : "primary"} 
            size="lg" 
            className="w-100 mb-3"
            onClick={handleAddToCart}
            disabled={!product.stock}
          >
            {addedToCart ? (
              <>
                <i className="bi bi-check-circle me-2"></i>
                Aggiunto al carrello!
              </>
            ) : (
              <>
                <i className="bi bi-cart-plus me-2"></i>
                Aggiungi al carrello
              </>
            )}
          </Button>
          
          {/* Informazioni aggiuntive */}
          <div className="mt-4 p-3 bg-light rounded">
            <h5>Informazioni prodotto</h5>
            <p className="mb-0 small">Categoria: {product.category || 'Non specificata'}</p>
            <p className="mb-0 small">ID prodotto: {product._id}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Details;