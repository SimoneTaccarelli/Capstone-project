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

// Crea il contesto per l'autenticazione
const AuthContext = createContext();

// Hook personalizzato per utilizzare il contesto
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Funzione per la registrazione
  const signup = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  // Funzione per il login
  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  // Funzione per il login con Google
  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  };

  // Funzione per il logout
  const logout = () => {
    return signOut(auth);
  };

  // Effetto per monitorare lo stato dell'utente
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Valore da fornire attraverso il contesto
  const value = {
    currentUser,
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