// src/context/ProductContext.js
import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config/config';

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  
  const [paginationProduct, setPaginationProduct] = useState({
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0,
    products : [],
    productsPerPage: 8,
  });
  const [paginationGraphic, setPaginationGraphic] = useState({
    currentPage: 1,
    totalPages: 1,
    totalGraphics: 0,
    graphics:[],
    graphicsPerPage: 8,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Carica tutti i prodotti
  const fetchProducts = async (page = 1, limit = 8) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/product?page=${page}&limit=${limit}`);
      const paginationHeader = response.headers['x-pagination'];
      if (paginationHeader) {
        const parsedPagination = JSON.parse(paginationHeader);
        setPaginationProduct({
          ...parsedPagination,
          products: response.data, // Salva i prodotti direttamente dalla risposta
        });
      } else {
        setError("Errore nella gestione della paginazione");
      }
    } catch (error) {
      setError("Errore nel caricamento dei prodotti");
      console.error("Errore dettagliato prodotti:", error);
    } finally {
      setLoading(false);
    }
  };

  // Carica tutte le grafiche
  const fetchGraphics = async (page = 1, limit = 8) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${API_URL}/graphics?page=${page}&limit=${limit}`);
      console.log("Risposta API grafiche:", response.data);
      
      // Gestione della nuova struttura di risposta
      if (response.data && response.data.graphics) {
        // Formato nuovo: { graphics: [...], pagination: {...} }
        const { graphics, pagination } = response.data;
        
        setPaginationGraphic({
          currentPage: pagination.currentPage,
          totalPages: pagination.totalPages,
          totalGraphics: pagination.totalGraphics,
          graphicsPerPage: pagination.graphicsPerPage,
          graphics: graphics
        });
      } else if (response.data && Array.isArray(response.data)) {
        // Per retrocompatibilità, nel caso in cui la risposta fosse ancora un array
        console.warn("Formato risposta API deprecato - array semplice");
        setPaginationGraphic(prev => ({
          ...prev,
          currentPage: page,
          graphics: response.data
        }));
      } else {
        // Fallback se la struttura è diversa
        setError("Formato risposta grafiche non riconosciuto");
        console.error("Formato risposta non riconosciuto:", response.data);
      }
    } catch (error) {
      setError("Errore nel caricamento delle grafiche");
      console.error("Errore dettagliato grafiche:", error);
      
      if (error.response) {
        console.error("Status:", error.response.status);
        console.error("Dati:", error.response.data);
      }
      
      // Imposta un array vuoto come fallback
      setPaginationGraphic(prev => ({
        ...prev,
        graphics: []
      }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchGraphics();
  }, []);

  return (
    <ProductContext.Provider value={{ 
      paginationProduct, 
      paginationGraphic,
      loading, 
      error, 
      fetchProducts,
      fetchGraphics  // Esporta anche fetchGraphics!
    }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => useContext(ProductContext);

