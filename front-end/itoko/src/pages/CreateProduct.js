import { Form, Container, Row, Col, Button, Spinner } from "react-bootstrap";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useProducts } from "../context/ProductContext";
import axios from "axios";
import { API_URL } from "../config/config";
import { useAuth } from "../context/AuthContext";

/**
 * Componente per creare un nuovo prodotto nell'e-commerce
 * Permette l'inserimento di dati testuali e immagini
 */
const CreateProduct = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [productDescription, setProductDescription] = useState("");
    const [productPrice, setProductPrice] = useState("");
    const [productCategory, setProductCategory] = useState("");
    const [productType, setProductType] = useState(""); // T-shirt o Hoodie
    const [productColors, setProductColors] = useState([]); // Array per selezionare più colori
    const [productSizes, setProductSizes] = useState([]); // Array per selezionare più taglie
    const [productGraphic, setProductGraphic] = useState(""); // ID della grafica
    const [graphics, setGraphics] = useState([]); // Lista delle grafiche disponibili
    const [productImages, setProductImages] = useState([]);
    const [imagePreview, setImagePreview] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // Carica le grafiche disponibili dal backend
    useEffect(() => {
        const fetchGraphics = async () => {
            try {
                const response = await axios.get(`${API_URL}/graphics`);
                setGraphics(response.data);
            } catch (err) {
                console.error("Errore durante il caricamento delle grafiche:", err);
            }
        };
        fetchGraphics();
    }, []);

    // Gestione nuove immagini
    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setProductImages([...productImages, ...files]);

        const newPreviews = files.map(file => URL.createObjectURL(file));
        setImagePreview([...imagePreview, ...newPreviews]);
    };

    // Rimuovi immagine
    const removeImage = (index) => {
        const updatedImages = [...productImages];
        updatedImages.splice(index, 1);
        setProductImages(updatedImages);

        const updatedPreviews = [...imagePreview];
        URL.revokeObjectURL(updatedPreviews[index]);
        updatedPreviews.splice(index, 1);
        setImagePreview(updatedPreviews);
    };

    // Gestisce la creazione di un nuovo prodotto
    const handleCreateProduct = async (e) => {
        e.preventDefault();

        if (productImages.length === 0) {
            setError("È necessario caricare almeno un'immagine per il prodotto");
            return;
        }

        if (!productType || !productGraphic || productColors.length === 0 || productSizes.length === 0) {
            setError("È necessario selezionare il tipo di prodotto, una grafica, almeno un colore e una taglia");
            return;
        }

        const formData = new FormData();
        formData.append("name", graphics.find(graphic => graphic._id === productGraphic)?.name || ""); // Nome basato sulla grafica
        formData.append("description", productDescription);
        formData.append("price", productPrice);
        formData.append("category", productCategory);
        formData.append("type", productType);
        productColors.forEach(color => formData.append("color", color)); // Aggiungi più colori
        productSizes.forEach(size => formData.append("size", size)); // Aggiungi più taglie
        formData.append("graphic", productGraphic);
        productImages.forEach(image => formData.append("images", image)); // Aggiungi i file

        try {
            setIsSubmitting(true); // Mostra lo spinner
            const token = await currentUser.getIdToken(); // Ottieni il token dell'utente corrente
            await axios.post(`${API_URL}/product`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data", // Tipo di contenuto corretto
                    Authorization: `Bearer ${token}`, // Aggiungi il token nell'header
                },
            });
            navigate("/administrator");
        } catch (err) {
            setError("Errore durante la creazione del prodotto: " + (err.response?.data?.error || err.message));
        } finally {
            setIsSubmitting(false); // Nascondi lo spinner
        }
    };

    const handleColorChange = (e) => {
        const selectedColor = e.target.value;
        if (!productColors.includes(selectedColor)) {
            setProductColors([...productColors, selectedColor]);
        }
    };

    const removeColor = (color) => {
        setProductColors(productColors.filter(c => c !== color));
    };

    const handleSizeChange = (e) => {
        const selectedSize = e.target.value;
        if (!productSizes.includes(selectedSize)) {
            setProductSizes([...productSizes, selectedSize]);
        }
    };

    const removeSize = (size) => {
        setProductSizes(productSizes.filter(s => s !== size));
    };

    return (
        <Container className="py-5">
            <div className="bg-light p-4 rounded-3 shadow-sm mb-4">
                <h2 className="text-center mb-4">Aggiungi Nuovo Prodotto</h2>

                {error && <div className="alert alert-danger">{error}</div>}

                <Form onSubmit={handleCreateProduct}>
                    <Row className="g-4">
                        {/* Colonna sinistra */}
                        <Col md={6}>
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
                        </Col>

                        {/* Colonna destra */}
                        <Col md={6}>
                            <Form.Group controlId="productType" className="mb-3">
                                <Form.Label>Tipo di Prodotto</Form.Label>
                                <Form.Select 
                                    value={productType} 
                                    onChange={(e) => setProductType(e.target.value)} 
                                    required
                                >
                                    <option value="">Seleziona tipo</option>
                                    <option value="T-shirt">T-shirt</option>
                                    <option value="Hoodie">Hoodie</option>
                                </Form.Select>
                            </Form.Group>

                            <Form.Group controlId="productColor" className="mb-3">
                                <Form.Label>Colore</Form.Label>
                                <Form.Select 
                                    onChange={handleColorChange} 
                                    required
                                >
                                    <option value="">Seleziona colore</option>
                                    {["Black", "Water Blue", "Beige", "Light Gray", "Light Purple", "Orange", "Rose Red", "Red", "Light Blue", "Light Brown", "Blue Jeans", "Dark Blue", "Purple Haze", "Dark Green", "Gray Green", "Pirate Gray"].map(color => (
                                        <option key={color} value={color}>{color}</option>
                                    ))}
                                </Form.Select>
                                <div className="mt-2">
                                    {productColors.map(color => (
                                        <span key={color} className="badge bg-primary me-2">
                                            {color} <Button variant="danger" size="sm" onClick={() => removeColor(color)}>x</Button>
                                        </span>
                                    ))}
                                </div>
                            </Form.Group>

                            <Form.Group controlId="productSize" className="mb-3">
                                <Form.Label>Taglia</Form.Label>
                                <Form.Select 
                                    onChange={handleSizeChange} 
                                    required
                                >
                                    <option value="">Seleziona taglia</option>
                                    {["S", "M", "L", "XL", "XXL"].map(size => (
                                        <option key={size} value={size}>{size}</option>
                                    ))}
                                </Form.Select>
                                <div className="mt-2">
                                    {productSizes.map(size => (
                                        <span key={size} className="badge bg-primary me-2">
                                            {size} <Button variant="danger" size="sm" onClick={() => removeSize(size)}>x</Button>
                                        </span>
                                    ))}
                                </div>
                            </Form.Group>

                            <Form.Group controlId="productGraphic" className="mb-3">
                                <Form.Label>Grafica</Form.Label>
                                <Form.Select 
                                    value={productGraphic} 
                                    onChange={(e) => setProductGraphic(e.target.value)} 
                                    required
                                >
                                    <option value="">Seleziona grafica</option>
                                    {graphics.map(graphic => (
                                        <option key={graphic._id} value={graphic._id}>
                                            {graphic.name}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>

                            <Form.Group controlId="productImages" className="mb-3">
                                <Form.Label>Immagini Prodotto</Form.Label>
                                <Form.Control 
                                    name="images"
                                    type="file" 
                                    multiple 
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    {/* Anteprima immagini */}
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
                                    <Spinner animation="border" size="sm" className="me-2" />
                                    Creazione in corso...
                                </>
                            ) : "Crea Prodotto"}
                        </Button>
                    </div>
                </Form>
            </div>
        </Container>
    );
};

export default CreateProduct;