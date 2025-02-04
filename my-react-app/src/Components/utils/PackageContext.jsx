import React, { createContext, useContext, useState, useEffect } from 'react';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';

const PackageContext = createContext();

export const PackageProvider = ({ children }) => {
  const { user } = useKindeAuth();
  const [userPackage, setUserPackage] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkUserPackage = async () => {
    try {
      if (!user?.id) return;
      const response = await fetch(`http://localhost:4000/api/combo/active/${user.id}`);
      const data = await response.json();
      setUserPackage(data.combo);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      checkUserPackage();
    }
  }, [user?.id]);

  const refreshPackage = () => {
    checkUserPackage();
  };

  return (
    <PackageContext.Provider value={{ userPackage, loading, refreshPackage }}>
      {children}
    </PackageContext.Provider>
  );
};

export const usePackage = () => useContext(PackageContext);