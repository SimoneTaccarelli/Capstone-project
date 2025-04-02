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
            await signup(email, password);
            console.log('User registered successfully:', email , password);
            await addUser(email, password); // Call the function to add user to the database
            navigate('/'); // Redirect to home page after successful registration
        } catch (error) {
            setError('Failed to create an account. Please try again.');
        }
    }

    const addUser = async (email, password) => {
        try {
            const response = await axios.post(`${API_URL}/auth/register`, { email, password });
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