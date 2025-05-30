import React from 'react';
import { Button } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Administrator = () => {
  const { admin } = useAuth(); // Importa admin dal contesto

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
          <h2>Gestione Prodotti</h2>
          <div>
            <Link to="/Creategraphic" className="btn btn-secondary me-2">
              <i className="bi bi-plus-circle me-2"></i> Nuova Grafica
            </Link>
            <Link to="/Createproduct" className="btn btn-primary">
              <i className="bi bi-plus-circle me-2"></i> Nuovo Prodotto
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Administrator;