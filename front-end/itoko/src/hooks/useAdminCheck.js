import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config/config';
import { useAuth } from '../context/AuthContext';

const useAdminCheck = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  
  useEffect(() => {
    const checkAdmin = async () => {
      if (!currentUser) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      

      try {
        const token = await currentUser.getIdToken();
        const response = await axios.get(`${API_URL}/auth/verify-admin`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsAdmin(response.data.admin === true);
       
      } catch (error) {
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, [currentUser]);
  
  return { isAdmin, loading };
};

export default useAdminCheck;