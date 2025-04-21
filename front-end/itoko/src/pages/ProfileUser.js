import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import { Button, Form, Container, Row, Col, Image, Card, Spinner } from 'react-bootstrap';

const ProfileUser = () => {
  const { userData, updateUserProfile, deleteUserAccount } = useAuth();
  
  const [newAvatar, setNewAvatar] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [newName, setNewName] = useState(userData?.firstName || '');
  const [newSurname, setNewSurname] = useState(userData?.lastName || '');
  
  // Stati per indicare lo stato di caricamento
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [nameLoading, setNameLoading] = useState(false);
  
  // Indicatori di successo
  const [avatarSuccess, setAvatarSuccess] = useState(false);
  const [nameSuccess, setNameSuccess] = useState(false);
  
  // Eventuali errori
  const [avatarError, setAvatarError] = useState('');
  const [nameError, setNameError] = useState('');

  // Aggiorna i valori dei campi quando userData cambia
  useEffect(() => {
    if (userData) {
      setNewName(userData.firstName || '');
      setNewSurname(userData.lastName || '');
    }
  }, [userData]);

  useEffect(() => {
    // Ascolta eventi di aggiornamento avatar
    const handleAvatarUpdate = () => {
      // Forza aggiornamento se l'avatar è stato modificato altrove
      if (userData?.profilePic) {
        // Reset stati locali per mostrare l'immagine aggiornata dal server
        setPreviewUrl(null);
        setNewAvatar(null);
      }
    };
    
    window.addEventListener('avatarUpdated', handleAvatarUpdate);
    
    return () => {
      window.removeEventListener('avatarUpdated', handleAvatarUpdate);
    };
  }, [userData]);

  // Gestisci la selezione dell'immagine e crea l'anteprima
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Verifica dimensione (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setAvatarError('L\'immagine è troppo grande. Dimensione massima: 2MB');
        return;
      }
      
      // Verifica tipo di file (solo immagini)
      if (!file.type.match('image.*')) {
        setAvatarError('Seleziona un\'immagine valida');
        return;
      }
      
      setNewAvatar(file);
      
      // Crea un'anteprima dell'immagine
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
      
      setAvatarError('');
      setAvatarSuccess(false);
    }
  };

  const handleNameChange = (e) => {
    setNewName(e.target.value);
    setNameError('');
    setNameSuccess(false);
  };

  const handleSurnameChange = (e) => {
    setNewSurname(e.target.value);
    setNameError('');
    setNameSuccess(false);
  };

  // Gestione aggiornamento avatar
  const handleSubmitAvatar = async () => {
    if (!newAvatar) return;
    
    setAvatarLoading(true);
    setAvatarError('');
    setAvatarSuccess(false);
    
    try {
      // Usa la funzione unificata passando solo l'imageFile
      const result = await updateUserProfile({ imageFile: newAvatar });
      
      if (result && result.success) {
        setAvatarSuccess(true);
        console.log("Immagine caricata con successo:", result);
        
        // Pulizia dell'anteprima dopo il caricamento
        setTimeout(() => {
          setNewAvatar(null);
          setPreviewUrl(null);
        }, 2000);
        
        // Forza aggiornamento dell'immagine in tutta l'app
        window.dispatchEvent(new Event('avatarUpdated'));
      } else {
        setAvatarError(`Errore: ${result?.error || 'Si è verificato un errore durante il caricamento'}`);
      }
    } catch (error) {
      console.error("Errore durante il caricamento dell'avatar:", error);
      setAvatarError(`Errore: ${error.message || 'Si è verificato un errore durante il caricamento'}`);
    } finally {
      setAvatarLoading(false);
    }
  };

  // Gestione aggiornamento nome e cognome
  const handleSubmitNameAndSurname = async () => {
    setNameLoading(true);
    setNameError('');
    
    try {
      // Usa la funzione unificata passando firstName e lastName
      const result = await updateUserProfile({ 
        firstName: newName, 
        lastName: newSurname 
      });
      
      if (result && result.success) {
        setNameSuccess(true);
      } else {
        setNameError(`Errore: ${result?.error || 'Si è verificato un errore durante l\'aggiornamento'}`);
      }
    } catch (error) {
      setNameError(`Errore: ${error.message}`);
    } finally {
      setNameLoading(false);
    }
  };

  // Funzione per eliminare l'account
  const handleDeleteAccount = async () => {
    if (window.confirm('Sei sicuro di voler eliminare definitivamente il tuo account?')) {
      try {
        await deleteUserAccount();
      } catch (error) {
        alert(`Errore durante l'eliminazione dell'account: ${error.message}`);
      }
    }
  };

  return (
    <Container className="my-5">
      <h1 className="mb-4">Il tuo profilo</h1>
      
      <Row>
        <Col md={4}>
          <Card className="mb-4">
            <Card.Body className="text-center">
              {/* Mostra l'anteprima se disponibile, altrimenti l'immagine attuale */}
              <Image 
                src={previewUrl || (userData?.profilePic ? `${userData.profilePic}?t=${new Date().getTime()}` : 'https://via.placeholder.com/150')} 
                roundedCircle 
                width="150" 
                height="150" 
                className="mb-3"
                style={{ objectFit: 'cover' }}
              />
              
              <Form.Group className="mb-3">
                <Form.Label>Cambia immagine profilo</Form.Label>
                <Form.Control 
                  type="file" 
                  accept="image/*"
                  onChange={handleAvatarChange}
                  isInvalid={!!avatarError}
                />
                {avatarError && <div className="text-danger small mt-1">{avatarError}</div>}
                {avatarSuccess && <div className="text-success small mt-1">Immagine aggiornata!</div>}
              </Form.Group>
              
              <Button 
                variant="primary" 
                onClick={handleSubmitAvatar}
                disabled={!newAvatar || avatarLoading}
                className="w-100"
              >
                {avatarLoading ? (
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
                  'Aggiorna immagine'
                )}
              </Button>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={8}>
          <Card>
            <Card.Body>
              <h3 className="mb-4">Informazioni personali</h3>
              
              <Form>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Nome</Form.Label>
                      <Form.Control 
                        type="text" 
                        value={newName}
                        onChange={handleNameChange}
                        isInvalid={!!nameError}
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Cognome</Form.Label>
                      <Form.Control 
                        type="text" 
                        value={newSurname}
                        onChange={handleSurnameChange}
                        isInvalid={!!nameError}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                {nameError && <div className="text-danger mb-3">{nameError}</div>}
                {nameSuccess && <div className="text-success mb-3">Dati aggiornati con successo!</div>}
                
                <Button 
                  variant="primary" 
                  onClick={handleSubmitNameAndSurname}
                  disabled={nameLoading}
                >
                  {nameLoading ? 'Aggiornamento...' : 'Aggiorna dati'}
                </Button>
              </Form>
              
              <hr className="my-4" />
              
              <div className="d-flex justify-content-between">
                <div>
                  <h5>Email</h5>
                  <p>{userData?.email}</p>
                </div>
                <div>
                  <h5>Account creato il</h5>
                  <p>{new Date(userData?.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              
              <hr className="my-4" />
              
              <div className="text-end">
                <Button 
                  variant="danger" 
                  onClick={handleDeleteAccount}
                >
                  Elimina account
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ProfileUser;