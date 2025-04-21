import { Form, Container, Row, Col, Button } from "react-bootstrap";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { API_URL } from "../config/config";
import CloudImage from "../modal/CloudImage.js";
import { useProducts } from "../context/ProductContext";

/**
 * Componente per creare un nuovo prodotto nell'e-commerce
 * Permette l'inserimento di dati testuali e immagini (sia tramite upload diretto che da Cloudinary)
 */
const CreateProduct = () => {
    // Recupera dati utente e funzionalità di navigazione
    const { userData, currentUser } = useAuth();
    const { addProduct } = useProducts();
    const navigate = useNavigate();
    
    // Stati per gestire i dati del form
    const [productName, setProductName] = useState("");
    const [productDescription, setProductDescription] = useState("");
    const [productPrice, setProductPrice] = useState("");
    const [productCategory, setProductCategory] = useState("");
    const [productStock, setProductStock] = useState("");
    
    // Stati per gestire immagini e anteprime
    const [productImages, setProductImages] = useState([]);
    const [productImagePreviews, setProductImagePreviews] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Verifica se l'utente è amministratore
    const isAdmin = userData && userData.role === "Admin";

    const handleImageChange = (filesOrEvent) => {
        // Caso 1: Input file standard da form
        if (filesOrEvent.target && filesOrEvent.target.files) {
            const files = Array.from(filesOrEvent.target.files);
            setProductImages(files);
            const previews = files.map(file => URL.createObjectURL(file));
            setProductImagePreviews(previews);
        }
        // Caso 2: Array di immagini da CloudImage
        else if (Array.isArray(filesOrEvent)) {
            setProductImages(filesOrEvent);
            setProductImagePreviews(filesOrEvent.map(file => file.url));
        }
        // Caso 3: Singola immagine da CloudImage (retrocompatibilità)
        else if (filesOrEvent.url) {
            setProductImages([filesOrEvent]);
            setProductImagePreviews([filesOrEvent.url]);
        }
    };

    /**
     * Gestisce la creazione di un nuovo prodotto
     * @param {Event} e - Evento submit del form
     */
    const CreateProduct = async (e) => {
        e.preventDefault();
        
        // Verifica permessi amministratore prima di procedere
        if (!isAdmin) return;
        
        // Prepara i dati del form da inviare al server
        const formData = new FormData();
        formData.append("name", productName);
        formData.append("description", productDescription);
        formData.append("price", productPrice);
        formData.append("category", productCategory);
        formData.append("stock", productStock);

        // Gestione delle immagini in base alla loro origine
        if (productImages.length > 0) {
            // Mantieni solo la parte relativa a Cloudinary
            formData.append("cloudinaryUrls", JSON.stringify(
                productImages.map(img => img.url)
            ));
        }

        try {
            setIsSubmitting(true);
            // Ottieni token di autenticazione da Firebase
            const token = await currentUser.getIdToken();
            
            // Invia richiesta al server per creare il prodotto
            const response = await axios.post(`${API_URL}/product`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`,
                },
            });
            
            addProduct(response.data); // Aggiungi il prodotto al contesto
            
            // Naviga alla pagina amministratore dopo il successo
            navigate("/administrator");
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Container className="py-5">
            <div className="bg-light p-4 rounded-3 shadow-sm mb-4">
                <h2 className="text-center mb-4">Aggiungi Nuovo Prodotto</h2>
                
                <Form onSubmit={CreateProduct}>
                    <Row className="g-4">
                        {/* Colonna sinistra - primi 3 input */}
                        <Col md={6}>
                            <Form.Group controlId="productName" className="mb-3">
                                <Form.Label>Nome Prodotto</Form.Label>
                                <Form.Control 
                                    type="text" 
                                    placeholder="Inserisci nome prodotto" 
                                    value={productName} 
                                    onChange={(e) => setProductName(e.target.value)} 
                                    required
                                />
                            </Form.Group>
                            
                            <Form.Group controlId="productDescription" className="mb-3">
                                <Form.Label>Descrizione</Form.Label>
                                <Form.Control 
                                    as="textarea" 
                                    rows={4} 
                                    placeholder="Inserisci descrizione prodotto" 
                                    value={productDescription} 
                                    onChange={(e) => setProductDescription(e.target.value)} 
                                    required
                                />
                            </Form.Group>
                            
                            <Form.Group controlId="productPrice" className="mb-3">
                                <Form.Label>Prezzo €</Form.Label>
                                <Form.Control 
                                    type="number" 
                                    step="0.01"
                                    placeholder="Inserisci prezzo" 
                                    value={productPrice} 
                                    onChange={(e) => setProductPrice(e.target.value)} 
                                    required
                                />
                            </Form.Group>
                        </Col>
                        
                        {/* Colonna destra - altri 3 input */}
                        <Col md={6}>
                            <Form.Group controlId="productCategory" className="mb-3">
                                <Form.Label>Categoria</Form.Label>
                                <Form.Control 
                                    type="text" 
                                    placeholder="Inserisci categoria" 
                                    value={productCategory} 
                                    onChange={(e) => setProductCategory(e.target.value)} 
                                    required
                                />
                            </Form.Group>
                            
                            <Form.Group controlId="productStock" className="mb-3">
                                <Form.Label>Disponibilità</Form.Label>
                                <Form.Control 
                                    type="number" 
                                    placeholder="Inserisci quantità disponibile" 
                                    value={productStock} 
                                    onChange={(e) => setProductStock(e.target.value)} 
                                    required
                                />
                            </Form.Group>
                            
                            <Form.Group controlId="productImages" className="mb-3">
                                <Form.Label>Immagini Prodotto</Form.Label>
                                <div className="py-2">
                                    <CloudImage
                                        handleImageChange={handleImageChange} 
                                    />
                                </div>
                            </Form.Group>
                        </Col>
                    </Row>
                    
                    {/* Visualizzazione delle immagini in riga */}
                    {productImagePreviews.length > 0 && (
                        <div className="mt-4">
                            <h5 className="mb-3">Anteprima Immagini</h5>
                            <Row className="g-2">
                                {productImagePreviews.map((preview, index) => (
                                    <Col key={index} xs={6} sm={4} md={3} lg={2}>
                                        <div className="position-relative">
                                            <img 
                                                src={preview} 
                                                alt={`Preview ${index + 1}`}
                                                className="img-thumbnail w-100 object-fit-cover"
                                                style={{height: '150px'}}
                                            />
                                        </div>
                                    </Col>
                                ))}
                            </Row>
                        </div>
                    )}
                    
                    {/* Pulsante submit */}
                    <div className="text-center mt-4">
                        <Button 
                            type="submit" 
                            variant="primary" 
                            size="lg"
                            className="px-5"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Creazione in corso..." : "Crea Prodotto"}
                        </Button>
                    </div>
                </Form>
            </div>
        </Container>
    );
}

export default CreateProduct;