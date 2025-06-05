import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../context/ProductContext';
import axios from 'axios';
import { API_URL } from '../config/config'; // Assicurati di avere il percorso corretto per il tuo file di configurazione

const ModifyProduct = ({ graphic, show, handleClose, type }) => {
  const [formValues, setFormValues] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { currentUser } = useAuth();
  const { paginationProduct } = useProducts(); // Recupera i prodotti dal contesto

  const [currentImages, setCurrentImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);
  const [associatedProducts, setAssociatedProducts] = useState([]);

  // Filtra il prodotto associato alla grafica
  useEffect(() => {
    if (type === "product") {
      console.log('Graphic ID:', graphic ? graphic._id : 'Nessun ID grafica');
      console.log('Pagination Product Data:', paginationProduct.products);

      if (graphic && paginationProduct.products && paginationProduct.products.length > 0) {
        const filteredProducts = paginationProduct.products.filter(product => {
          return product.graphic === graphic._id || product.graphic?._id === graphic._id;
        });

        if (filteredProducts.length > 0) {
          const product = filteredProducts[0];
          setFormValues({
            name: product.name || '',
            price: product.price || 0,
            description: product.description || '',
            category: product.category || '',
            type: product.type || '',
            color: product.color || [],
            size: product.size || [],
            graphic: product.graphic || '',
          });
          setCurrentImages(product.imageUrl || []);
        } else {
          setError('Nessun prodotto associato alla grafica selezionata.');
        }
      } else {
        setError('Errore: prodotti non disponibili o grafica non valida.');
      }
    } else if (type === "graphic") {
      // Gestisci la modifica delle grafiche
      if (graphic && paginationProduct.products && paginationProduct.products.length > 0) {
        const filteredProducts = paginationProduct.products.filter(product => {
          return product.graphic === graphic._id || product.graphic?._id === graphic._id;
        });

        setAssociatedProducts(filteredProducts);

        setFormValues({
          name: graphic.name || '',
          tags: graphic.tags || [], // Inizializza come array vuoto se non definito
          imageUrl: graphic.imageUrl || [],
        });
        setCurrentImages(graphic.imageUrl || []);
      } else {
        setError('Errore: prodotti non disponibili o grafica non valida.');
      }
    }
  }, [graphic, paginationProduct.products, type]);

  // Gestione eliminazione immagine esistente
  const handleImageDelete = (imageUrl) => {
    setCurrentImages(currentImages.filter(img => img !== imageUrl));
    setImagesToDelete([...imagesToDelete, imageUrl]);
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

  // Gestione modifica prodotto
  const handleSaveChanges = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = await currentUser.getIdToken();

      if (type === "graphic") {
        const updatedGraphic = {
          name: formValues.name,
          tags: formValues.tags,
          imageUrl: currentImages,
        };

        await axios.put(`${API_URL}/graphic/${graphic._id}`, updatedGraphic, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }

      if (associatedProducts.length > 0) {
        for (const product of associatedProducts) {
          const formData = new FormData();
          formData.append('name', product.name);
          formData.append('price', product.price.toString());
          formData.append('description', product.description);
          formData.append('category', product.category);
          formData.append('type', product.type);
          formData.append('color', JSON.stringify(product.color));
          formData.append('size', JSON.stringify(product.size));
          formData.append('graphic', product.graphic);
          formData.append('existingImages', JSON.stringify(product.imageUrl));

          if (product.newImages) {
            product.newImages.forEach(file => {
              formData.append('images', file);
            });
          }

          await axios.put(`${API_URL}/product/${product._id}`, formData, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          });
        }
      }

      handleClose();
    } catch (err) {
      setError('Errore durante la modifica: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleColorChange = (e) => {
    const selectedColor = e.target.value;
    if (!formValues.color.includes(selectedColor)) {
      setFormValues({ ...formValues, color: [...formValues.color, selectedColor] });
    }
  };

  const removeColor = (color) => {
    setFormValues({ ...formValues, color: formValues.color.filter(c => c !== color) });
  };

  const handleSizeChange = (e) => {
    const selectedSize = e.target.value;
    if (!formValues.size.includes(selectedSize)) {
      setFormValues({ ...formValues, size: [...formValues.size, selectedSize] });
    }
  };

  const removeSize = (size) => {
    setFormValues({ ...formValues, size: formValues.size.filter(s => s !== size) });
  };

  console.log('FormValues:', formValues);
  console.log('Graphic ID:', graphic ? graphic._id : 'Nessun ID grafica');
  console.log('Tags:', formValues.tags);

  if (loading) return <div className="d-flex justify-content-center"><div className="spinner-border text-primary"></div></div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  const handleDeleteProductImage = (productIndex, imageUrl) => {
    const updatedProducts = [...associatedProducts];
    updatedProducts[productIndex].imageUrl = updatedProducts[productIndex].imageUrl.filter(img => img !== imageUrl);
    setAssociatedProducts(updatedProducts);
  };

  const handleAddProductImages = (productIndex, event) => {
    const files = Array.from(event.target.files);
    const updatedProducts = [...associatedProducts];

    if (!updatedProducts[productIndex].newImages) {
      updatedProducts[productIndex].newImages = [];
    }

    updatedProducts[productIndex].newImages = [...updatedProducts[productIndex].newImages, ...files];
    setAssociatedProducts(updatedProducts);
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Modifica Prodotto</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {error && <div className="alert alert-danger">{error}</div>}

        <Form>
          {/* Campi del prodotto */}
          <Form.Group className="mb-3">
            <Form.Label>Nome</Form.Label>
            <Form.Control 
              type="text" 
              value={formValues.name || ''} 
              onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Prezzo</Form.Label>
            <Form.Control 
              type="number" 
              value={formValues.price || ''} 
              onChange={(e) => setFormValues({ ...formValues, price: parseFloat(e.target.value) })}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Descrizione</Form.Label>
            <Form.Control 
              as="textarea" 
              rows={3} 
              value={formValues.description || ''} 
              onChange={(e) => setFormValues({ ...formValues, description: e.target.value })}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Categoria</Form.Label>
            <Form.Control 
              type="text" 
              value={formValues.category || ''} 
              onChange={(e) => setFormValues({ ...formValues, category: e.target.value })}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Tipo di Prodotto</Form.Label>
            <Form.Select 
              value={formValues.type || ''} 
              onChange={(e) => setFormValues({ ...formValues, type: e.target.value })}
            >
              <option value="">Seleziona tipo</option>
              <option value="T-shirt">T-shirt</option>
              <option value="Hoodie">Hoodie</option>
            </Form.Select>
          </Form.Group>

          {/* Campi per colori e taglie */}
          <Form.Group className="mb-3">
            <Form.Label>Colori</Form.Label>
            <Form.Select onChange={handleColorChange}>
              <option value="">Seleziona colore</option>
              {["Black", "Water Blue", "Beige", "Light Gray", "Light Purple", "Orange", "Rose Red", "Red", "Light Blue", "Light Brown", "Blue Jeans", "Dark Blue", "Purple Haze", "Dark Green", "Gray Green", "Pirate Gray"].map(color => (
                <option key={color} value={color}>{color}</option>
              ))}
            </Form.Select>
            <div className="mt-2">
              {formValues.color && formValues.color.length > 0 ? (
                formValues.color.map(color => (
                  <span key={color} className="badge bg-primary me-2">
                    {color} <Button variant="danger" size="sm" onClick={() => removeColor(color)}>x</Button>
                  </span>
                ))
              ) : (
                <p className="text-muted">Nessun colore selezionato</p>
              )}
            </div>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Taglie</Form.Label>
            <Form.Select onChange={handleSizeChange}>
              <option value="">Seleziona taglia</option>
              {["S", "M", "L", "XL", "XXL"].map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </Form.Select>
            <div className="mt-2">
              {formValues.size && formValues.size.length > 0 ? (
                formValues.size.map(size => (
                  <span key={size} className="badge bg-primary me-2">
                    {size} <Button variant="danger" size="sm" onClick={() => removeSize(size)}>x</Button>
                  </span>
                ))
              ) : (
                <p className="text-muted">Nessuna taglia selezionata</p>
              )}
            </div>
          </Form.Group>

          {/* Gestione immagini */}
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

          {type === "graphic" && (
            <>
              <Form.Group className="mb-3">
                <Form.Label>Nome Grafica</Form.Label>
                <Form.Control
                  type="text"
                  value={formValues.name || ''}
                  onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Tag</Form.Label>
                <Form.Control
                  type="text"
                  value={formValues.tags ? formValues.tags.join(', ') : ''} // Usa un valore predefinito
                  onChange={(e) => setFormValues({ ...formValues, tags: e.target.value.split(', ') })}
                />
              </Form.Group>
            </>
          )}

          {associatedProducts.length > 0 ? (
            associatedProducts.map((product, index) => (
              <div key={product._id} className="mb-4">
                <h5>Prodotto {index + 1}: {product.type}</h5>

                {/* Immagini attuali del prodotto */}
                <Form.Group className="mb-3">
                  <Form.Label>Immagini attuali</Form.Label>
                  <div className="d-flex flex-wrap gap-2 mb-3">
                    {product.imageUrl && product.imageUrl.length > 0 ? (
                      product.imageUrl.map((img, imgIndex) => (
                        <div key={imgIndex} className="position-relative" style={{ width: '100px' }}>
                          <img
                            src={img}
                            alt={`Prodotto ${index} - Immagine ${imgIndex}`}
                            className="img-thumbnail"
                            style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                          />
                          <Button
                            variant="danger"
                            size="sm"
                            className="position-absolute top-0 end-0"
                            onClick={() => handleDeleteProductImage(index, img)}
                          >
                            <i className="bi bi-x"></i>
                          </Button>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted">Nessuna immagine disponibile</p>
                    )}
                  </div>
                </Form.Group>

                {/* Aggiungi nuove immagini */}
                <Form.Group className="mb-3">
                  <Form.Label>Aggiungi nuove immagini</Form.Label>
                  <Form.Control
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleAddProductImages(index, e)}
                  />
                </Form.Group>
              </div>
            ))
          ) : (
            <p className="text-muted">Nessun prodotto associato alla grafica selezionata.</p>
          )}
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