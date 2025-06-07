import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import axios from 'axios';
import { API_URL } from '../config/config';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../context/ProductContext';

const ModifyGraphic = ({ graphic, show, handleClose }) => {
  const [formValues, setFormValues] = useState({});
  const [currentImages, setCurrentImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { paginationGraphic, fetchProducts } = useProducts(); // Sostituito fetchGraphics con fetchProducts

  const { currentUser } = useAuth();

  // Inizializza i valori del form con i dati della grafica
  useEffect(() => {
    if (graphic) {
      setFormValues({
        name: graphic.name || '',
        tags: graphic.tags || [],
        imageUrl: graphic.imageUrl || [],
      });
      setCurrentImages(graphic.imageUrl || []);
    }
  }, [graphic]);

  // Gestione eliminazione immagine esistente
  const handleImageDelete = (imageUrl) => {
    setCurrentImages(currentImages.filter(img => img !== imageUrl));
  };

  // Gestione nuove immagini
  const handleNewImages = (e) => {
    const files = Array.from(e.target.files);
    setNewImages([...newImages, ...files]);

    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreview([...imagePreview, ...newPreviews]);
  };

  // Rimuovi nuova immagine
  const removeNewImage = (index) => {
    const updatedImages = [...newImages];
    updatedImages.splice(index, 1);
    setNewImages(updatedImages);

    const updatedPreviews = [...imagePreview];
    URL.revokeObjectURL(updatedPreviews[index]);
    updatedPreviews.splice(index, 1);
    setImagePreview(updatedPreviews);
  };

  // Salva le modifiche alla grafica
  const handleSaveChanges = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = await currentUser.getIdToken();

      const formData = new FormData();
      formData.append('name', formValues.name);
      formData.append('tags', JSON.stringify(formValues.tags));
      formData.append('existingImages', JSON.stringify(currentImages));

      newImages.forEach(file => {
        formData.append('images', file);
      });

      await axios.put(`${API_URL}/graphic/${graphic._id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      // Aggiorna prodotti
      fetchProducts(paginationGraphic.currentPage, paginationGraphic.graphicsPerPage); // Sostituito fetchGraphics con fetchProducts

      handleClose();
    } catch (err) {
      setError('Errore durante la modifica: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  console.log('fetchProducts:', fetchProducts);

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Modifica Grafica</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {error && <div className="alert alert-danger">{error}</div>}

        <Form>
          {/* Nome Grafica */}
          <Form.Group className="mb-3">
            <Form.Label>Nome Grafica</Form.Label>
            <Form.Control
              type="text"
              value={formValues.name || ''}
              onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
            />
          </Form.Group>

          {/* Tag */}
          <Form.Group className="mb-3">
            <Form.Label>Tag</Form.Label>
            <Form.Control
              type="text"
              value={formValues.tags ? formValues.tags.join(', ') : ''}
              onChange={(e) => setFormValues({ ...formValues, tags: e.target.value.split(', ') })}
            />
          </Form.Group>

          {/* Immagini attuali */}
          <Form.Group className="mb-4">
            <Form.Label>Immagini attuali</Form.Label>
            <div className="d-flex flex-wrap gap-2 mb-3">
              {currentImages.length > 0 ? (
                currentImages.map((img, index) => (
                  <div key={index} className="position-relative" style={{ width: '100px' }}>
                    <img
                      src={img}
                      alt={`Grafica ${index}`}
                      className="img-thumbnail"
                      style={{ width: '100px', height: '100px', objectFit: 'cover' }}
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

            {/* Aggiungi nuove immagini */}
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
                    <div key={index} className="position-relative" style={{ width: '100px' }}>
                      <img
                        src={preview}
                        alt={`Anteprima ${index}`}
                        className="img-thumbnail"
                        style={{ width: '100px', height: '100px', objectFit: 'cover' }}
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

export default ModifyGraphic;