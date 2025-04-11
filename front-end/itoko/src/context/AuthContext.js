import { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { auth } from '../firebase/config';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api/v1';

// Crea il contesto per l'autenticazione
const AuthContext = createContext();

// Hook personalizzato per utilizzare il contesto
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  // Funzione per la registrazione
  const signup = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  // Funzione per il login
  const login = async (email, password) => {
    try {
      // Esegui il login normale
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Ottieni il token dell'utente
      const token = await userCredential.user.getIdToken();
      
      // Stampa il token per poterlo usare in Postman
      console.log('Token per Postman:', token);
      
      return userCredential;
    } catch (error) {
      console.error("Errore durante il login:", error);
      throw error;
    }
  };

  // Funzione per il login con Google
  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Ottieni il token
      const token = await result.user.getIdToken();
      console.log('Token Google per Postman:', token);
      
      // Invia il token al backend per sincronizzare con MongoDB
      try {
        const backendResponse = await axios.post(`${API_URL}/auth/login-google`, { token });
        console.log('Utente sincronizzato con MongoDB:', backendResponse.data);
        // Qui potresti arricchire currentUser con i dati dal backend
      } catch (backendError) {
        console.error("Errore sincronizzazione con MongoDB:", backendError);
        // Gestisci l'errore ma non interrompere il flusso di autenticazione
      }
      
      return result;
    } catch (error) {
      console.error("Errore durante il login con Google:", error);
      throw error;
    }
  };

  // Funzione per il logout
  const logout = () => {
    return signOut(auth);
  };

  // Effetto per monitorare lo stato dell'utente
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const token = await user.getIdToken();
          
          // Usa GET /auth/me o il tuo endpoint corretto
          const response = await axios.get(`${API_URL}/auth/me`, { 
            headers: { Authorization: `Bearer ${token}` } // ✅ headers corretto
          });
          console.log('Dati utente:', response.data); // ✅ log dei dati utente
          
          setUserData(response.data);
        }
        catch (error) {
          console.error("Errore durante il recupero dei dati utente:", error);
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Valore da fornire attraverso il contesto
  const value = {
    currentUser,
    userData, // ✅ aggiunto userData
    signup,
    login,
    loginWithGoogle,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};