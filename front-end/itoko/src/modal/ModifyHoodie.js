import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import axios from 'axios';
import { API_URL } from '../config/config';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../context/ProductContext';

const ModifyHoodie = ({ graphicName, show, handleClose }) => {
  const [formValues, setFormValues] = useState({
    description: '',
    price: '',
    category: '',
    type: 'Hoodie',
  });
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [currentImages, setCurrentImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { paginationProduct, fetchProducts } = useProducts();

  const { currentUser } = useAuth();

  const availableColors = [
    "Black", "Water Blue", "Beige", "Light Gray", "Light Purple", "Orange",
    "Rose Red", "Red", "Light Blue", "Light Brown", "Blue Jeans", "Dark Blue",
    "Purple Haze", "Dark Green", "Gray Green", "Pirate Gray"
  ];

  const availableSizes = ["S", "M", "L", "XL", "XXL"];

  useEffect(() => {
    const hoodieProduct = paginationProduct.products.find(
      (product) => product.type === 'Hoodie' && product.name === graphicName
    );

    if (hoodieProduct) {
      setFormValues({
        description: hoodieProduct.description || '',
        price: hoodieProduct.price || '',
        category: hoodieProduct.category || '',
        type: 'Hoodie',
      });
      
      // Gestisci colori e taglie separatamente come array indipendenti
      setColors(Array.isArray(hoodieProduct.color) ? hoodieProduct.color : []);
      setSizes(Array.isArray(hoodieProduct.size) ? hoodieProduct.size : []);
      setCurrentImages(hoodieProduct.imageUrl || []);
    }
  }, [graphicName, paginationProduct]);

  const handleImageDelete = (imageUrl) => {
    setCurrentImages(currentImages.filter((img) => img !== imageUrl));
  };

  const handleNewImages = (e) => {
    const files = Array.from(e.target.files);
    setNewImages([...newImages, ...files]);

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImagePreview([...imagePreview, ...newPreviews]);
  };

  const removeNewImage = (index) => {
    const updatedImages = [...newImages];
    updatedImages.splice(index, 1);
    setNewImages(updatedImages);

    const updatedPreviews = [...imagePreview];
    URL.revokeObjectURL(updatedPreviews[index]);
    updatedPreviews.splice(index, 1);
    setImagePreview(updatedPreviews);
  };

  // Aggiungi un colore
  const handleAddColor = (selectedColor) => {
    if (selectedColor && !colors.includes(selectedColor)) {
      setColors([...colors, selectedColor]);
    }
  };

  // Rimuovi un colore
  const handleRemoveColor = (colorToRemove) => {
    setColors(colors.filter(color => color !== colorToRemove));
  };

  // Aggiungi una taglia
  const handleAddSize = (selectedSize) => {
    if (selectedSize && !sizes.includes(selectedSize)) {
      setSizes([...sizes, selectedSize]);
    }
  };

  // Rimuovi una taglia
  const handleRemoveSize = (sizeToRemove) => {
    setSizes(sizes.filter(size => size !== sizeToRemove));
  };

  const handleSaveChanges = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = await currentUser.getIdToken();

      const formData = new FormData();
      formData.append('description', formValues.description);
      formData.append('price', formValues.price);
      formData.append('category', formValues.category);
      formData.append('type', 'Hoodie');
      formData.append('color', JSON.stringify(colors)); // Serializza l'array una sola volta
      formData.append('size', JSON.stringify(sizes)); // Serializza l'array una sola volta
      formData.append('existingImages', JSON.stringify(currentImages));

      newImages.forEach((file) => {
        formData.append('images', file);
      });

      const hoodieProduct = paginationProduct.products.find(
        (product) => product.type === 'Hoodie' && product.name === graphicName
      );

      if (!hoodieProduct) {
        throw new Error('Nessuna Hoodie trovata con il nome della grafica specificato.');
      }

      await axios.put(`${API_URL}/product/${hoodieProduct._id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      fetchProducts(paginationProduct.currentPage, paginationProduct.productsPerPage);
      handleClose();
    } catch (err) {
      setError('Errore durante la modifica: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Modifica Hoodie</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {error && <div className="alert alert-danger">{error}</div>}

        <Form>
          {/* Descrizione */}
          <Form.Group className="mb-3">
            <Form.Label>Descrizione</Form.Label>
            <Form.Control
              type="text"
              value={formValues.description || ''}
              onChange={(e) => setFormValues({ ...formValues, description: e.target.value })}
            />
          </Form.Group>

          {/* Prezzo */}
          <Form.Group className="mb-3">
            <Form.Label>Prezzo</Form.Label>
            <Form.Control
              type="number"
              value={formValues.price || ''}
              onChange={(e) => setFormValues({ ...formValues, price: e.target.value })}
            />
          </Form.Group>

          {/* Categoria */}
          <Form.Group className="mb-3">
            <Form.Label>Categoria</Form.Label>
            <Form.Control
              type="text"
              value={formValues.category || ''}
              onChange={(e) => setFormValues({ ...formValues, category: e.target.value })}
            />
          </Form.Group>

          {/* Colori */}
          <Form.Group className="mb-3">
            <Form.Label>Colori</Form.Label>
            <Form.Select onChange={(e) => handleAddColor(e.target.value)}>
              <option value="">Seleziona colore</option>
              {availableColors.map(color => (
                <option key={color} value={color}>{color}</option>
              ))}
            </Form.Select>
            <div className="mt-2">
              {colors.map((color, index) => (
                <span key={index} className="badge bg-primary me-2">
                  {color} <Button variant="danger" size="sm" onClick={() => handleRemoveColor(color)}>x</Button>
                </span>
              ))}
            </div>
          </Form.Group>

          {/* Taglie */}
          <Form.Group className="mb-3">
            <Form.Label>Taglie</Form.Label>
            <Form.Select onChange={(e) => handleAddSize(e.target.value)}>
              <option value="">Seleziona taglia</option>
              {availableSizes.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </Form.Select>
            <div className="mt-2">
              {sizes.map((size, index) => (
                <span key={index} className="badge bg-primary me-2">
                  {size} <Button variant="danger" size="sm" onClick={() => handleRemoveSize(size)}>x</Button>
                </span>
              ))}
            </div>
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
                      alt={`Hoodie ${index}`}
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

export default ModifyHoodie;