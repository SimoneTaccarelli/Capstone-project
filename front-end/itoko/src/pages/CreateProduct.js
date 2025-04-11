import { Form, Card } from "react-bootstrap";
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
    
    // Verifica se l'utente è amministratore
    const isAdmin = userData && userData.role === "Admin";

    /**
     * Gestisce il cambio di immagini del prodotto
     * Supporta sia input file standard che selezione da Cloudinary
     * @param {Object} filesOrEvent - File da Cloudinary o evento da input
     */
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
        }
    };

    return (
        <Card className="text-center" style={{ width: '18rem', margin: 'auto', marginTop: '50px' }}>
            <Form onSubmit={CreateProduct}>
                <Form.Group controlId="productName">
                    <Form.Label>Product Name</Form.Label>
                    <Form.Control 
                        type="text" 
                        placeholder="Enter product name" 
                        value={productName} 
                        onChange={(e) => setProductName(e.target.value)} 
                    />
                </Form.Group>
                <Form.Group controlId="productDescription">
                    <Form.Label>Product Description</Form.Label>
                    <Form.Control 
                        as="textarea" 
                        rows={3} 
                        placeholder="Enter product description" 
                        value={productDescription} 
                        onChange={(e) => setProductDescription(e.target.value)} 
                    />
                </Form.Group>
                <Form.Group controlId="productPrice">
                    <Form.Label>Product Price</Form.Label>
                    <Form.Control 
                        type="number" 
                        placeholder="Enter product price" 
                        value={productPrice} 
                        onChange={(e) => setProductPrice(e.target.value)} 
                    />
                </Form.Group>
                <Form.Group controlId="productCategory">
                    <Form.Label>Product Category</Form.Label>
                    <Form.Control 
                        type="text" 
                        placeholder="Enter product category" 
                        value={productCategory} 
                        onChange={(e) => setProductCategory(e.target.value)} 
                    />
                </Form.Group>
                <Form.Group controlId="productStock">
                    <Form.Label>Product Stock</Form.Label>
                    <Form.Control 
                        type="number" 
                        placeholder="Enter product stock" 
                        value={productStock} 
                        onChange={(e) => setProductStock(e.target.value)} 
                    />
                </Form.Group>
                <CloudImage
                    handleImageChange={handleImageChange} 
                />
                <Form.Group controlId="productImages">
                </Form.Group>
                {productImagePreviews.map((preview, index) => (
                    <img 
                        key={index}
                        src={preview} 
                        alt={`Preview ${index + 1}`}
                        className="img-thumbnail mt-2"
                        style={{height: '100px'}}
                    />
                ))}
                <button type="submit" className="btn btn-primary mt-3" >Create Product</button>
            </Form>
        </Card>
    );
}

export default CreateProduct;