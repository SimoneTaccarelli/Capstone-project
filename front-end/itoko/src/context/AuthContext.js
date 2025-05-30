import { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
  fetchSignInMethodsForEmail,
  getAuth
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
  const [admin, setAdmin] = useState(false);
  const auth = getAuth();

  

  // Monitora autenticazione e verifica ruolo admin
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (!user) {
        setUserData(null);
        setAdmin(false); // Reset ruolo admin
        setLoading(false);
        return;
      }

      try {
        // Forza il refresh del token per ottenere i custom claims aggiornati
        const idToken = await user.getIdToken(true); // Forza il refresh del token

        

        // Recupera i dati utente dal backend
        const userResponse = await axios.get(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${idToken}` }
        });
        setUserData(userResponse.data); // Aggiorna lo stato userData

        // Verifica il ruolo admin
        const adminResponse = await axios.post(`${API_URL}/auth/verify-admin`, {}, {
          headers: { Authorization: `Bearer ${idToken}` }
        });
       
        setAdmin(adminResponse.data.admin === true);
      } catch (error) {
        console.error("Errore durante la verifica del ruolo admin:", error);
        setAdmin(false);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [auth]);

  // Funzioni di utilità
  const getCurrentToken = async () => {
    if (!currentUser) throw new Error('Nessun utente autenticato');
    return await currentUser.getIdToken();
  };

  const fetchUserData = async (token) => {
    try {
      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return null;
    }
  };

  // Autenticazione
  const login = async (email, password) => {
    try {
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
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
      } catch (error) {
        // Errore gestito silenziosamente
      }
      
      return result;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => signOut(auth);

  // Gestione profilo utente
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
        
        const response = await axios.put(
          `${API_URL}/auth/modifyUser`, 
          formData,
          { 
            headers: { 
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${token}` 
            }
          }
        );
        
        // Aggiungi un delay prima di aggiornare lo stato
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (response.data?.success) {
          const imageUrl = response.data.user?.profilePic || response.data.profilePic;
          
          setUserData(prevData => {
            if (!prevData) return prevData; // Gestisci il caso di componente smontato
            
            return {
              ...prevData,
              ...(firstName && { firstName }),
              ...(lastName && { lastName }),
              ...(imageUrl && { profilePic: imageUrl })
            };
          });
          
          return { success: true, url: imageUrl };
        }
        
        return { success: false, error: 'Errore aggiornamento profilo' };
      } 
      else if (firstName || lastName) {
        const response = await axios.put(
          `${API_URL}/auth/modifyUser`, 
          { firstName, lastName },
          { headers: { Authorization: `Bearer ${token}` }}
        );
        
        await new Promise(resolve => setTimeout(resolve, 300));
        
        setUserData(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            ...(firstName && { firstName }),
            ...(lastName && { lastName })
          };
        });
        
        return response.data;
      }
      
      return { success: false, error: 'Nessun dato da aggiornare' };
    } catch (error) {
      return { success: false, error: 'Errore durante l\'aggiornamento del profilo' };
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 300);
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
      throw error;
    }
  };

  // Registrazione utente
  const register = async (email, password, firstName, lastName) => {
    try {
      setLoading(true);
      setError("");
      
      // 1. Verifica email disponibile
      try {
        const methods = await fetchSignInMethodsForEmail(auth, email);
        if (methods?.length > 0) {
          setError("Questa email è già registrata");
          return { success: false, error: "Questa email è già registrata" };
        }
      } catch (error) {
        if (error.code === 'auth/email-already-in-use' || 
            error.message.includes("email-already-in-use")) {
          setError("Questa email è già registrata");
          return { success: false, error: "Questa email è già registrata" };
        }
      }
      
      // 2. Crea utente Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // 3. Aggiorna profilo Firebase
      await updateProfile(user, {
        displayName: `${firstName} ${lastName}`
      });
      
      // 4. Ottieni token
      const token = await user.getIdToken();
      
      // 5. Registra nel backend
      try {
        const response = await axios.post(`${API_URL}/auth/register`, {
          firstName, lastName, email, firebaseUid: user.uid
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        return { success: true, user: response.data };
      } catch (error) {
        return { 
          success: true, 
          warning: "Utente creato ma sincronizzazione non completata",
          user: { email, firstName, lastName, firebaseUid: user.uid }
        };
      }
    } catch (error) {
      setError(error.message);
      return { success: false, error: "Errore durante la registrazione" };
    } finally {
      setLoading(false);
    }
  };

  const avatarUrl = `https://ui-avatars.com/api/?background=8c00ff&color=fff&name=${userData?.firstName || 'U'}+${userData?.lastName || 'N'}`;

  

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
      deleteUserAccount,
      admin // Aggiunto admin al contesto
    }}>
      {children}
    </AuthContext.Provider>
  );
};