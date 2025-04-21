import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';
import { useDesign } from '../context/DesignContext';

/**
 * Componente CloudDesign
 * Form semplice per caricare logo e immagine frontale usando il DesignContext
 */
function CloudDesign() {
  // Stati per controllare il modal
  const [show, setShow] = useState(false);
  
  // Stati per i file selezionati
  const [logoFile, setLogoFile] = useState(null);
  const [frontImageFile, setFrontImageFile] = useState(null);
  
  // Messaggi di feedback locale
  const [localSuccess, setLocalSuccess] = useState('');
  
  // Usa il context per le operazioni
  const { logo, frontImage, loading, error, updateDesignSettings } = useDesign();

  /**
   * Gestisce l'apertura e chiusura del modal
   */
  const handleClose = () => {
    setShow(false);
    setLogoFile(null);
    setFrontImageFile(null);
    setLocalSuccess('');
  };
  
  const handleShow = () => {
    setShow(true);
  };

  /**
   * Gestisce l'upload di entrambe le immagini contemporaneamente
   */
  const uploadBothImages = async () => {
    if (!logoFile && !frontImageFile) {
      // Non serve fare nulla
      return;
    }
    
    const result = await updateDesignSettings(logoFile, frontImageFile);
    
    if (result.success) {
      setLocalSuccess('Impostazioni di design aggiornate con successo!');
      setLogoFile(null);
      setFrontImageFile(null);
    }
  };

  return (
    <>
      <Button variant="primary mt-3" onClick={handleShow}>
        Gestisci Immagini Design
      </Button>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Gestione Immagini Design</Modal.Title>
        </Modal.Header>
        
        <Modal.Body>
          {/* Messaggi di feedback */}
          {error && <Alert variant="danger">{error}</Alert>}
          {localSuccess && <Alert variant="success">{localSuccess}</Alert>}
          
          {/* Form semplice per caricare le immagini */}
          <Form>
            <Row>
              {/* Upload Logo */}
              <Col md={6} className="mb-4">
                <Form.Group controlId="formLogo">
                  <Form.Label><strong>Logo</strong></Form.Label>
                  <Form.Control 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => setLogoFile(e.target.files[0])}
                    className="mb-2"
                  />
                  
                  {/* Anteprima logo attuale */}
                  {logo && (
                    <div>
                      <small className="text-muted d-block mb-1">Logo attuale:</small>
                      <img 
                        src={logo} 
                        alt="Logo attuale" 
                        className="img-thumbnail" 
                        style={{ maxHeight: '80px' }} 
                      />
                    </div>
                  )}
                  
                  {/* Anteprima file selezionato */}
                  {logoFile && (
                    <div className="mt-2">
                      <small className="text-muted d-block mb-1">Anteprima:</small>
                      <img 
                        src={URL.createObjectURL(logoFile)} 
                        alt="Anteprima logo" 
                        className="img-thumbnail" 
                        style={{ maxHeight: '80px' }} 
                      />
                    </div>
                  )}
                </Form.Group>
              </Col>
              
              {/* Upload Immagine Frontale */}
              <Col md={6} className="mb-4">
                <Form.Group controlId="formFrontImage">
                  <Form.Label><strong>Immagine Frontale</strong></Form.Label>
                  <Form.Control 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => setFrontImageFile(e.target.files[0])}
                    className="mb-2"
                  />
                  
                  {/* Anteprima immagine frontale attuale */}
                  {frontImage && (
                    <div>
                      <small className="text-muted d-block mb-1">Immagine frontale attuale:</small>
                      <img 
                        src={frontImage} 
                        alt="Immagine frontale attuale" 
                        className="img-thumbnail" 
                        style={{ maxHeight: '80px' }} 
                      />
                    </div>
                  )}
                  
                  {/* Anteprima file selezionato */}
                  {frontImageFile && (
                    <div className="mt-2">
                      <small className="text-muted d-block mb-1">Anteprima:</small>
                      <img 
                        src={URL.createObjectURL(frontImageFile)} 
                        alt="Anteprima immagine frontale" 
                        className="img-thumbnail" 
                        style={{ maxHeight: '80px' }} 
                      />
                    </div>
                  )}
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Chiudi
          </Button>
          <Button 
            variant="primary" 
            onClick={uploadBothImages}
            disabled={loading || (!logoFile && !frontImageFile)}
          >
            {loading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Caricamento...
              </>
            ) : (
              'Salva Immagini'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default CloudDesign;