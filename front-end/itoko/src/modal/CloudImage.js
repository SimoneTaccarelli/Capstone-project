import { useState, useRef } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import axios from 'axios';
import { API_URL } from '../config/config.js';

/**
 * Componente CloudImage
 * Gestisce la selezione e l'upload di immagini multiple da/verso Cloudinary
 * 
 * @param {Function} handleImageChange - Funzione callback per passare le immagini selezionate al genitore
 */
function CloudImage({ handleImageChange }) {
  // Stati per controllare il modal
  const [show, setShow] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]); // ✅ Array invece di oggetto singolo
  const [files, setFiles] = useState([]);
  
  // Stati per gestire caricamento e errori
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  // Stati e ref per la funzionalità drag and drop
  const [isDragging, setIsDragging] = useState(false);
  const dropAreaRef = useRef(null);

  /**
   * Gestisce l'apertura e chiusura del modal
   */
  const handleClose = () => setShow(false);
  const handleShow = () => {
    setShow(true);
    fetchImages(); // Carica le immagini quando il modal si apre
  };

  /**
   * Passa le immagini selezionate al componente genitore
   */
  const handleSelectImages = () => {
    handleImageChange(selectedFiles); // ✅ Passa array di file al genitore
    handleClose();
  }

  /**
   * Recupera le immagini esistenti da Cloudinary
   */
  const fetchImages = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/file/product`);
      
      if (response.data && response.data.data) {
        setFiles(response.data.data);
      } else {
        setFiles([]);
      }
    } catch (error) {
      setError('Impossibile recuperare le immagini. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Carica un nuovo file su Cloudinary
   * @param {File} file - File da caricare
   */
  const uploadFile = async (file) => {
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setUploading(true);
    setError(null);
    
    try {
      const response = await axios.post(`${API_URL}/file/upload/product`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data && response.data.success) {
        const newFile = response.data.data;
        setFiles(prev => [newFile, ...prev]);
        
        // ✅ Aggiungi il nuovo file alla selezione corrente
        setSelectedFiles(prev => [...prev, newFile]);
      }
    } catch (error) {
      setError('Errore durante il caricamento dell\'immagine.');
    } finally {
      setUploading(false);
    }
  };

  /**
   * Gestisce l'upload da input file standard
   */
  const handleFileUpload = (e) => {
    // ✅ Supporta upload multiplo
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      files.forEach(file => uploadFile(file));
    }
  };

  /**
   * Gestisce l'evento di trascinamento (drag over) 
   */
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  /**
   * Gestisce l'uscita dal trascinamento (drag leave)
   */
  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  /**
   * Gestisce il rilascio del file trascinato (drop)
   */
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      files.forEach(file => uploadFile(file));
    }
  };

  /**
   * Gestisce la selezione/deselezione delle immagini
   */
  const handleImageClick = (file) => {
    // ✅ Toggle selezione: aggiunge o rimuove dalla selezione
    if (selectedFiles.some(f => f.id === file.id)) {
      setSelectedFiles(prev => prev.filter(f => f.id !== file.id));
    } else {
      setSelectedFiles(prev => [...prev, file]);
    }
  };

  return (
    <>
      <Button variant="primary" onClick={handleShow}>
        Seleziona Immagini
      </Button>

      <Modal show={show} onHide={handleClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Seleziona Immagini Prodotto</Modal.Title>
        </Modal.Header>
        
        <Modal.Body>
          {/* Visualizzazione errori */}
          {error && <div className="alert alert-danger">{error}</div>}
          
          {/* Area drag and drop */}
          <div 
            ref={dropAreaRef}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`drop-area mb-4 p-4 text-center border rounded ${isDragging ? 'border-primary bg-light' : 'border-dashed'}`}
            style={{ 
              cursor: 'pointer',
              transition: 'all 0.3s',
              borderStyle: isDragging ? 'solid' : 'dashed'
            }}
          >
            <div className="mb-3">
              <i className="bi bi-cloud-arrow-up" style={{ fontSize: '2rem' }}></i>
              <h5>Trascina immagini qui</h5>
              <p className="text-muted">oppure</p>
              
              {/* Input file supporta selezione multipla */}
              <Form.Group controlId="formFile">
                <Form.Label className="btn btn-outline-secondary">
                  Seleziona immagini
                  <Form.Control 
                    type="file" 
                    accept="image/*" 
                    multiple // ✅ Attributo per selezione multipla
                    onChange={handleFileUpload}
                    disabled={uploading}
                    style={{ display: 'none' }}
                  />
                </Form.Label>
              </Form.Group>
            </div>
            
            {/* Indicatore di caricamento */}
            {uploading && (
              <div className="text-center mt-3">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Caricamento...</span>
                </div>
                <p className="mt-2">Caricamento in corso...</p>
              </div>
            )}
          </div>
          
          {/* Galleria immagini esistenti */}
          <h5 className="mb-3">Immagini disponibili</h5>
          <div className="row" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {loading && <p className="text-center">Caricamento immagini...</p>}
            
            {/* Rendering della lista di immagini */}
            {files.map((file, index) => (
              <div className="col-md-3 mb-3" key={index}>
                <div 
                  className={`card ${selectedFiles.some(f => f.id === file.id) ? 'border-primary' : ''}`} 
                  onClick={() => handleImageClick(file)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* ✅ Badge per indicare la selezione */}
                  {selectedFiles.some(f => f.id === file.id) && (
                    <div className="position-absolute top-0 end-0 m-2 badge bg-primary">
                      <i className="bi bi-check-circle-fill"></i>
                    </div>
                  )}
                  <img 
                    src={file.url} 
                    className="card-img-top" 
                    alt={file.name}
                    style={{ height: '100px', objectFit: 'cover' }}
                  />
                  <div className="card-body p-2">
                    <p className="card-text small text-truncate">{file.name}</p>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Messaggio se non ci sono immagini */}
            {files.length === 0 && !loading && (
              <p className="text-center col-12">Nessuna immagine trovata. Carica una nuova!</p>
            )}
          </div>
        </Modal.Body>
        
        <Modal.Footer>
          {/* Mostra contatore di immagini selezionate */}
          {selectedFiles.length > 0 && (
            <span className="me-auto">
              {selectedFiles.length} immagini selezionate
            </span>
          )}
          <Button variant="secondary" onClick={handleClose}>
            Annulla
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSelectImages} // ✅ Usa la nuova funzione
            disabled={selectedFiles.length === 0} // ✅ Disabilitato se nessuna immagine selezionata
          >
            Conferma Selezione
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default CloudImage;