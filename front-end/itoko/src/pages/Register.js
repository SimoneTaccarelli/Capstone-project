import {Card, Form, Button, Alert, Spinner} from 'react-bootstrap';
import {useState} from 'react';
import {useNavigate, Link} from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
    const {register} = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Validazione
        if (password !== confirmPassword) {
            setLoading(false);
            return setError('Le password non corrispondono');
        }

        if (password.length < 6) {
            setLoading(false);
            return setError('La password deve contenere almeno 6 caratteri');
        }

        try {
            // Utilizza la nuova funzione register da AuthContext
            const result = await register(email, password, firstName, lastName);
            
            if (result.success) {
                setSuccess(true);
                // Reindirizza dopo un breve ritardo
                setTimeout(() => navigate('/'), 1500);
            } else {
                setError(result.error || 'Errore durante la registrazione');
            }
        } catch (error) {
            console.error("Errore durante la registrazione:", error);
            setError('Errore durante la creazione dell\'account. Riprova più tardi.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="d-flex justify-content-center align-items-center" style={{minHeight: '85vh', padding: '2rem 0'}}>
            <Card style={{width: '25rem', maxWidth: '90%'}} className="shadow-sm">
                <Card.Body>
                    <h2 className="text-center mb-4">Registrazione</h2>
                    
                    {error && <Alert variant="danger">{error}</Alert>}
                    {success && <Alert variant="success">Registrazione completata con successo! Verrai reindirizzato...</Alert>}
                    
                    <Form onSubmit={handleSubmit}>
                        <Form.Group id="first-name" className="mb-3">
                            <Form.Label>Nome</Form.Label>
                            <Form.Control 
                                type="text" 
                                required 
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)} 
                            />
                        </Form.Group>
                        
                        <Form.Group id="last-name" className="mb-3">
                            <Form.Label>Cognome</Form.Label>
                            <Form.Control 
                                type="text" 
                                required 
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)} 
                            />
                        </Form.Group>
                        
                        <Form.Group id="email" className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control 
                                type="email" 
                                required 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)} 
                            />
                        </Form.Group>
                        
                        <Form.Group id="password" className="mb-3">
                            <Form.Label>Password</Form.Label>
                            <Form.Control 
                                type="password" 
                                required 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)} 
                            />
                            <Form.Text className="text-muted">
                                Almeno 6 caratteri
                            </Form.Text>
                        </Form.Group>
                        
                        <Form.Group id="confirm-password" className="mb-3">
                            <Form.Label>Conferma Password</Form.Label>
                            <Form.Control 
                                type="password" 
                                required 
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)} 
                            />
                        </Form.Group>
                        
                        <Button type="submit" className="w-100" disabled={loading}>
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
                                    Registrazione in corso...
                                </>
                            ) : (
                                'Registrati'
                            )}
                        </Button>
                    </Form>
                    
                    <div className="text-center mt-3">
                        Hai già un account? <Link to="/login">Accedi</Link>
                    </div>
                </Card.Body>
            </Card>
        </div>
    );
}
   
export default Register;