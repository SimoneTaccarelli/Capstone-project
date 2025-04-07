import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { Form } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config/config';

function Login() {
  const { login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const[user, setUser] = useState(null);
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await login(email, password);
      console.log('User logged in successfully:', email, password);
      handleClose(); // Chiudi il modal
      navigate('/'); // Redirect to home page after successful login
    }
    catch (error) {
      setError('Failed to log in. Please check your credentials.');
    }
  }

  const handleGoogleLogin = async () => {
    try {
      // Esegui il login con Google
      await loginWithGoogle();
      
      // Gestisci solo UI
      handleClose();
      navigate('/');
    } catch (error) {
      console.error('Errore login con Google:', error);
      setError('Login con Google fallito. Riprova più tardi.');
    }
  };

  return (
    <>
      <Button variant="link" onClick={handleShow}>
        Login
      </Button>

      <Modal
        show={show}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>Modal title</Modal.Title>
        </Modal.Header>
        <Form className="mb-3" onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Email address</Form.Label>
              <Form.Control type="email" placeholder="Enter email" required onChange={(e) => setEmail(e.target.value)} />
              <Form.Text className="text-muted">
                password
              </Form.Text>
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" placeholder="Password" required onChange={(e) => setPassword(e.target.value)} />
            </Form.Group>

            <Button variant="outline-danger" onClick={handleGoogleLogin} className="w-100 mb-3">
              Login with Google
            </Button>

            <p className="text-center">Don't have an account? <a href="/register">Register</a></p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
            <Button variant="primary" type="submit">Login</Button>
          </Modal.Footer>
        </Form>
      </Modal >
    </>
  );
}

export default Login;