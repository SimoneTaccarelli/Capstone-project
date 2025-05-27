import { Container } from "react-bootstrap";
import { FaInstagram } from "react-icons/fa"; // Importa l'icona di Instagram

const Footer = () => {
    return (
        <footer className="bg-dark text-white py-4">
            <Container>
                <div className="text-center">
                    <p>&copy; {new Date().getFullYear()} Itoko. Tutti i diritti riservati.</p>
                    <p>Realizzato da Itoko Team</p>
                    {/* Aggiunta dell'icona di Instagram */}
                    <a 
                        href="https://www.instagram.com/itokonolab/" // Sostituisci con il link alla tua pagina Instagram
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-white"
                    >
                        <FaInstagram size={24} className="me-2" /> {/* Icona Instagram */}
                    </a>
                </div>
            </Container>
        </footer>
    );
}

export default Footer;
