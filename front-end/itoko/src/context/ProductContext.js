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
  const fetchProducts = async ({ search = '', category = '', type = '', page = 1, limit = 8 } = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (category) params.append('category', category);
      if (type) params.append('type', type);
      params.append('page', page);
      params.append('limit', limit);

      const response = await axios.get(`${API_URL}/product?${params.toString()}`);
      const paginationHeader = response.headers['x-pagination'];
      if (paginationHeader) {
        const parsedPagination = JSON.parse(paginationHeader);
        setPaginationProduct({
          ...parsedPagination,
          products: response.data,
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
  const fetchGraphics = async ({ search = '', category = '', page = 1, limit = 8 } = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (category) params.append('category', category);
      params.append('page', page);
      params.append('limit', limit);

      const response = await axios.get(`${API_URL}/graphics?${params.toString()}`);
      if (response.data && response.data.graphics) {
        const { graphics, pagination } = response.data;
        setPaginationGraphic({
          currentPage: pagination.currentPage,
          totalPages: pagination.totalPages,
          totalGraphics: pagination.totalGraphics,
          graphicsPerPage: pagination.graphicsPerPage,
          graphics: graphics
        });
      } else if (response.data && Array.isArray(response.data)) {
        setPaginationGraphic(prev => ({
          ...prev,
          currentPage: page,
          graphics: response.data
        }));
      } else {
        setError("Formato risposta grafiche non riconosciuto");
        console.error("Formato risposta non riconosciuto:", response.data);
      }
    } catch (error) {
      setError("Errore nel caricamento delle grafiche");
      console.error("Errore dettagliato grafiche:", error);
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

