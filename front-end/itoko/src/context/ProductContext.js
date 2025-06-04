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
    } finally {
      setLoading(false);
    }
  };

  // Carica tutte le grafiche
  const fetchGraphics = async (page = 1, limit = 8) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/graphics?page=${page}&limit=${limit}`);
      const paginationHeader = response.headers['x-pagination-graphic'];
      if (paginationHeader) {
        const parsedPagination = JSON.parse(paginationHeader);
        setPaginationGraphic({
          ...parsedPagination,
          graphics: parsedPagination.graphics, // Salva le grafiche direttamente dalla paginazione
        });
      } else {
        setError("Errore nella gestione della paginazione delle grafiche");
      }
    } catch (error) {
      setError("Errore nel caricamento delle grafiche");
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
      fetchProducts 
    }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => useContext(ProductContext);

