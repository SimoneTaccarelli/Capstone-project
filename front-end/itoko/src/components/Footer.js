import { Container } from "react-bootstrap";



const Footer = () => {
    return (
        <footer className="bg-dark text-white py-4">
        <Container>
            <div className="text-center">
            <p>&copy; {new Date().getFullYear()} Itoko. Tutti i diritti riservati.</p>
            <p>Realizzato da Itoko Team</p>
            </div>
        </Container>
        </footer>
    );
    }

export default Footer;
