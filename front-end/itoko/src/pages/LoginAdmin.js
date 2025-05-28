import { useState } from 'react';
import { Form, Alert, Spinner, Button, Container } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

function LoginAdmin() {
  const { login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/'); // Redirect to home page after successful login
    } catch (error) {
      setError('Accesso fallito. Verifica le tue credenziali.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      await loginWithGoogle();
      navigate('/'); // Redirect to home page after successful login
    } catch (error) {
      setError('Login con Google fallito. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <h1 className="mb-4">Accedi</h1>
      <Form className="w-100" style={{ maxWidth: '400px' }} onSubmit={handleSubmit}>
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

        <Button
          variant="primary"
          type="submit"
          className="w-100"
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

        <p className="text-center mt-3">
          Non hai un account? <Link to="/register">Registrati</Link>
        </p>
      </Form>
    </Container>
  );
}

export default LoginAdmin;