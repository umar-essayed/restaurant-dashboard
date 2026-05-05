import React, { createContext, useContext, useEffect, useState } from 'react';

const ProfileLogoContext = createContext(null);
const RestaurantNameContext = createContext(null);
const AddressContext = createContext(null);
const OpenStatusContext = createContext(null);

export const ProfileLogoProvider = ({ children }) => {
  const [logo, setLogo] = useState(() => {
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem('profileLogoImage') : null;
      return raw ? JSON.parse(raw) : '/logo.png';
    } catch (e) {
      return '/logo.png';
    }
  });

  const [restaurantName, setRestaurantName] = useState(() => {
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem('profileRestaurantName') : null;
      return raw ? JSON.parse(raw) : 'Vendor';
    } catch (e) {
      return 'Vendor';
    }
  });

  const [address, setAddress] = useState(() => {
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem('profileAddress') : null;
      return raw ? JSON.parse(raw) : 'Address';
    } catch (e) {
      return 'Address';
    }
  });

  const [isRestaurantOpen, setIsRestaurantOpen] = useState(() => {
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem('profileIsOpen') : null;
      return raw ? JSON.parse(raw) : true;
    } catch (e) {
      return true;
    }
  });

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('profileLogoImage', JSON.stringify(logo));
      }
    } catch (e) {
      // ignore
    }
  }, [logo]);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('profileRestaurantName', JSON.stringify(restaurantName));
      }
    } catch (e) {
      // ignore
    }
  }, [restaurantName]);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('profileAddress', JSON.stringify(address));
      }
    } catch (e) {
      // ignore
    }
  }, [address]);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('profileIsOpen', JSON.stringify(isRestaurantOpen));
      }
    } catch (e) {
      // ignore
    }
  }, [isRestaurantOpen]);

  useEffect(() => {
    function handleStorage(e) {
      if (e.key === 'profileLogoImage') {
        try {
          setLogo(e.newValue ? JSON.parse(e.newValue) : '/logo.png');
        } catch (err) {
          setLogo('/logo.png');
        }
      }
      if (e.key === 'profileRestaurantName') {
        try {
          setRestaurantName(e.newValue ? JSON.parse(e.newValue) : 'Vendor');
        } catch (err) {
          setRestaurantName('Vendor');
        }
      }
      if (e.key === 'profileAddress') {
        try {
          setAddress(e.newValue ? JSON.parse(e.newValue) : 'Address');
        } catch (err) {
          setAddress('Address');
        }
      }
      if (e.key === 'profileIsOpen') {
        try {
          setIsRestaurantOpen(e.newValue ? JSON.parse(e.newValue) : true);
        } catch (err) {
          setIsRestaurantOpen(true);
        }
      }
    }
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return (
    <ProfileLogoContext.Provider value={[logo, setLogo]}>
      <RestaurantNameContext.Provider value={[restaurantName, setRestaurantName]}>
        <AddressContext.Provider value={[address, setAddress]}>
          <OpenStatusContext.Provider value={[isRestaurantOpen, setIsRestaurantOpen]}>
            {children}
          </OpenStatusContext.Provider>
        </AddressContext.Provider>
      </RestaurantNameContext.Provider>
    </ProfileLogoContext.Provider>
  );
};

export const useProfileLogo = () => {
  const ctx = useContext(ProfileLogoContext);
  if (!ctx) throw new Error('useProfileLogo must be used within ProfileLogoProvider');
  return ctx;
};

export const useRestaurantName = () => {
  const ctx = useContext(RestaurantNameContext);
  if (!ctx) throw new Error('useRestaurantName must be used within ProfileLogoProvider');
  return ctx;
};

export const useAddress = () => {
  const ctx = useContext(AddressContext);
  if (!ctx) throw new Error('useAddress must be used within ProfileLogoProvider');
  return ctx;
};

export const useOpenStatus = () => {
  const ctx = useContext(OpenStatusContext);
  if (!ctx) throw new Error('useOpenStatus must be used within ProfileLogoProvider');
  return ctx;
};

export default ProfileLogoContext;
