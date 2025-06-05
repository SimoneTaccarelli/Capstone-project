import React, { useState } from 'react';
import { Table, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../context/ProductContext';
import { API_URL } from '../config/config';
import ModifyProduct from '../modal/ModifyProduct'; // Importa il modale per modificare i prodotti
import '../styles/Administrator.css'; // Importa il file CSS per lo stile della pagina

const Administrator = () => {
  const { currentUser } = useAuth(); // Recupera l'utente corrente
  const { paginationGraphic, fetchGraphics, fetchProducts, paginationProduct } = useProducts(); // Importa le grafiche e i prodotti dal contesto
  const [selectedGraphic, setSelectedGraphic] = useState(null); // Stato per la grafica selezionata
  const [selectedProduct, setSelectedProduct] = useState(null); // Stato per il prodotto selezionato
  const [showModifyProductModal, setShowModifyProductModal] = useState(false); // Stato per il modale

  const handleDeleteGraphic = async (graphicId) => {
    try {
      const token = await currentUser.getIdToken(); // Recupera il token dell'utente corrente
      if (!token) {
        console.error('Token non trovato. Impossibile cancellare la grafica.');
        return;
      }

      // Cancella la grafica
      await axios.delete(`${API_URL}/graphic/${graphicId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(`Grafica con ID ${graphicId} eliminata`);

      // Aggiorna i dati delle grafiche
      fetchGraphics(paginationGraphic.currentPage, paginationGraphic.graphicsPerPage);
    } catch (error) {
      console.error('Errore durante la cancellazione della grafica:', error);
    }
  };

  const handleModifyProduct = (graphic) => {
    setSelectedGraphic(graphic); // Passa solo la grafica
    setShowModifyProductModal(true);
  };

  const handleCloseModifyProductModal = () => {
    setSelectedProduct(null);
    setShowModifyProductModal(false);
    fetchProducts(); // Aggiorna la lista dei prodotti dopo la modifica
  };

  return (
    <>
      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Gestione Grafiche e Prodotti</h2>
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
              <th>Nome Grafica</th>
              <th>Tag</th>
              <th>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {paginationGraphic.graphics && paginationGraphic.graphics.length > 0 ? (
              paginationGraphic.graphics.map((graphic) => (
                <tr key={graphic._id}>
                  <td>
                    <img
                      src={graphic.imageUrl[0]} // Mostra la prima immagine della grafica
                      alt={graphic.name}
                      className="graphic-image"
                      style={{ width: '70px', height: 'auto' }} // Imposta una larghezza fissa per le immagini
                    />
                  </td>
                  <td>{graphic.name}</td>
                  <td>{graphic.tags.join(', ')}</td>
                  <td>
                    <Button variant="danger" onClick={() => handleDeleteGraphic(graphic._id)} className="me-2">
                      Cancella
                    </Button>
                    <Button variant="warning" onClick={() => handleModifyProduct(graphic)}>
                      Modifica
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4">Nessuna grafica disponibile</td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      {/* Modale per modificare il prodotto */}
      {selectedGraphic && (
        <ModifyProduct
          graphic={selectedGraphic}
          type="graphic" // Specifica il tipo di entità
          show={showModifyProductModal}
          handleClose={handleCloseModifyProductModal}
        />
      )}
    </>
  );
};

export default Administrator;