import React, { useState } from 'react';
import { Button, Table, Badge } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../context/ProductContext';
import axios from 'axios';
import { API_URL } from '../config/config';
import ModifyProduct from '../modal/ModifyProduct';

const Administrator = () => {
  const { currentUser, userData } = useAuth();
  const { products, removeProduct } = useProducts();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);

  const isAdmin = userData && userData.role === 'Admin';

  // Gestione eliminazione prodotto
  const handleDelete = async (productId) => {
    if (!isAdmin) {
      setError("Non hai i permessi per eliminare i prodotti");
      return;
    }
    if (!window.confirm('Sei sicuro di voler eliminare questo prodotto?')) return;
    
    try {
      setLoading(true);
      const token = await currentUser.getIdToken();
      await axios.delete(`${API_URL}/product/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Aggiorna lo stato nel ProductContext
      removeProduct(productId);
    } catch (err) {
      setError('Errore durante l\'eliminazione del prodotto');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Apri modal di modifica
  const handleEditClick = (product) => {
    setEditProduct(product);
    setShowEditModal(true);
  };

  // Chiudi modal
  const handleCloseModal = () => {
    setShowEditModal(false);
    setEditProduct(null);
  };

  if (loading) return <div className="d-flex justify-content-center"><div className="spinner-border text-primary"></div></div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Gestione Prodotti</h2>
        <Button variant="primary" href="/CreateProduct">
          <i className="bi bi-plus-circle me-2"></i> Nuovo Prodotto
        </Button>
      </div>

      {/* Tabella Prodotti */}
      <div className="table-container rounded shadow-sm">
        <Table striped hover responsive>
          <thead className="bg-light">
            <tr>
              <th style={{ width: '80px' }}>Immagine</th>
              <th>Nome</th>
              <th>Prezzo</th>
              <th>Categoria</th>
              <th>Stock</th>
              <th style={{ width: '120px' }}>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {products && products.map(product => (
              <tr key={product._id}>
                <td>
                  {product.imageUrl && product.imageUrl.length > 0 ? (
                    <img 
                      src={product.imageUrl[0]} 
                      alt={product.name} 
                      className='rounded'
                      style={{ height: '50px', width: '50px', objectFit: 'cover' }} 
                    />
                  ) : (
                    <div className="bg-light text-center p-2" style={{ height: '50px', width: '50px' }}>
                      <i className="bi bi-image text-muted"></i>
                    </div>
                  )}
                </td>
                <td>{product.name}</td>
                <td>€{product.price?.toFixed(2) || '0.00'}</td>
                <td>{product.category?.name || product.category}</td>
                <td>
                  <Badge bg={
                    product.stock > 10 ? 'success' : 
                    product.stock > 0 ? 'warning' : 
                    'danger'
                  }>
                    {product.stock || 0}
                  </Badge>
                </td>
                <td>
                  <Button 
                    variant="outline-primary" 
                    size="sm" 
                    className="me-2"
                    onClick={() => handleEditClick(product)}
                  >
                    <i className="bi bi-pencil"></i>
                  </Button>
                  {isAdmin && (
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => handleDelete(product._id)}
                    >
                      <i className="bi bi-trash"></i>
                    </Button>
                  )}
                </td>
              </tr>
            ))}
            
            {(!products || products.length === 0) && (
              <tr>
                <td colSpan="6" className="text-center py-3">
                  Nessun prodotto disponibile. Clicca su "Nuovo Prodotto" per aggiungerne uno.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      {/* Modal importato */}
      <ModifyProduct 
        product={editProduct}
        show={showEditModal}
        handleClose={handleCloseModal}
      />
    </div>
  );
};

export default Administrator;