import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { Form, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
  const { login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      handleClose(); // Chiudi il modal
      navigate('/'); // Redirect to home page after successful login
    }
    catch (error) {
      setError('Accesso fallito. Verifica le tue credenziali.');
      console.error('Errore di login:', error.message);
    }
    finally {
      setLoading(false);
    }
  }

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    
    try {
      // Esegui il login con Google
      await loginWithGoogle();
      
      // Gestisci solo UI
      handleClose();
      navigate('/');
    } catch (error) {
      console.error('Errore login con Google:', error);
      setError('Login con Google fallito. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button variant="link" onClick={handleShow}>
        Accedi
      </Button>

      <Modal
        show={show}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>Accedi</Modal.Title>
        </Modal.Header>
        <Form className="mb-3" onSubmit={handleSubmit}>
          <Modal.Body>
            {error && <Alert variant="danger">{error}</Alert>}
            
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Indirizzo Email</Form.Label>
              <Form.Control 
                type="email" 
                placeholder="Inserisci email" 
                value={email}
                required 
                onChange={(e) => setEmail(e.target.value)} 
              />
              <Form.Text className="text-muted">
                Non condivideremo la tua email con nessuno.
              </Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control 
                type="password" 
                placeholder="Password" 
                value={password}
                required 
                onChange={(e) => setPassword(e.target.value)} 
              />
            </Form.Group>

            <Button 
              variant="outline-danger" 
              onClick={handleGoogleLogin} 
              className="w-100 mb-3"
              disabled={loading}
            >
              {loading && loginWithGoogle ? (
                <Spinner animation="border" size="sm" className="me-2" />
              ) : (
                <i className="bi bi-google me-2"></i>
              )}
              Accedi con Google
            </Button>

            <p className="text-center">
              Non hai un account? <Link to="/register">Registrati</Link>
            </p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Chiudi
            </Button>
            <Button 
              variant="primary" 
              type="submit"
              disabled={loading}
            >
              {loading && !loginWithGoogle ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Accesso...
                </>
              ) : (
                'Accedi'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal >
    </>
  );
}

export default Login;