import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { auth } from '../firebase/config';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api/v1';

const OrderContext = createContext();

export const useOrder = () => useContext(OrderContext);

export const OrderProvider = ({ children }) => {
  const { currentUser, userData, token } = useAuth(); // Aggiungi token qui
  const [orders, setOrders] = useState([]);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (currentUser) {
      getUserOrders();
    }
  }, [currentUser]); // Si attiva quando l'utente effettua il login

  // Helper per ottenere il token corrente
  const getAuthHeaders = async () => {
    if (!currentUser) {
      throw new Error('Utente non autenticato');
    }
    const token = await currentUser.getIdToken();
    return {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
  };

  // Recupera gli ordini dell'utente loggato
  const getUserOrders = async () => {
    try {
      // Verifica se c'è un utente autenticato prima di richiedere gli ordini
      if (!auth.currentUser) {
        return [];
      }
      
      const token = await auth.currentUser.getIdToken();
      if (!token) return [];
      
      const response = await axios.get(`${API_URL}/order/my-orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setOrders(response.data);
      return response.data;
    } catch (error) {
      // Gestisci l'errore 404 in modo appropriato
      if (error.response?.status === 404) {
        return [];
      }
      return [];
    }
  };

  // Ottieni un ordine specifico per ID
  const getOrderById = async (orderId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${API_URL}/order/public/${orderId}`);
      
      const orderData = response.data;
      
      // Aggiorna currentOrder per visualizzazione dettagliata
      setCurrentOrder(orderData);
      
      // IMPORTANTE: Aggiorna anche orders per la tabella
      setOrders([orderData]);
      
      return orderData;
    } catch (err) {
      setError(err.response?.data?.error || 'Errore nel recupero dell\'ordine');
      setOrders([]); // Pulisci orders in caso di errore
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Ottieni un ordine tramite link pubblico (non richiede autenticazione)
  const getPublicOrder = async (orderId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${API_URL}/order/public/${orderId}`);
      setCurrentOrder(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Errore nel recupero dell\'ordine');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // --- FUNZIONI ADMIN ---

  // Ottieni tutti gli ordini (solo admin)
  const getAllOrders = async () => {
    console.log("getAllOrders chiamata, loading:", loading);
    try {
      setLoading(true);
      setError(null);
      
      try {
        console.log("Tentativo di ottenere auth headers...");
        const config = await getAuthHeaders();
        console.log("Auth headers ottenuti:", !!config);
        
        console.log("Richiesta API a:", `${API_URL}/order`);
        const response = await axios.get(`${API_URL}/order`, config);
        console.log("Risposta API ricevuta, status:", response.status);
        
        setOrders(response.data);
        return response.data;
      } catch (authError) {
        console.error("Errore auth in getAllOrders:", authError);
        setError('Token di autenticazione mancante o sessione scaduta. Effettua nuovamente il login.');
        return [];
      }
    } catch (error) {
      console.error("Errore generale in getAllOrders:", error);
      setError('Errore nel caricamento degli ordini: ' + (error.response?.data?.message || error.message));
      return [];
    } finally {
      console.log("Setting loading to false in getAllOrders");
      setLoading(false);
    }
  };

  // Aggiorna lo stato di un ordine (solo admin)
  const updateOrderStatus = async (orderId, status) => {
    if (userData?.role !== 'Admin') {
      setError('Accesso non autorizzato');
      return null;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const headers = await getAuthHeaders();
      const response = await axios.put(
        `${API_URL}/order/${orderId}/status`,
        { status },
        headers
      );
      
      // Aggiorna la lista degli ordini se l'ordine è presente
      setOrders(prevOrders => prevOrders.map(order =>  
        order._id === orderId ? response.data : order
      ));
      
      // Aggiorna l'ordine corrente se è quello modificato
      if (currentOrder && currentOrder._id === orderId) {
        setCurrentOrder(response.data);
      }
      
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Errore nell\'aggiornamento dello stato');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Elimina un ordine (solo admin)
  const deleteOrder = async (orderId) => {
    if (userData?.role !== 'Admin') {
      setError('Accesso non autorizzato');
      return false;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const headers = await getAuthHeaders();
      await axios.delete(`${API_URL}/order/${orderId}`, headers);
      
      // Rimuovi l'ordine dalla lista
      setOrders(prevOrders => prevOrders.filter(order => order._id !== orderId));
      
      // Se l'ordine corrente è quello eliminato, resettalo
      if (currentOrder && currentOrder._id === orderId) {
        setCurrentOrder(null);
      }
      
      return true;
    } catch (err) {
      setError(err.response?.data?.error || 'Errore nell\'eliminazione dell\'ordine');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Resetta eventuali errori
  const clearError = () => setError(null);

  // Esponi tutti i metodi e gli stati tramite il context
  return (
    <OrderContext.Provider
      value={{
        // Stati
        orders,
        currentOrder,
        loading,
        error,
        
        // Metodi utente
        getUserOrders,
        getOrderById,
        getPublicOrder,
        
        // Metodi admin
        getAllOrders,
        updateOrderStatus,
        deleteOrder,
        
        // Utility
        clearError
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};