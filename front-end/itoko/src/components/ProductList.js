import React, { useState, useEffect, useMemo } from 'react';
import { Card, Row, Col, Carousel, Badge, Dropdown, Pagination, Button, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';

const ProductList = ({ maxProducts = 8 }) => {
  const { paginationProduct, loading, error, fetchProducts, paginationGraphic } = useProducts();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Usa useMemo per memorizzare le grafiche e i prodotti
  const graphics = useMemo(() => {
    return (paginationGraphic.graphics && paginationGraphic.graphics.length > 0)
      ? paginationGraphic.graphics
      : [];
  }, [paginationGraphic.graphics]);

  const products = useMemo(() => {
    return (paginationProduct.products && paginationProduct.products.length > 0)
      ? paginationProduct.products
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
  }, [graphics]);

  // Filtra solo per categoria selezionata (se vuoi mantenere il filtro locale per categoria)
  const filteredGraphics = useMemo(() => {
    let filtered = [...graphics];
    if (selectedCategory) {
      filtered = filtered.filter(graphic => graphic.tags === selectedCategory);
    }
    // Limita il numero di grafiche visualizzate (opzionale)
    if (maxProducts > 0 && filtered.length > maxProducts) {
      filtered = filtered.slice(0, maxProducts);
    }
    return filtered;
  }, [graphics, selectedCategory, maxProducts]);

  const handleGraphicClick = (graphicId) => {
    const relatedProducts = products.filter(product =>
      product.graphic && (product.graphic._id === graphicId || product.graphic === graphicId)
    );
    if (relatedProducts.length > 0) {
      navigate(`/details/${relatedProducts[0]._id}`);
    } else {
      navigate(`/details/${graphicId}`);
    }
  };

  if (loading) {
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
      {categories.length > 0 && (
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
          const relatedProducts = products.filter(product =>
            product.graphic && (product.graphic._id === graphic._id || product.graphic === graphic._id)
          );
          const availableTypes = [...new Set(relatedProducts.map(p => p.type))];
          const firstProduct = relatedProducts.length > 0 ? relatedProducts[0] : null;

          return (
            <Col key={graphic._id} xs={12} sm={6} md={4} lg={3}>
              <Card className="h-100 product-card shadow-sm">
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
                            cursor: 'pointer',
                            objectFit: 'cover'
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
                  <Card.Title className="d-flex justify-content-between align-items-start" >
                    {graphic.name}
                  </Card.Title>

                  {graphic.tags && (
                    <Card.Subtitle className="mb-2 text-muted">
                      {graphic.tags}
                    </Card.Subtitle>
                  )}

                  <Card.Text className="product-description">
                    {firstProduct && firstProduct.description ? (
                      firstProduct.description.length > 20
                        ? `${firstProduct.description.substring(0, 60)}...`
                        : firstProduct.description
                    ) : (
                      'Nessuna descrizione disponibile'
                    )}
                  </Card.Text>

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
          )
        })}
      </Row>
      <Pagination className="mt-4 justify-content-center">
        <Pagination.Prev
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
        />

        {[...Array(paginationGraphic.totalPages)].map((_, idx) => (
          <Pagination.Item
            key={idx}
            active={idx + 1 === currentPage}
            onClick={() => setCurrentPage(idx + 1)}
          >
            {idx + 1}
          </Pagination.Item>
        ))}
        <Pagination.Next
          disabled={currentPage === paginationGraphic.totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
        />
      </Pagination>
    </>
  );
};

export default ProductList;