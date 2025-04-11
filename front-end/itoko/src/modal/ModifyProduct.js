import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import axios from 'axios';
import { API_URL } from '../config/config';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../context/ProductContext';

const ModifyProduct = ({ product, show, handleClose }) => {
  const [formValues, setFormValues] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { currentUser } = useAuth();
  const { updateProduct } = useProducts();

  

  // Aggiorna formValues quando product cambia
  useEffect(() => {
    if (product) {
      setFormValues({
        name: product.name,
        price: product.price,
        description: product.description,
        category: product.category,
        stock: product.stock
      });
    }
  }, [product]);

  // Gestione modifica prodotto
  const handleSaveChanges = async () => {
    if (!product) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const token = await currentUser.getIdToken();
      const response = await axios.put(
        `${API_URL}/product/${product._id}`,
        formValues,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Aggiorna lo stato nel ProductContext
      updateProduct(response.data);
      handleClose();
    } catch (err) {
      setError('Errore durante la modifica del prodotto');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  if (loading) return <div className="d-flex justify-content-center"><div className="spinner-border text-primary"></div></div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Modifica Prodotto</Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        {error && <div className="alert alert-danger">{error}</div>}
        
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Nome</Form.Label>
            <Form.Control 
              type="text" 
              value={formValues.name || ''} 
              onChange={(e) => setFormValues({...formValues, name: e.target.value})}
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Prezzo</Form.Label>
            <Form.Control 
              type="number" 
              value={formValues.price || ''} 
              onChange={(e) => setFormValues({...formValues, price: parseFloat(e.target.value)})}
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Descrizione</Form.Label>
            <Form.Control 
              as="textarea" 
              rows={3} 
              value={formValues.description || ''} 
              onChange={(e) => setFormValues({...formValues, description: e.target.value})}
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Categoria</Form.Label>
            <Form.Control 
              type="text" 
              value={formValues.category || ''} 
              onChange={(e) => setFormValues({...formValues, category: e.target.value})}
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Stock</Form.Label>
            <Form.Control 
              type="number" 
              value={formValues.stock || 0} 
              onChange={(e) => setFormValues({...formValues, stock: parseInt(e.target.value)})}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Annulla
        </Button>
        <Button 
          variant="primary" 
          onClick={handleSaveChanges}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Salvataggio...
            </>
          ) : 'Salva Modifiche'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModifyProduct;