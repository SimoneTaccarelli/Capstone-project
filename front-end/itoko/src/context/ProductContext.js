// src/context/ProductContext.js
import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config/config';

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0,
    productsPerPage: 8
  });

  // Carica prodotti con supporto paginazione
  const fetchProducts = async (page = 1, limit = 8, filters = {}) => {
    setLoading(true);
    try {
      // Costruisci query string per filtri
      let queryParams = new URLSearchParams({ page, limit });
      if (filters.category) queryParams.append('category', filters.category);
      
      const response = await axios.get(`${API_URL}/product?${queryParams}`);
      
      // Prova a ottenere dati di paginazione dall'header
      const paginationHeader = response.headers['x-pagination'];
      if (paginationHeader) {
        try {
          const paginationData = JSON.parse(paginationHeader);
          setPagination(paginationData);
        } catch (e) {
          // Gestione silenziosa dell'errore di parsing
        }
      } else {
        // Fallback: crea paginazione manuale
        setPagination({
          currentPage: parseInt(page),
          totalPages: Math.ceil((response.data.length || 0) / limit),
          totalProducts: response.data.length || 0,
          productsPerPage: parseInt(limit)
        });
      }
      
      setProducts(response.data.products || response.data);
      if(response.data.pagination) {
        setPagination(response.data.pagination);
      }
          
    } catch (error) {
      setError("Errore nel caricamento dei prodotti");
    } finally {
      setLoading(false);
    }
  };

  // Aggiungi un nuovo prodotto
  const addProduct = (product) => {
    setProducts(prev => [product, ...prev]);
  };

  // Aggiorna un prodotto esistente
  const updateProduct = (updatedProduct) => {
    setProducts(prev => prev.map(p => 
      p._id === updatedProduct._id ? updatedProduct : p
    ));
  };

  // Rimuovi un prodotto
  const removeProduct = (productId) => {
    setProducts(prev => prev.filter(p => p._id !== productId));
  };

  // Carica i prodotti all'avvio dell'app
  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <ProductContext.Provider value={{ 
      products, 
      loading, 
      error, 
      pagination,
      fetchProducts,
      addProduct,
      updateProduct, 
      removeProduct
    }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => useContext(ProductContext);