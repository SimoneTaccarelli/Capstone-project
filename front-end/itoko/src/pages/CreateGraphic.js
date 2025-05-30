import { Form, Container, Row, Col, Button } from "react-bootstrap";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../config/config";

const CreateGraphic = () => {
    const navigate = useNavigate();

    // Stati per gestire i dati del form
    const [graphicName, setGraphicName] = useState("");
    const [graphicDescription, setGraphicDescription] = useState("");
    const [graphicTags, setGraphicTags] = useState("");
    const [graphicImages, setGraphicImages] = useState([]);
    const [imagePreview, setImagePreview] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // Gestione nuove immagini
    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setGraphicImages([...graphicImages, ...files]);

        const newPreviews = files.map(file => URL.createObjectURL(file));
        setImagePreview([...imagePreview, ...newPreviews]);
    };

    // Rimuovi immagine
    const removeImage = (index) => {
        const updatedImages = [...graphicImages];
        updatedImages.splice(index, 1);
        setGraphicImages(updatedImages);

        const updatedPreviews = [...imagePreview];
        URL.revokeObjectURL(updatedPreviews[index]);
        updatedPreviews.splice(index, 1);
        setImagePreview(updatedPreviews);
    };

    // Gestisce la creazione di una nuova grafica
    const handleCreateGraphic = async (e) => {
        e.preventDefault();

        if (graphicImages.length === 0) {
            setError("È necessario caricare almeno un'immagine per la grafica");
            return;
        }

        const formData = new FormData();
        formData.append("name", graphicName);
        formData.append("description", graphicDescription);
        formData.append("tags", graphicTags.split(",").map(tag => tag.trim())); // Divide i tag separati da virgola

        graphicImages.forEach(file => {
            formData.append("images", file);
        });

        try {
            setIsSubmitting(true);
            setError(null);

            await axios.post(`${API_URL}/graphics`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            navigate("/administrator");
        } catch (err) {
            setError("Errore durante la creazione della grafica: " + (err.response?.data?.error || err.message));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Container className="py-5">
            <div className="bg-light p-4 rounded-3 shadow-sm mb-4">
                <h2 className="text-center mb-4">Aggiungi Nuova Grafica</h2>

                {error && <div className="alert alert-danger">{error}</div>}

                <Form onSubmit={handleCreateGraphic}>
                    <Row className="g-4">
                        {/* Colonna sinistra */}
                        <Col md={6}>
                            <Form.Group controlId="graphicName" className="mb-3">
                                <Form.Label>Nome Grafica</Form.Label>
                                <Form.Control 
                                    type="text" 
                                    placeholder="Inserisci nome grafica" 
                                    value={graphicName} 
                                    onChange={(e) => setGraphicName(e.target.value)} 
                                    required
                                />
                            </Form.Group>

                            <Form.Group controlId="graphicDescription" className="mb-3">
                                <Form.Label>Descrizione</Form.Label>
                                <Form.Control 
                                    as="textarea" 
                                    rows={4} 
                                    placeholder="Inserisci descrizione grafica" 
                                    value={graphicDescription} 
                                    onChange={(e) => setGraphicDescription(e.target.value)} 
                                />
                            </Form.Group>

                            <Form.Group controlId="graphicTags" className="mb-3">
                                <Form.Label>Tag</Form.Label>
                                <Form.Control 
                                    type="text" 
                                    placeholder="Inserisci tag separati da virgola (es: Naruto, One Piece)" 
                                    value={graphicTags} 
                                    onChange={(e) => setGraphicTags(e.target.value)} 
                                />
                            </Form.Group>
                        </Col>

                        {/* Colonna destra */}
                        <Col md={6}>
                            <Form.Group controlId="graphicImages" className="mb-3">
                                <Form.Label>Immagini Grafica</Form.Label>
                                <Form.Control 
                                    type="file" 
                                    multiple 
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                            </Form.Group>

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
                        </Col>
                    </Row>

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
                            ) : "Crea Grafica"}
                        </Button>
                    </div>
                </Form>
            </div>
        </Container>
    );
};

export default CreateGraphic;