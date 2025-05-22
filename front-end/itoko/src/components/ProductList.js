import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Carousel, Badge, Dropdown, Pagination } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';

const ProductList = ({ searchQuery = '', maxProducts = 8 }) => {
  const { products, loading, error, pagination, fetchProducts } = useProducts();
  // const { addToCart } = useCart();
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);

  // Estrai categorie uniche dai prodotti
  useEffect(() => {
    if (products && products.length > 0) {
      const uniqueCategories = [...new Set(products.map(p => p.category).filter(Boolean))];
      setCategories(uniqueCategories);
    }
  }, [products]);

  // Filtra i prodotti in base alla ricerca e alla categoria
  useEffect(() => {
    if (products) {
      let filtered = [...products];

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
  }, [products, searchQuery, selectedCategory, maxProducts]);

  if (loading) return <div className="text-center my-4"><div className="spinner-border"></div></div>;
  if (error) return <div className="alert alert-danger my-4">{error}</div>;
  if (!products || products.length === 0) return <div className="alert alert-info my-4">Nessun prodotto disponibile.</div>;

  return (
    <div>
      {/* Visualizza il dropdown solo se non c'è una ricerca attiva */}
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
            <Row>
              {filteredProducts.map((product) => (
                <Col key={product._id} xs={12} sm={6} md={4} lg={3} className="mb-4">
                  <Card className="h-100 product-card shadow-sm">
                    <Card.Header className="p-0 border-0">
                      <Carousel interval={null} indicators={false}>
                        {product.imageUrl && product.imageUrl.length > 0 ? (
                          product.imageUrl.map((imgUrl, index) => (
                            <Carousel.Item key={index}>
                              <img
                                className="d-block w-100"
                                src={imgUrl}
                                alt={`${product.name} - immagine ${index + 1}`}
                                style={{ 
                                  height: "180px", 
                                  objectFit: "cover"
                                }}
                              />
                            </Carousel.Item>
                          ))
                        ) : (
                          <Carousel.Item>
                            <div 
                              className="d-flex justify-content-center align-items-center bg-light w-100"
                              style={{ height: "180px" }}
                            >
                              <i className="bi bi-image text-muted" style={{ fontSize: "2rem" }}></i>
                            </div>
                          </Carousel.Item>
                        )}
                      </Carousel>
                    </Card.Header>
                    
                    <Card.Body>
                      <Card.Title className="text-truncate">{product.name}</Card.Title>
                      
                      {product.category && (
                        <Badge bg="secondary" className="mb-2">{product.category}</Badge>
                      )}
                      
                      <Card.Text className="small text-truncate">{product.description}</Card.Text>
                      <Card.Text className="fw-bold text-primary">€{product.price?.toFixed(2) || '0.00'}</Card.Text>
                    </Card.Body>
                    
                    <Card.Footer className="bg-white border-top-0">
                      <div className="d-grid gap-2">
                        <Link 
                          to={`/details/${product._id}`} 
                          className="btn btn-sm btn-outline-secondary"
                        >
                          <i className="bi bi-eye me-1"></i> Visualizza
                        </Link>
                        {/* <button 
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => addToCart(product)}
                        >
                          <i className="bi bi-cart-plus me-1"></i> Aggiungi al carrello
                        </button> */}
                      </div>
                    </Card.Footer>
                  </Card>
                </Col>
              ))}
            </Row>

            {/* Paginazione */}
            <Pagination className="justify-content-center mt-4">
              <Pagination.Prev
                onClick={() => fetchProducts(pagination.pagination.currentPage - 1)}
                disabled={pagination.pagination.currentPage === 1}
              />
              {[...Array(pagination.pagination.totalPages)].map((_, index) => (
                <Pagination.Item
                  key={index}
                  active={index + 1 === pagination.currentPage}
                  onClick={() => fetchProducts(index + 1)}
                >
                  {index + 1} 
                </Pagination.Item>
              ))}
              
              <Pagination.Next
                onClick={() => fetchProducts(pagination.pagination.currentPage + 1)}
                disabled={pagination.pagination.currentPage === pagination.pagination.totalPages}
              />  
            </Pagination>
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