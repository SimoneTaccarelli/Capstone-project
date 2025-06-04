import React, { useState } from 'react';
import { Table, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../context/ProductContext';
import { API_URL } from '../config/config';
import '../styles/Administrator.css'; // Importa il file CSS per lo stile della pagina

const Administrator = () => {
  const { currentUser } = useAuth(); // Recupera l'utente corrente
  const { paginationGraphic, fetchGraphics } = useProducts(); // Importa le grafiche dal contesto
  const [selectedGraphic, setSelectedGraphic] = useState(null); // Stato per la grafica selezionata

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

  return (
    <>
      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Gestione Grafiche</h2>
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
                    <Button variant="danger" onClick={() => handleDeleteGraphic(graphic._id)}>
                      Cancella
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
    </>
  );
};

export default Administrator;