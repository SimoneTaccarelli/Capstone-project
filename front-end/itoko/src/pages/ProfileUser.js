import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import { Button, Form, Container, Row, Col, Card, Spinner } from 'react-bootstrap';
import ProfileImage from '../components/ProfileImage';

const ProfileUser = () => {
  const { userData, updateUserProfile, deleteUserAccount } = useAuth();

  const defaultAvatar = `https://ui-avatars.com/api/?background=8c00ff&color=fff&name=${userData?.firstName || 'U'}+${userData?.lastName || 'N'}`;
  
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

  // Gestione del cambio immagine profilo
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    
    // Reset degli stati precedenti
    setAvatarError('');
    setAvatarSuccess(false);
    
    if (!file) {
      setNewAvatar(null);
      setPreviewUrl(null);
      return;
    }
    
    // Imposta il file per l'upload
    setNewAvatar(file);
    
    // Revoca eventuali URL precedenti
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    
    // Crea un nuovo URL per l'anteprima e aggiorna immediatamente
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  // Salvataggio dell'immagine profilo
  const handleSubmitAvatar = async () => {
    if (!newAvatar) return;
    
    setAvatarLoading(true);
    setAvatarError('');
    setAvatarSuccess(false);
    
    try {
      // Rimuovi l'anteprima
      setPreviewUrl(null);
      
      // Aggiorna l'immagine del profilo
      const result = await updateUserProfile({ imageFile: newAvatar });
      
      if (result && result.success) {
        setAvatarSuccess(true);
        setNewAvatar(null);
      } else {
        setAvatarError(`Errore: ${result?.error || 'Si è verificato un errore'}`);
      }
    } catch (error) {
      setAvatarError(`Errore: ${error.message || 'Si è verificato un errore'}`);
    } finally {
      setAvatarLoading(false);
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
              <div className="position-relative mb-3">
                <img
                  src={previewUrl || (userData?.profilePic ? userData.profilePic : defaultAvatar)}
                  alt="Profilo"
                  className="rounded-circle mb-3"
                  style={{
                    width: "150px",
                    height: "150px",
                    objectFit: "cover"
                  }}
                />
                
                {previewUrl && (
                  <div className="position-absolute top-0 end-0 badge bg-primary"
                       style={{ transform: 'translate(25%, -25%)' }}>
                    Anteprima
                  </div>
                )}
              </div>
              
              {/* Form per caricare l'immagine */}
              <Form.Group className="mb-3">
                <Form.Label htmlFor="profile-image">Immagine profilo</Form.Label>
                <Form.Control
                  id="profile-image"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  disabled={avatarLoading}
                />
                {avatarError && <p className="text-danger small mt-1">{avatarError}</p>}
                {avatarSuccess && <p className="text-success small mt-1">Immagine caricata con successo</p>}
              </Form.Group>
              
              {previewUrl && (
                <Button 
                  variant="primary" 
                  onClick={handleSubmitAvatar} 
                  disabled={avatarLoading}
                  className="mb-3"
                >
                  {avatarLoading ? (
                    <>
                      <Spinner animation="border" size="sm" /> Caricamento...
                    </>
                  ) : (
                    "Salva immagine"
                  )}
                </Button>
              )}
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