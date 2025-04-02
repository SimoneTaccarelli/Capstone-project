import { useState, useRef } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import axios from 'axios';
import { API_URL } from '../config/config.js';

function CreateProduct() {
  const [show, setShow] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dropAreaRef = useRef(null);

  const handleClose = () => setShow(false);
  const handleShow = () => {
    setShow(true);
    fetchImages();
  };

  // Funzione per recuperare le immagini da Cloudinary
  const fetchImages = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/file`);
      
      if (response.data && response.data.data) {
        setFiles(response.data.data);
      } else {
        setFiles([]);
      }
    } catch (error) {
      console.error('Error fetching images:', error);
      setError('Impossibile recuperare le immagini. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  };

  // Gestisce l'upload di un file, sia da input che da drag-n-drop
  const uploadFile = async (file) => {
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setUploading(true);
    setError(null);
    
    try {
      const response = await axios.post(`${API_URL}/file/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data && response.data.success) {
        const newFile = response.data.data;
        setFiles(prev => [newFile, ...prev]);
        setSelectedFile(newFile);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setError('Errore durante il caricamento dell\'immagine.');
    } finally {
      setUploading(false);
    }
  };

  // Gestisce l'upload da input file
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      uploadFile(file);
    }
  };

  // Gestisce eventi drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      uploadFile(file);
    }
  };

  // Seleziona l'immagine cliccata
  const handleImageClick = (file) => {
    setSelectedFile(file);
  };

  return (
    <>
      <Button variant="primary" onClick={handleShow}>
      insert image
      </Button>

      <Modal show={show} onHide={handleClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Select Product Image</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <div className="alert alert-danger">{error}</div>}
          
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
              <h5>Trascina un'immagine qui</h5>
              <p className="text-muted">oppure</p>
              
              <Form.Group controlId="formFile">
                <Form.Label className="btn btn-outline-secondary">
                  Seleziona un'immagine
                  <Form.Control 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileUpload}
                    disabled={uploading}
                    style={{ display: 'none' }}
                  />
                </Form.Label>
              </Form.Group>
            </div>
            {uploading && (
              <div className="text-center mt-3">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Caricamento...</span>
                </div>
                <p className="mt-2">Caricamento in corso...</p>
              </div>
            )}
          </div>
          
          <h5 className="mb-3">Immagini disponibili</h5>
          <div className="row" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {loading && <p className="text-center">Loading images...</p>}
            
            {files.map((file, index) => (
              <div className="col-md-3 mb-3" key={index}>
                <div 
                  className={`card ${selectedFile?.id === file.id ? 'border-primary' : ''}`} 
                  onClick={() => handleImageClick(file)}
                  style={{ cursor: 'pointer' }}
                >
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
            
            {files.length === 0 && !loading && (
              <p className="text-center col-12">No images found. Upload a new one!</p>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={() => {
              // Qui puoi gestire la selezione dell'immagine
              console.log("Selected image:", selectedFile);
              handleClose();
            }}
            disabled={!selectedFile}
          >
            Select Image
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default CreateProduct;