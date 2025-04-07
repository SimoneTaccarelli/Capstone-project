import {Card, Form, Button} from 'react-bootstrap';
import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { API_URL } from '../config/config';


const Register = () => {
    const {signup} = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            return setError('Passwords do not match');
        }

        try {
            // Modifica la tua funzione signup per restituire l'utente creato
            const userCredential = await signup(email, password);
            const firebaseUid = userCredential.user.uid;
            
            // Ora usa questo UID
            await addUser(email, firstName, lastName, firebaseUid);
        } catch (error) {
            console.error("Registration error:", error);
            setError('Failed to create an account. Please try again.');
        }
    }

    // Modifica addUser per accettare e inviare l'UID
    const addUser = async (email, firstName, lastName, firebaseUid) => {
        try {
            const response = await axios.post(`${API_URL}/auth/register`, { 
                email, 
                firstName, 
                lastName, 
                firebaseUid // Aggiunto il Firebase UID
            });
            navigate('/');
            console.log('User added successfully:', response.data);
        } catch (error) {
            console.error('Error adding user:', error);
        }
    }


    return (
        <div className="d-flex justify-content-center align-items-center vh-100">
            <Card style={{width: '25rem'}}>
                <Card.Body>
                    <h2 className="text-center mb-4">Register</h2>
                    {error && <p className="text-danger">{error}</p>}
                    <Form onSubmit={handleSubmit}>
                        <Form.Group id="first-name" className="mb-3">
                            <Form.Label>First Name</Form.Label>
                            <Form.Control type="text" required onChange={(e) => setFirstName(e.target.value)} />
                        </Form.Group>
                        <Form.Group id="last-name" className="mb-3">
                            <Form.Label>Last Name</Form.Label>
                            <Form.Control type="text" required onChange={(e) => setLastName(e.target.value)} />
                        </Form.Group>
                        <Form.Group id="email" className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control type="email" required onChange={(e) => setEmail(e.target.value)} />
                        </Form.Group>
                        <Form.Group id="password" className="mb-3">
                            <Form.Label>Password</Form.Label>
                            <Form.Control type="password" required onChange={(e) => setPassword(e.target.value)} />
                        </Form.Group>
                        <Form.Group id="confirm-password" className="mb-3">
                            <Form.Label>Confirm Password</Form.Label>
                            <Form.Control type="password" required onChange={(e) => setConfirmPassword(e.target.value)} />
                        </Form.Group>
                        <Button type="submit" className="w-100">Register</Button>
                    </Form>
                </Card.Body>
            </Card>
        </div>
    );
}
   
export default Register;