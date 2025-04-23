import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { auth } from '../firebase/config';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api/v1';

const OrderContext = createContext();

export const useOrder = () => useContext(OrderContext);

export const OrderProvider = ({ children }) => {
  const { currentUser, userData } = useAuth();
  const [orders, setOrders] = useState([]);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (currentUser) {
      console.log('OrderContext: utente autenticato, carico gli ordini');
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
        console.log('Nessun utente autenticato, salto la richiesta ordini');
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
        console.log('Nessun ordine trovato o endpoint non disponibile');
        return [];
      }
      console.error("Errore nel recupero degli ordini:", error);
      return [];
    }
  };

  // Ottieni un ordine specifico per ID
  const getOrderById = async (orderId) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log("Cercando ordine con ID:", orderId);
      const response = await axios.get(`${API_URL}/order/public/${orderId}`);
      console.log("Risposta dal server:", response.data);
      
      const orderData = response.data;
      
      // Aggiorna currentOrder per visualizzazione dettagliata
      setCurrentOrder(orderData);
      
      // IMPORTANTE: Aggiorna anche orders per la tabella
      setOrders([orderData]);
      
      return orderData;
    } catch (err) {
      console.error('Errore nel recupero dell\'ordine:', err);
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
      console.error('Errore nel recupero dell\'ordine pubblico:', err);
      setError(err.response?.data?.error || 'Errore nel recupero dell\'ordine');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // --- FUNZIONI ADMIN ---

  // Ottieni tutti gli ordini (solo admin)
  const getAllOrders = async () => {
    if (userData?.role !== 'Admin') {
      setError('Accesso non autorizzato');
      return [];
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const headers = await getAuthHeaders();
      const response = await axios.get(`${API_URL}/order`, headers);
      setOrders(response.data);
      return response.data;
    } catch (err) {
      console.error('Errore nel recupero di tutti gli ordini:', err);
      setError(err.response?.data?.error || 'Errore nel recupero degli ordini');
      return [];
    } finally {
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
      console.error('Errore nell\'aggiornamento dello stato dell\'ordine:', err);
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
      console.error('Errore nell\'eliminazione dell\'ordine:', err);
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