import { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
  fetchSignInMethodsForEmail
} from 'firebase/auth';
import { auth } from '../firebase/config';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api/v1';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getCurrentToken = async () => {
    if (!currentUser) throw new Error('Nessun utente autenticato');
    return await currentUser.getIdToken();
  };

  const getCurrentUser = async () => {
    try {
      // Verifica se l'utente è autenticato prima di fare la richiesta
      if (!auth.currentUser) {
        console.log('Nessun utente autenticato, salto la richiesta /auth/me');
        return null;
      }
      
      // Ottieni il token con un breve ritardo per assicurarsi che sia valido
      await new Promise(resolve => setTimeout(resolve, 500));
      const token = await auth.currentUser.getIdToken(true);
      
      if (!token) {
        console.log('Nessun token disponibile');
        return null;
      }
      
      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      return response.data;
    } catch (error) {
      // Gestisci l'errore 404 in modo più silenzioso
      if (error.response?.status === 404) {
        console.log('Utente non trovato nel database, possibile nuova registrazione');
        return null;
      }
      console.error("Errore durante il recupero dei dati utente:", error);
      return null;
    }
  };

  const login = async (email, password) => {
    try {
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Errore durante il login:", error);
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();
      
      try {
        const backendResponse = await axios.post(`${API_URL}/auth/login-google`, { token });
        setUserData(backendResponse.data);
      } catch (backendError) {
        console.error("Errore sincronizzazione con MongoDB:", backendError);
        alert("Errore durante la sincronizzazione dell'account. Riprova.");
      }
      
      return result;
    } catch (error) {
      console.error("Errore durante il login con Google:", error);
      throw error;
    }
  };

  const logout = () => signOut(auth);

  const updateUserProfile = async (data = {}) => {
    try {
      const token = await getCurrentToken();
      const { firstName, lastName, imageFile } = data;
      
      if (imageFile) {
        setLoading(true);
        
        const formData = new FormData();
        if (firstName) formData.append('firstName', firstName);
        if (lastName) formData.append('lastName', lastName);
        formData.append('profilePic', imageFile);
        
        const response = await axios.put(`${API_URL}/auth/modifyUser`, 
          formData,
          { 
            headers: { 
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${token}` 
            }
          }
        );
        
        if (response.data && response.data.success) {
          const imageUrl = response.data.user?.profilePic || response.data.profilePic;
          
          const updatedUserData = {...userData};
          if (firstName) updatedUserData.firstName = firstName;
          if (lastName) updatedUserData.lastName = lastName;
          if (imageUrl) updatedUserData.profilePic = imageUrl;
          
          setUserData(updatedUserData);
          
          return { success: true, url: imageUrl, user: updatedUserData };
        }
        
        return { success: false, error: 'Errore nell\'aggiornamento del profilo' };
      } 
      else if (firstName || lastName) {
        const response = await axios.put(`${API_URL}/auth/modifyUser`, 
          { firstName, lastName },
          { headers: { Authorization: `Bearer ${token}` }}
        );
        
        setUserData(prev => ({
          ...prev,
          ...(firstName && { firstName }),
          ...(lastName && { lastName })
        }));
        
        return response.data;
      }
      
      return { success: false, error: 'Nessun dato da aggiornare' };
    } catch (error) {
      console.error('Errore durante l\'aggiornamento del profilo:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const deleteUserAccount = async () => {
    try {
      const token = await getCurrentToken();
      await axios.delete(`${API_URL}/auth/cancelUser`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await logout();
      return { success: true, message: 'Account eliminato con successo' };
    } catch (error) {
      console.error('Errore durante l\'eliminazione dell\'account:', error);
      throw error;
    }
  };

  const register = async (email, password, firstName, lastName) => {
    try {
      setLoading(true);
      setError("");
      
      console.log("1. Iniziando registrazione Firebase per:", email);
      
      // 1. Verifica se l'utente esiste già
      try {
        const methods = await fetchSignInMethodsForEmail(auth, email);
        if (methods && methods.length > 0) {
          throw new Error("Questa email è già registrata");
        }
      } catch (emailCheckError) {
        if (emailCheckError.message !== "Questa email è già registrata") {
          console.log("Errore verifica email:", emailCheckError);
        } else {
          throw emailCheckError;
        }
      }
      
      // 2. Crea l'utente in Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      console.log("2. Utente Firebase creato:", user.uid);
      
      // 3. Aggiorna il profilo in Firebase
      await updateProfile(user, {
        displayName: `${firstName} ${lastName}`
      });
      
      // 4. Ottieni il token
      const token = await user.getIdToken();
      
      console.log("3. Token ottenuto, inoltrando al backend");
      
      // 5. Verifica connessione al backend
      try {
        // Prima fai una richiesta di ping per verificare che il backend sia accessibile
        await axios.get(`${API_URL}/ping`);
      } catch (pingError) {
        console.log("Backend non raggiungibile:", pingError);
        // Non bloccare la registrazione, continuiamo comunque
      }
      
      try {
        // 6. Invia i dati al backend
        const response = await axios.post(`${API_URL}/auth/register`, {
          firstName, 
          lastName, 
          email,
          firebaseUid: user.uid
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log("4. Risposta dal backend:", response.data);
        return { success: true, user: response.data };
      } catch (backendError) {
        console.log("Errore dal backend ma utente Firebase creato:", backendError);
        // Non bloccare la registrazione, l'utente Firebase esiste
        return { 
          success: true, 
          warning: "Utente creato in Firebase ma ci sono stati problemi con il backend. Alcune funzionalità potrebbero non essere disponibili.",
          user: {
            email,
            firstName,
            lastName,
            firebaseUid: user.uid
          }
        };
      }
    } catch (error) {
      console.error("Errore completo:", error);
      
      // Se l'utente è stato creato in Firebase ma c'è stato un errore successivo
      // non eliminarlo, teniamo l'account
      
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (!user) {
        setUserData(null);
        setLoading(false);
        return;
      }
      
      try {
        const token = await user.getIdToken();
        const response = await axios.get(`${API_URL}/auth/me`, { 
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data) setUserData(response.data);
      } catch (error) {
        console.error("Errore durante il recupero dei dati utente:", error);
      } finally {
        setLoading(false);
      }
    });
    
    return () => unsubscribe();
  }, []);

const avatarUrl =`https://ui-avatars.com/api/?background=8c00ff&color=fff&name=${userData?.firstName}+${userData?.lastName}`;

  return (
    <AuthContext.Provider value={{
      currentUser,
      userData,
      login,
      logout,
      register,
      loading,
      error,
      avatarUrl,
      loginWithGoogle,
      updateUserProfile,
      deleteUserAccount
    }}>
      {children}
    </AuthContext.Provider>
  );
};