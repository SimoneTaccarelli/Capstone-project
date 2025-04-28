import React, { useState, useEffect, useRef } from 'react';
import { Spinner } from 'react-bootstrap';

const ProfileImage = ({ 
  src, 
  fallbackSrc = 'https://via.placeholder.com/150',
  alt = 'Immagine profilo',
  ...props 
}) => {
  // Stati di base per la gestione dell'immagine
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [imageSrc, setImageSrc] = useState(fallbackSrc);
  
  // Verifica se il componente è montato per evitare aggiornamenti su componenti smontati
  const isMountedRef = useRef(true);
  
  // Gestione del caricamento dell'immagine
  useEffect(() => {
    // Per le anteprime locali (blob URLs), mostrale subito senza precaricamento
    if (src && src.startsWith('blob:')) {
      setLoading(false);
      setError(false);
      setImageSrc(src);
      return;
    }
    
    // Per le immagini remote, precarica per evitare flickering
    setLoading(true);
    setError(false);
    
    const img = new Image();
    
    img.onload = () => {
      if (isMountedRef.current) {
        setImageSrc(src);
        setLoading(false);
      }
    };
    
    img.onerror = () => {
      if (isMountedRef.current) {
        setError(true);
        setLoading(false);
        setImageSrc(fallbackSrc);
      }
    };
    
    img.src = src;
    
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, fallbackSrc]);
  
  // Cleanup al dismount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  
  return (
    <div 
      className="position-relative" 
      style={{ 
        width: props.width || 150, 
        height: props.height || 150,
        borderRadius: props.roundedCircle ? '50%' : props.style?.borderRadius || 0,
        overflow: 'hidden'
      }}
    >
      <img
        src={imageSrc}
        alt={alt}
        style={{
          width: '100%',
          height: '100%',
          objectFit: props.style?.objectFit || 'cover',
          display: loading ? 'none' : 'block'
        }}
        {...props}
      />
      
      {loading && (
        <div 
          className="d-flex justify-content-center align-items-center bg-light"
          style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0 
          }}
        >
          <Spinner animation="border" size="sm" />
        </div>
      )}
    </div>
  );
};

export default React.memo(ProfileImage);