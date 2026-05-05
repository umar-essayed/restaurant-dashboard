import { createContext, useState, useContext, useEffect } from 'react';
import restaurantService from '../services/restaurant.service';

const RestaurantContext = createContext();

export const RestaurantProvider = ({ children }) => {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      const data = await restaurantService.getMyRestaurants();
      setRestaurants(data);
      if (data.length > 0) {
        if (!selectedRestaurant) {
          setSelectedRestaurant(data[0]);
        } else {
          // Update the current selected restaurant with fresh data
          const updated = data.find(r => r.id === selectedRestaurant.id);
          if (updated) setSelectedRestaurant(updated);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (isAuthenticated) {
      fetchRestaurants();
    }
  }, []);

  return (
    <RestaurantContext.Provider
      value={{
        restaurants,
        selectedRestaurant,
        setSelectedRestaurant,
        loading,
        error,
        fetchRestaurants,
        refreshRestaurants: fetchRestaurants,
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
};

export const useRestaurant = () => {
  const context = useContext(RestaurantContext);
  if (!context) {
    throw new Error('useRestaurant must be used within a RestaurantProvider');
  }
  return context;
};
