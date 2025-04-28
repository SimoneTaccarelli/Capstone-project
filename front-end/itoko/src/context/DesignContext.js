import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config/config.js';

// Crea il context
const DesignContext = createContext();

// Hook personalizzato per utilizzare il context
export const useDesign = () => useContext(DesignContext);

export const DesignProvider = ({ children }) => {
  const [logo, setLogo] = useState(null);
  const [frontImage, setFrontImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Carica le impostazioni di design all'avvio
  useEffect(() => {
    fetchDesignSettings();
  }, []);

  // Recupera le impostazioni di design dal server
  const fetchDesignSettings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/file/design`);
      
      // La risposta ora dovrebbe essere un oggetto, non un array
      if (response.data && response.data.data) {
        const settings = response.data.data;
        
        if (settings.logo) {
          setLogo(settings.logo);
        }
        
        if (settings.frontImage) {
          setFrontImage(settings.frontImage);
        }
      }
    } catch (err) {
      setError('Errore nel caricamento impostazioni design');
    } finally {
      setLoading(false);
    }
  };

  // Funzione per caricare solo il logo
  const uploadLogo = async (logoFile) => {
    if (!logoFile) {
      return { success: false, error: 'Nessun file selezionato' };
    }
    
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('image', logoFile);
      
      const response = await axios.post(`${API_URL}/file/upload/logo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (response.data && response.data.success) {
        // Estrai l'URL direttamente dalla risposta in modo più robusto
        let logoUrl = null;
        
        if (response.data.data && response.data.data.logo) {
          logoUrl = response.data.data.logo;
        } else if (response.data.data && response.data.data.url) {
          logoUrl = response.data.data.url;
        } else if (response.data.url) {
          logoUrl = response.data.url;
        }
        
        if (logoUrl) {
          setLogo(logoUrl);
          // Forza un refresh dell'interfaccia con un piccolo ritardo
          setTimeout(() => {
            const event = new Event('logoUpdated');
            window.dispatchEvent(event);
          }, 100);
          return { success: true, url: logoUrl };
        }
        
        // Fallback: ricarica tutte le impostazioni
        await fetchDesignSettings();
        return { success: true };
      }
      
      return { success: false, error: 'Errore nel caricamento del logo' };
    } catch (err) {
      setError('Impossibile caricare il logo');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Funzione per caricare solo l'immagine frontale
  const uploadFrontImage = async (frontImageFile) => {
    if (!frontImageFile) {
      return { success: false, error: 'Nessun file selezionato' };
    }
    
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('image', frontImageFile);
      
      // Usa la nuova rotta specifica per l'immagine frontale
      const response = await axios.post(`${API_URL}/file/upload/frontimage`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (response.data && response.data.success) {
        if (response.data.data && response.data.data.frontImage) {
          setFrontImage(response.data.data.frontImage);
        } else {
          // Ricarica le impostazioni complete
          await fetchDesignSettings();
        }
        return { success: true };
      }
      
      return { success: false, error: 'Errore nel caricamento dell\'immagine frontale' };
    } catch (err) {
      setError('Impossibile caricare l\'immagine frontale');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Aggiorna entrambe le immagini con chiamate separate
  const updateDesignSettings = async (logoFile, frontImageFile) => {
    if (!logoFile && !frontImageFile) {
      return { success: false, error: 'Nessun file selezionato' };
    }
    
    try {
      setLoading(true);
      let logoResult = { success: true };
      let frontImageResult = { success: true };
      
      // Carica il logo se presente
      if (logoFile) {
        logoResult = await uploadLogo(logoFile);
      }
      
      // Carica l'immagine frontale se presente
      if (frontImageFile) {
        frontImageResult = await uploadFrontImage(frontImageFile);
      }
      
      // Verifica se entrambe le operazioni sono andate a buon fine
      if (logoResult.success && frontImageResult.success) {
        return { success: true };
      } else {
        const errors = [];
        if (!logoResult.success) errors.push(logoResult.error || 'Errore nel caricamento del logo');
        if (!frontImageResult.success) errors.push(frontImageResult.error || 'Errore nel caricamento dell\'immagine frontale');
        
        return { 
          success: false, 
          error: errors.join('; ')
        };
      }
    } catch (err) {
      setError('Impossibile aggiornare le impostazioni di design');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Valore del context
  const value = {
    logo,
    frontImage,
    loading,
    error,
    uploadLogo,           // Funzione specifica per il logo
    uploadFrontImage,     // Funzione specifica per l'immagine frontale
    updateDesignSettings, // Mantiene la funzionalità esistente
    refreshDesign: fetchDesignSettings
  };

  return (
    <DesignContext.Provider value={value}>
      {children}
    </DesignContext.Provider>
  );
};