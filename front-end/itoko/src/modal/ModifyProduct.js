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

  const [currentImages, setCurrentImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);

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
      // Inizializza le immagini attuali
      setCurrentImages(product.imageUrl || []);
      // Reset degli stati quando cambia il prodotto
      setImagesToDelete([]);
      setNewImages([]);
      setImagePreview([]);
    }
  }, [product]);

  // Gestione eliminazione immagine esistente
  const handleImageDelete = (imageUrl) => {
    setCurrentImages(currentImages.filter(img => img !== imageUrl));
    setImagesToDelete([...imagesToDelete, imageUrl]);
  };

  // Gestione nuove immagini
  const handleNewImages = (e) => {
    const files = Array.from(e.target.files);
    setNewImages([...newImages, ...files]);
    
    // Crea URL per le anteprime
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreview([...imagePreview, ...newPreviews]);
  };

  // Rimuovi nuova immagine
  const removeNewImage = (index) => {
    const updatedImages = [...newImages];
    updatedImages.splice(index, 1);
    setNewImages(updatedImages);
    
    const updatedPreviews = [...imagePreview];
    URL.revokeObjectURL(updatedPreviews[index]); // Libera memoria
    updatedPreviews.splice(index, 1);
    setImagePreview(updatedPreviews);
  };

  // Gestione modifica prodotto
  const handleSaveChanges = async () => {
    if (!product) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const token = await currentUser.getIdToken();
      
      // Prepara i dati da inviare
      const formData = new FormData();
      
      formData.append('name', formValues.name);
      formData.append('price', formValues.price.toString());  // Assicurati che sia una stringa
      formData.append('description', formValues.description);
      formData.append('category', formValues.category);
      formData.append('stock', formValues.stock.toString());  // Assicurati che sia una stringa
      
      // Aggiungi le immagini esistenti come JSON
      formData.append('existingImages', JSON.stringify(currentImages));
      
      // Aggiungi eventuali nuove immagini
      newImages.forEach(file => {
        formData.append('images', file);  // Assicurati che questo nome corrisponda a ciò che il backend si aspetta
      });
      
      // Effettua la chiamata PUT
      const response = await axios.put(
        `${API_URL}/product/${product._id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      // Aggiorna lo stato nel ProductContext
      updateProduct(response.data);
      handleClose();
    } catch (err) {
      setError('Errore durante la modifica del prodotto: ' + (err.response?.data?.error || err.message));
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

          <Form.Group className="mb-4">
            <Form.Label>Immagini attuali</Form.Label>
            <div className="d-flex flex-wrap gap-2 mb-3">
              {currentImages.length > 0 ? (
                currentImages.map((img, index) => (
                  <div key={index} className="position-relative" style={{width: '100px'}}>
                    <img 
                      src={img} 
                      alt={`Prodotto ${index}`} 
                      className="img-thumbnail" 
                      style={{width: '100px', height: '100px', objectFit: 'cover'}}
                    />
                    <Button 
                      variant="danger" 
                      size="sm" 
                      className="position-absolute top-0 end-0"
                      onClick={() => handleImageDelete(img)}
                    >
                      <i className="bi bi-x"></i>
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-muted">Nessuna immagine disponibile</p>
              )}
            </div>
            
            <Form.Label>Aggiungi nuove immagini</Form.Label>
            <Form.Control 
              type="file" 
              multiple 
              accept="image/*"
              onChange={handleNewImages}
            />
            
            {imagePreview.length > 0 && (
              <>
                <Form.Label className="mt-3">Anteprima nuove immagini</Form.Label>
                <div className="d-flex flex-wrap gap-2">
                  {imagePreview.map((preview, index) => (
                    <div key={index} className="position-relative" style={{width: '100px'}}>
                      <img 
                        src={preview} 
                        alt={`Anteprima ${index}`} 
                        className="img-thumbnail" 
                        style={{width: '100px', height: '100px', objectFit: 'cover'}}
                      />
                      <Button 
                        variant="danger" 
                        size="sm" 
                        className="position-absolute top-0 end-0"
                        onClick={() => removeNewImage(index)}
                      >
                        <i className="bi bi-x"></i>
                      </Button>
                    </div>
                  ))}
                </div>
              </>
            )}
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