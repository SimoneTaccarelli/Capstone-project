import React, { useState } from 'react';
import { Table, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../context/ProductContext';
import { API_URL } from '../config/config';
import ModifyGraphic from '../modal/ModifyGraphic'; // Importa il modale per modificare la grafica
import '../styles/Administrator.css'; // Importa il file CSS per lo stile della pagina
import ModifyHoodie from '../modal/ModifyHoodie';
import ModifyTshirt from '../modal/ModifyTshirt'; // Importa il modale per modificare la maglietta


const Administrator = () => {
  const { currentUser } = useAuth(); // Recupera l'utente corrente
  const { paginationGraphic, fetchProducts } = useProducts(); // Sostituito fetchGraphics con fetchProducts
  const [selectedGraphic, setSelectedGraphic] = useState(null); // Stato per la grafica selezionata
  const [showModifyGraphicModal, setShowModifyGraphicModal] = useState(false); // Stato per il modale

  const [selectedTshirt, setSelectedTshirt] = useState(null); // Stato per la maglietta selezionata
  const [showModifyTshirtModal, setShowModifyTshirtModal] = useState(false); // Stato per il modale della maglietta
  const [selectedHoodie, setSelectedHoodie] = useState(null); // Stato per la felpa con cappuccio selezionata
  const [showModifyHoodieModal, setShowModifyHoodieModal] = useState(false); // Stato per il modale della felpa con cappuccio

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

      // Aggiorna i dati dei prodotti
      fetchProducts(paginationGraphic.currentPage, paginationGraphic.graphicsPerPage); // Sostituito fetchGraphics con fetchProducts
    } catch (error) {
      console.error('Errore durante la cancellazione della grafica:', error);
    }
  };

  const handleModifyGraphic = (graphic) => {
    setSelectedGraphic(graphic); // Passa la grafica selezionata
    setShowModifyGraphicModal(true); // Mostra il modale
  };

  const handleCloseModifyGraphicModal = () => {
    setSelectedGraphic(null); // Resetta la grafica selezionata
    setShowModifyGraphicModal(false); // Chiudi il modale
    fetchProducts(paginationGraphic.currentPage, paginationGraphic.graphicsPerPage); // Sostituito fetchGraphics con fetchProducts
  };

  const handleModifyTshirt = (graphicName) => {
    setSelectedTshirt(graphicName); // Passa il nome della grafica per la maglietta
    setShowModifyTshirtModal(true); // Mostra il modale per la maglietta
  };

  const handleCloseModifyTshirtModal = () => {
    setSelectedTshirt(null); // Resetta la maglietta selezionata
    setShowModifyTshirtModal(false); // Chiudi il modale per la maglietta
  };

  const handleModifyHoodie = (graphicName) => {
    setSelectedHoodie(graphicName); // Passa il nome della grafica per la felpa con cappuccio
    setShowModifyHoodieModal(true); // Mostra il modale per la felpa con cappuccio
  };

  const handleCloseModifyHoodieModal = () => {
    setSelectedHoodie(null); // Resetta la felpa con cappuccio selezionata
    setShowModifyHoodieModal(false); // Chiudi il modale per la felpa con cappuccio
  };

  return (
    <>
      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Gestione Grafiche</h2>
          <div>
            <Link to="/Creategraphic" className="btn btn-secondary btn-sm me-2">
              <i className="bi bi-plus-circle me-2"></i> Nuova Grafica
            </Link>
            <Link to="/Createproduct" className="btn btn-primary btn-sm">
              <i className="bi bi-plus-circle me-2"></i> Crea Prodotto
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
                    <div className="d-flex flex-column">
                      <Button variant="danger" onClick={() => handleDeleteGraphic(graphic._id)} className="mb-2 btn-sm">
                        Cancella
                      </Button>
                      <Button variant="warning" onClick={() => handleModifyGraphic(graphic)} className="mb-2 btn-sm">
                        Modifica Grafica
                      </Button>
                      <Button variant="info" onClick={() => handleModifyTshirt(graphic.name)} className="mb-2 btn-sm">
                        Modifica T-shirt
                      </Button>
                      <Button variant="primary" onClick={() => handleModifyHoodie(graphic.name)} className="btn-sm">
                        Modifica Hoodie
                      </Button>
                    </div>
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

      {/* Modale per modificare la grafica */}
      {selectedGraphic && (
        <ModifyGraphic
          graphic={selectedGraphic}
          show={showModifyGraphicModal}
          handleClose={handleCloseModifyGraphicModal}
        />
      )}

      {/* Modale per modificare la T-shirt */}
      {selectedTshirt && (
        <ModifyTshirt
          graphicName={selectedTshirt}
          show={showModifyTshirtModal}
          handleClose={handleCloseModifyTshirtModal}
        />
      )}

      {/* Modale per modificare la Hoodie */}
      {selectedHoodie && (
        <ModifyHoodie
          graphicName={selectedHoodie}
          show={showModifyHoodieModal}
          handleClose={handleCloseModifyHoodieModal}
        />
      )}
    </>
  );
};

export default Administrator;