import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useRestaurant } from './RestaurantContext';

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const { selectedRestaurant } = useRestaurant();
  const [socket, setSocket] = useState(null);
  const [newOrder, setNewOrder] = useState(null);
  const audioRef = useRef(null);

  useEffect(() => {
    // Create audio element for notification sound
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const newSocket = io(import.meta.env.VITE_API_URL || 'https://api.zspeedapp.com/', {
      auth: { token },
      transports: ['websocket']
    });

    newSocket.on('connect', () => {
      console.log('Connected to realtime server');
      if (selectedRestaurant?.id) {
        newSocket.emit('vendor:subscribe', { restaurantId: selectedRestaurant.id });
      }
    });

    newSocket.on('order:new', (order) => {
      console.log('New order received:', order);
      // Notifications disabled for now as requested
      /*
      setNewOrder(order);
      if (audioRef.current) {
        audioRef.current.play().catch(e => console.log('Audio play failed:', e));
      }
      */
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket && selectedRestaurant?.id) {
      socket.emit('vendor:subscribe', { restaurantId: selectedRestaurant.id });
    }
  }, [selectedRestaurant, socket]);

  const clearNewOrder = () => setNewOrder(null);

  return (
    <SocketContext.Provider value={{ socket, newOrder, clearNewOrder }}>
      {children}
    </SocketContext.Provider>
  );
};
