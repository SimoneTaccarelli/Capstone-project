import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import axios from 'axios';
import { API_URL } from '../config/config';

const ProductEditModal = ({ show, onHide, product, onSave }) => {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || '',
    category: product?.category || '',
    type: product?.type || '',
    graphic: product?.graphic || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token'); // Recupera il token dal localStorage
      const response = await axios.put(`${API_URL}/product/${product._id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Prodotto aggiornato:', response.data);
      onSave(response.data); // Aggiorna lo stato nella pagina Administrator
      onHide(); // Chiudi il modale
    } catch (error) {
      console.error('Errore durante la modifica del prodotto:', error);
    }
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Modifica Prodotto</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Nome Prodotto</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Descrizione</Form.Label>
            <Form.Control
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Prezzo</Form.Label>
            <Form.Control
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Categoria</Form.Label>
            <Form.Control
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Tipo</Form.Label>
            <Form.Control
              type="text"
              name="type"
              value={formData.type}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Grafica</Form.Label>
            <Form.Control
              type="text"
              name="graphic"
              value={formData.graphic}
              onChange={handleChange}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Chiudi
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Salva
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ProductEditModal;