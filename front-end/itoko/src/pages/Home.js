import React from 'react';
import { useProducts } from "../context/ProductContext";
import { Carousel, Card, Row, Col } from 'react-bootstrap';

const Home = () => {
  const { products, loading, error } = useProducts();
  
  if (loading) return <div className="spinner"></div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container">  
      <Row>
        {products.map((product) => (
          <Col key={product._id} xs={12} sm={6} md={4} lg={3} className="mb-4">
            <Card className="h-100 shadow-sm">
              {/* Carosello per le immagini */}
              <Card.Header className="p-0 border-0">
                <Carousel interval={null}>
                  {product.imageUrl && product.imageUrl.length > 0 ? (
                    // Se ci sono immagini, mostra il carosello
                    product.imageUrl.map((imgUrl, index) => (
                      <Carousel.Item key={index}>
                        <img
                          className="d-block w-100"
                          src={imgUrl}
                          alt={`${product.name} - immagine ${index + 1}`}
                          style={{ 
                            height: "200px", 
                            objectFit: "cover"
                          }}
                        />
                      </Carousel.Item>
                    ))
                  ) : (
                    <Carousel.Item>
                      <div 
                        className="d-flex justify-content-center align-items-center bg-light w-100"
                        style={{ height: "200px" }}
                      >
                        <i className="bi bi-image text-muted" style={{ fontSize: "2rem" }}></i>
                      </div>
                    </Carousel.Item>
                  )}
                </Carousel>
              </Card.Header>
              <Card.Body>
                <Card.Title>{product.name}</Card.Title>
                <Card.Text>{product.description}</Card.Text>
                <Card.Text className="fw-bold">€{product.price?.toFixed(2) || '0.00'}</Card.Text>
              </Card.Body>
              
              <Card.Footer className="bg-white border-top-0 text-end">
                <button className="btn btn-sm btn-outline-primary">
                  <i className="bi bi-cart-plus me-1"></i> Aggiungi al carrello
                </button>
              </Card.Footer>
            </Card>
          </Col>
        ))}
        
        {products.length === 0 && (
          <Col xs={12}>
            <div className="alert alert-info">Nessun prodotto trovato</div>
          </Col>
        )}
      </Row>
    </div> 
  );
}

export default Home;