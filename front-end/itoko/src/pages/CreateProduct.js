import { Form, Container, Row, Col, Button } from "react-bootstrap";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { API_URL } from "../config/config";
import { useProducts } from "../context/ProductContext";

/**
 * Componente per creare un nuovo prodotto nell'e-commerce
 * Permette l'inserimento di dati testuali e immagini
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
    
    // Stati per gestire immagini e anteprime (simile a ModifyProduct)
    const [productImages, setProductImages] = useState([]);
    const [imagePreview, setImagePreview] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    
    // Verifica se l'utente è amministratore
    const isAdmin = userData && userData.role === "Admin";

    // Gestione nuove immagini (simile a handleNewImages in ModifyProduct)
    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setProductImages([...productImages, ...files]);
        
        // Crea URL per le anteprime
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setImagePreview([...imagePreview, ...newPreviews]);
    };

    // Rimuovi nuova immagine (simile a removeNewImage in ModifyProduct)
    const removeImage = (index) => {
        const updatedImages = [...productImages];
        updatedImages.splice(index, 1);
        setProductImages(updatedImages);
        
        const updatedPreviews = [...imagePreview];
        URL.revokeObjectURL(updatedPreviews[index]); // Libera memoria
        updatedPreviews.splice(index, 1);
        setImagePreview(updatedPreviews);
    };

    /**
     * Gestisce la creazione di un nuovo prodotto
     * @param {Event} e - Evento submit del form
     */
    const handleCreateProduct = async (e) => {
        e.preventDefault();
        
        // Verifica permessi amministratore prima di procedere
        if (!isAdmin) {
            setError("Solo gli amministratori possono creare prodotti");
            return;
        }
        
        // Verifica che ci siano immagini
        if (productImages.length === 0) {
            setError("È necessario caricare almeno un'immagine per il prodotto");
            return;
        }
        
        // Prepara i dati del form da inviare al server
        const formData = new FormData();
        formData.append("name", productName);
        formData.append("description", productDescription);
        formData.append("price", productPrice);
        formData.append("category", productCategory);
        formData.append("stock", productStock);

        // Aggiungi le immagini alla FormData
        productImages.forEach(file => {
            formData.append("images", file);
        });

        try {
            setIsSubmitting(true);
            setError(null);
            
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
        } catch (err) {
            setError("Errore durante la creazione del prodotto: " + (err.response?.data?.error || err.message));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Container className="py-5">
            <div className="bg-light p-4 rounded-3 shadow-sm mb-4">
                <h2 className="text-center mb-4">Aggiungi Nuovo Prodotto</h2>
                
                {error && <div className="alert alert-danger">{error}</div>}
                
                <Form onSubmit={handleCreateProduct}>
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
                                <Form.Control 
                                    type="file" 
                                    multiple 
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                    
                    {/* Visualizzazione delle immagini in griglia (simile a ModifyProduct) */}
                    {imagePreview.length > 0 && (
                        <div className="mt-4">
                            <h5 className="mb-3">Anteprima Immagini</h5>
                            <div className="d-flex flex-wrap gap-3">
                                {imagePreview.map((preview, index) => (
                                    <div key={index} className="position-relative" style={{width: '100px'}}>
                                        <img 
                                            src={preview} 
                                            alt={`Anteprima ${index + 1}`}
                                            className="img-thumbnail" 
                                            style={{width: '100px', height: '100px', objectFit: 'cover'}}
                                        />
                                        <Button 
                                            variant="danger" 
                                            size="sm" 
                                            className="position-absolute top-0 end-0"
                                            onClick={() => removeImage(index)}
                                        >
                                            <i className="bi bi-x"></i>
                                        </Button>
                                    </div>
                                ))}
                            </div>
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
                            {isSubmitting ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Creazione in corso...
                                </>
                            ) : "Crea Prodotto"}
                        </Button>
                    </div>
                </Form>
            </div>
        </Container>
    );
}

export default CreateProduct;