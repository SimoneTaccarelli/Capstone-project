import React, { useState, useEffect, useMemo } from 'react';
import { Card, Row, Col, Carousel, Badge, Dropdown, Pagination, Button, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';


const ProductList = ({ searchQuery = '', maxProducts = 8 }) => {
  const { paginationProduct, loading, error, fetchProducts, paginationGraphic } = useProducts();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  
  // Usa useMemo per memorizzare le grafiche e i prodotti
  const graphics = useMemo(() => {
    return (paginationGraphic.graphics && paginationGraphic.graphics.length > 0)
      ? paginationGraphic.graphics  // Non spreaddare l'array
      : [];
  }, [paginationGraphic.graphics]);

  const products = useMemo(() => {
    return (paginationProduct.products && paginationProduct.products.length > 0)
      ? paginationProduct.products  // Non spreaddare l'array
      : [];
  }, [paginationProduct.products]);

  // Estrai categorie uniche dalle grafiche
  useEffect(() => {
    if (graphics && graphics.length > 0) {
      const uniqueCategories = [...new Set(graphics
        .map(graphic => graphic.tags)
        .filter(Boolean))];
      setCategories(uniqueCategories);
    }
  }, [graphics]);  // graphics ora è un valore memorizzato che cambia solo quando paginationGraphic.graphics cambia

  // Filtra le grafiche in base alla ricerca e alla categoria
  const filteredGraphics = useMemo(() => {
    let filtered = [...graphics];  // Qui è OK usare spread perché siamo dentro useMemo
    
    // Filtra per ricerca
    if (searchQuery) {
      filtered = filtered.filter(graphic =>
        graphic.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        graphic.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (graphic.tags && typeof graphic.tags === 'string' && 
         graphic.tags.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filtra per categoria
    if (selectedCategory) {
      filtered = filtered.filter(graphic => graphic.tags === selectedCategory);
    }
    
    // Limita il numero di grafiche visualizzate
    if (maxProducts > 0 && filtered.length > maxProducts) {
      filtered = filtered.slice(0, maxProducts);
    }
    
    return filtered;
  }, [graphics, searchQuery, selectedCategory, maxProducts]);

  const handleGraphicClick = (graphicId) => {
    // Trova i prodotti associati a questa grafica
    const relatedProducts = products.filter(product => 
      product.graphic && (product.graphic._id === graphicId || product.graphic === graphicId)
    );
    
    if (relatedProducts.length > 0) {
      // Se ci sono prodotti correlati, vai al dettaglio del primo prodotto
      navigate(`/product/${relatedProducts[0]._id}`);
    } else {
      // Altrimenti vai direttamente alla pagina della grafica
      navigate(`/graphic/${graphicId}`);
    }
  };

  if(loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Caricamento...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger">Errore nel caricamento dei dati: {error}</div>;
  }

  if (!graphics || graphics.length === 0) {
    return <div className="alert alert-info">Nessuna grafica trovata.</div>;
  }

  return (
    <>
      {/* Filtro per categoria */}
      {!searchQuery && categories.length > 0 && (
        <div className="d-flex justify-content-end mb-4">
          <Dropdown>
            <Dropdown.Toggle variant="outline-primary" id="dropdown-category">
              {selectedCategory ? `Categoria: ${selectedCategory}` : 'Filtra per categoria'}
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Item
                active={selectedCategory === ''}
                onClick={() => setSelectedCategory('')}
              >
                Tutte le categorie
              </Dropdown.Item>
              <Dropdown.Divider />

              {categories.map(category => (
                <Dropdown.Item
                  key={category}
                  active={selectedCategory === category}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </div>
      )}
      
      <Row className="g-4">
        {filteredGraphics.map(graphic => {
          // Trova i prodotti associati a questa grafica
          const relatedProducts = products.filter(product => 
            product.graphic && (product.graphic._id === graphic._id || product.graphic === graphic._id)
          );
          
          // Estrai i tipi di prodotti disponibili (T-shirt, Hoodie, ecc.)
          const availableTypes = [...new Set(relatedProducts.map(p => p.type))];
          
          // Trova il primo prodotto per informazioni come prezzo
          const firstProduct = relatedProducts.length > 0 ? relatedProducts[0] : null;
          
          return (
          <Col key={graphic._id} xs={12} sm={6} md={4} lg={3}>
            <Card className="h-100 product-card shadow-sm">
              {/* Carosello immagini grafica */}
              <Carousel interval={null} className="product-carousel">
                {graphic.imageUrl && graphic.imageUrl.length > 0 ? (
                  graphic.imageUrl.map((img, idx) => (
                    <Carousel.Item key={idx}>
                      <img
                        className="d-block w-100"
                        src={img}
                        alt={`${graphic.name} ${idx + 1}`}
                        style={{
                          height: '250px',
                          objectFit: 'contain',
                          backgroundColor: '#f8f9fa',
                          cursor: 'pointer'
                        }}
                        onClick={() => handleGraphicClick(graphic._id)}
                      />
                    </Carousel.Item>
                  ))
                ) : (
                  <Carousel.Item>
                    <div 
                      style={{
                        height: '250px',
                        background: '#f8f9fa',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <span className="text-muted">Nessuna immagine</span>
                    </div>
                  </Carousel.Item>
                )}
              </Carousel>

              <Card.Body>
                <Card.Title className="d-flex justify-content-between align-items-start">
                  {graphic.name}
                  {firstProduct && (
                    <Badge bg="primary" className="ms-2">{firstProduct.type}</Badge>
                  )}
                </Card.Title>
                
                {graphic.tags && (
                  <Card.Subtitle className="mb-2 text-muted">
                    {graphic.tags}
                  </Card.Subtitle>
                )}
                
                <Card.Text className="product-description">
                  {firstProduct && firstProduct.description ? (
                    firstProduct.description.length > 20 
                      ? `${firstProduct.description.substring(0, 20)}...` 
                      : firstProduct.description
                  ) : (
                    'Nessuna descrizione disponibile'
                  )}
                </Card.Text>
                
                {/* Tipi di prodotto disponibili */}
                {availableTypes.length > 0 && (
                  <div className="mb-2">
                    <small className="text-muted">Disponibile come: </small>
                    <div className="d-flex flex-wrap gap-1">
                      {availableTypes.map((type, idx) => (
                        <Badge 
                          key={idx} 
                          bg="light" 
                          text="dark" 
                          className="border"
                        >
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="d-flex justify-content-between align-items-center mt-3">
                  
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => handleGraphicClick(graphic._id)}
                  >
                    Visualizza
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        )})}
      </Row>
    </>
  );
};

export default ProductList;