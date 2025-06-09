import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Carousel, Badge, Dropdown, Pagination, Button, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';

const ProductList = ({ searchQuery = '', maxProducts = 8 }) => {
  const { paginationProduct, loading, error, fetchProducts } = useProducts();
  const navigate = useNavigate();
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);

  // Estrai categorie uniche dai prodotti
  useEffect(() => {
    if (paginationProduct.products && paginationProduct.products.length > 0) {
      const uniqueCategories = [...new Set(paginationProduct.products.map(p => p.category).filter(Boolean))];
      setCategories(uniqueCategories);
    }
  }, [paginationProduct]);

  // Filtra i prodotti in base alla ricerca e alla categoria
  useEffect(() => {
    if (paginationProduct.products) {
      let filtered = [...paginationProduct.products];

      // Filtra per ricerca
      if (searchQuery) {
        filtered = filtered.filter(product =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (product.category && product.category.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      }

      // Filtra per categoria
      if (selectedCategory) {
        filtered = filtered.filter(product =>
          product.category === selectedCategory
        );
      }

      // Limita il numero di prodotti visualizzati se necessario
      if (maxProducts > 0) {
        filtered = filtered.slice(0, maxProducts);
      }

      setFilteredProducts(filtered);
    }
  }, [paginationProduct, searchQuery, selectedCategory, maxProducts]);

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Caricamento...</span>
        </Spinner>
        <p className="mt-3">Caricamento prodotti...</p>
      </div>
    );
  }
  
  if (error) return <div className="alert alert-danger my-4">{error}</div>;
  if (!paginationProduct.products || paginationProduct.products.length === 0) 
    return <div className="alert alert-info my-4">Nessun prodotto disponibile.</div>;

  return (
    <div>
      {/* Filtro per categoria */}
      {!searchQuery && (
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
      <>
        {/* Visualizzazione prodotti */}
        {filteredProducts.length > 0 ? (
          <div>  
            <Row xs={1} md={2} lg={3} className="g-4">
              {filteredProducts.map((product) => {
                // Determina quali immagini mostrare (grafiche invece di prodotti)
                const graphicImages = product.graphic && product.graphic.imageUrl 
                  ? product.graphic.imageUrl 
                  : [];
                
                return (
                <Col key={product._id}>
                  <Card className="h-100 product-card shadow-sm">
                    {/* Carosello delle GRAFICHE */}
                    <Carousel interval={null} className="product-carousel">
                      {graphicImages.length > 0 ? (
                        graphicImages.map((img, idx) => (
                          <Carousel.Item key={idx}>
                            <img
                              className="d-block w-100"
                              src={img}
                              alt={`Grafica ${idx + 1}`}
                              style={{
                                height: '250px',
                                objectFit: 'contain',  // 'contain' per mostrare l'intera grafica
                                cursor: 'pointer',
                                backgroundColor: '#f8f9fa' // sfondo chiaro per grafiche con sfondo trasparente
                              }}
                              onClick={() => handleProductClick(product._id)}
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
                            <span className="text-muted">Nessuna grafica</span>
                          </div>
                        </Carousel.Item>
                      )}
                    </Carousel>
                    
                    {/* Corpo della card con informazioni sul PRODOTTO */}
                    <Card.Body>
                      <Card.Title className="d-flex justify-content-between align-items-start">
                        <div>{product.name || (product.graphic && product.graphic.name)}</div>
                        <Badge bg="primary">{product.type}</Badge>
                      </Card.Title>
                      <Card.Subtitle className="mb-2 text-muted">
                        {product.category}
                      </Card.Subtitle>
                      <Card.Text className="product-description">
                        {product.description && product.description.length > 100
                          ? `${product.description.substring(0, 100)}...`
                          : product.description}
                      </Card.Text>
                      
                      {/* Colori disponibili */}
                      {product.color && product.color.length > 0 && (
                        <div className="mb-2">
                          <small className="text-muted">Colori: </small>
                          <div className="d-flex flex-wrap gap-1">
                            {product.color.map((color, idx) => (
                              <Badge 
                                key={idx} 
                                bg="light" 
                                text="dark" 
                                className="border"
                              >
                                {color}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Taglie disponibili */}
                      {product.size && product.size.length > 0 && (
                        <div className="mb-2">
                          <small className="text-muted">Taglie: </small>
                          <div className="d-flex flex-wrap gap-1">
                            {product.size.map((size, idx) => (
                              <Badge 
                                key={idx} 
                                bg="light" 
                                text="dark" 
                                className="border"
                              >
                                {size}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="d-flex justify-content-between align-items-center mt-3">
                        <div className="fs-5 fw-bold">€{product.price}</div>
                        <Button 
                          variant="outline-primary" 
                          size="sm"
                          onClick={() => handleProductClick(product._id)}
                        >
                          Visualizza
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              )})}
            </Row>

            {/* Paginazione */}
            {paginationProduct.pagination && (
              <Pagination className="justify-content-center mt-4">
                <Pagination.Prev
                  onClick={() => fetchProducts(paginationProduct.pagination.currentPage - 1)}
                  disabled={paginationProduct.pagination.currentPage === 1}
                />
                {[...Array(paginationProduct.pagination.totalPages)].map((_, index) => (
                  <Pagination.Item
                    key={index}
                    active={index + 1 === paginationProduct.pagination.currentPage}
                    onClick={() => fetchProducts(index + 1)}
                  >
                    {index + 1} 
                  </Pagination.Item>
                ))}
                
                <Pagination.Next
                  onClick={() => fetchProducts(paginationProduct.pagination.currentPage + 1)}
                  disabled={paginationProduct.pagination.currentPage === paginationProduct.pagination.totalPages}
                />  
              </Pagination>
            )}
          </div>
        ) : (
          <div className="text-center py-5">
            <i className="bi bi-search" style={{ fontSize: '3rem' }}></i>
            <h3 className="mt-3">Nessun prodotto trovato</h3>
            <p>Prova a cercare qualcos'altro o rimuovi i filtri</p>
          </div>
        )}
      </>
    </div>
  );
};

export default ProductList;