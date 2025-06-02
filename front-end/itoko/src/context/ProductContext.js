// src/context/ProductContext.js
import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config/config';

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [graphics, setGraphics] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0,
    productsPerPage: 8,
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
        setPagination(parsedPagination.pagination); // Salva la paginazione
        setProducts(parsedPagination.products); // Salva i prodotti
      } else {
        setError("Errore nella gestione della paginazione");
      }
    } catch (error) {
      setError("Errore nel caricamento dei prodotti");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Carica tutte le grafiche
  const fetchGraphics = async () =>{
    setLoading(true)
    try{
      const response = await axios.get(`${API_URL}/graphics`);
      setGraphics(response.data);
    }
    catch (error) {
      setError("Errore nel caricamento delle grafiche");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    fetchGraphics();
  }, []);

  return (
    <ProductContext.Provider value={{ 
      products, 
      graphics, 
      pagination, 
      loading, 
      error, 
      fetchProducts 
    }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => useContext(ProductContext);