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
        
        if (loading) return;
        
        setLoading(true);
        setError('');
        
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
            // Disabilita tutti gli elementi del form durante la registrazione
            document.querySelectorAll('form button, form input').forEach(
                el => el.disabled = true
            );
            
            // Esegui la registrazione
            const result = await register(email, password, firstName, lastName);
            
            if (result && result.success) {
                // Se la registrazione è riuscita:
                setSuccess(true);
                
                // 1. Salva informazioni per il messaggio di benvenuto
                localStorage.setItem('registrationSuccess', 'true');
                localStorage.setItem('userEmail', email);
                
                // 2. Se c'è un warning, salvalo per mostrarlo nella home
                if (result.warning) {
                    localStorage.setItem('registrationWarning', result.warning);
                }
                
                // 3. Mostra lo stato di successo e poi reindirizza
                setTimeout(() => {
                    // IMPORTANTE: Usa solo window.location senza manipolare il DOM
                    window.location.href = '/';
                }, 2000);
                
                // Importante: non eseguire altro codice dopo questo punto
                return;
            } else {
                setSuccess(false);
                setError(result?.error || 'Errore durante la registrazione');
            }
        } catch (error) {
            setSuccess(false);
            setError('Errore durante la registrazione');
        } finally {
            if (!success) {
                setLoading(false);
                document.querySelectorAll('form button, form input').forEach(
                    el => el.disabled = false
                );
            }
        }
    };
    
    // Rendering condizionale basato sullo stato
    if (success) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{minHeight: '85vh'}}>
                <div className="text-center">
                    <div className="d-flex justify-content-center mb-3">
                        <div className="bg-success text-white rounded-circle p-3">
                            <i className="bi bi-check-lg" style={{fontSize: '2rem'}}></i>
                        </div>
                    </div>
                    <h2>Registrazione completata!</h2>
                    <p>Verrai reindirizzato alla home page automaticamente.</p>
                    <Spinner animation="border" className="mt-2" />
                </div>
            </div>
        );
    }

    return (
        // Form di registrazione normale
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <Card>
                        <Card.Header className="text-center">
                            <h3>Registrati</h3>
                        </Card.Header>
                        <Card.Body>
                            {error && <Alert variant="danger">{error}</Alert>}
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
                                    {loading ? <><Spinner size="sm" animation="border" /> Registrazione...</> : 'Registrati'}
                                </Button>
                            </Form>
                            <div className="text-center mt-3">
                                Hai già un account? <Link to="/login">Accedi</Link>
                            </div>
                        </Card.Body>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Register;