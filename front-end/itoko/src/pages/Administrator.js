import React, { useState } from 'react';
import { Table, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../context/ProductContext';
import ProductEditModal from '../components/ProductEditModal';
import { API_URL } from '../config/config';
import '../styles/Administrator.css'; // Importa il file CSS per lo stile della pagina

const Administrator = () => {
  const { currentUser } = useAuth(); // Recupera l'utente corrente
  console.log('Utente corrente:', currentUser);
  const { paginationProduct, paginationGraphic, fetchProducts, fetchGraphics } = useProducts(); // Importa i dati e le funzioni dal contesto
  const [selectedProduct, setSelectedProduct] = useState(null); // Stato per il prodotto selezionato
  const [showModal, setShowModal] = useState(false);

  const handleDelete = async (productId, graphicId) => {
    try {
      const token = await currentUser.getIdToken(); // Recupera il token dell'utente corrente
      console.log('Token:', token); // Log del token
      if (!token) {
        console.error('Token non trovato. Impossibile cancellare il prodotto e la grafica.');
        return;
      }

      // Cancella il prodotto
      await axios.delete(`${API_URL}/product/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(`Prodotto con ID ${productId} eliminato`);

      // Cancella la grafica associata
      if (graphicId) {
        await axios.delete(`${API_URL}/graphic/${graphicId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log(`Grafica con ID ${graphicId} eliminata`);
      }

      // Aggiorna i dati dei prodotti e delle grafiche
      fetchProducts(paginationProduct.currentPage, paginationProduct.productsPerPage);
      fetchGraphics(paginationGraphic.currentPage, paginationGraphic.graphicsPerPage);
    } catch (error) {
      console.error('Errore durante la cancellazione del prodotto o della grafica:', error);
    }
  };

  const handleEdit = (product) => {
    setSelectedProduct(product); // Imposta il prodotto selezionato per il modale
    setShowModal(true);
  };

  const handleSave = async (updatedData) => {
    try {
      const token = await currentUser.getIdToken(); // Recupera il token dal currentUser
      const response = await axios.put(`${API_URL}/product/${updatedData._id}`, updatedData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Prodotto aggiornato:', response.data);

      // Aggiorna i dati dei prodotti
      fetchProducts(paginationProduct.currentPage, paginationProduct.productsPerPage);
      setShowModal(false); // Chiudi il modale
    } catch (error) {
      console.error('Errore durante la modifica del prodotto:', error);
    }
  };

  console.log('Prodotti:', paginationProduct.products);
  console.log('Grafiche:', paginationGraphic.graphics);

  return (
    <>
      <div className='container'>
        <div className="row align-items-start mt-4 mb-4">
          {/* Colonna di sinistra */}
          <div className="col-md-6">
            <div className="mb-4">
              <h1>Totale ordini</h1>
              <Link to="/order-admin" className="btn btn-primary">
                Gestione Ordini
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Gestione Prodotti e Grafiche</h2>
          <div>
            <Link to="/Creategraphic" className="btn btn-secondary me-2">
              <i className="bi bi-plus-circle me-2"></i> Nuova Grafica
            </Link>
            <Link to="/Createproduct" className="btn btn-primary">
              <i className="bi bi-plus-circle me-2"></i> Nuovo Prodotto
            </Link>
          </div>
        </div>
        <Table className="custom-table">
          <thead>
            <tr>
              <th>Immagine</th>
              <th>Nome Prodotto</th>
              <th>Nome Grafica</th>
              <th>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {paginationProduct.products && paginationProduct.products.length > 0 ? (
              paginationProduct.products.map((product) => {
                const associatedGraphic = product.graphic; // Usa il campo graphic popolato
                return (
                  <tr key={product._id}>
                    <td>
                      <img
                        src={product.imageUrl[0]} // Mostra la prima immagine del prodotto
                        alt={product.name}
                        className="product-image"
                      />
                    </td>
                    <td>{product.name}</td>
                    <td>{associatedGraphic ? associatedGraphic.name : 'Nessuna grafica associata'}</td>
                    <td>
                      <Button variant="warning" onClick={() => handleEdit(product)}>
                        Modifica
                      </Button>{' '}
                      <Button variant="danger" onClick={() => handleDelete(product._id, associatedGraphic ? associatedGraphic._id : null)}>
                        Cancella
                      </Button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="4">Nessun prodotto disponibile</td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      <ProductEditModal
        show={showModal}
        onHide={() => setShowModal(false)}
        product={selectedProduct}
        onSave={handleSave}
      />
    </>
  );
};

export default Administrator;