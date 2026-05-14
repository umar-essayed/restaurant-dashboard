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

    const socketUrl = import.meta.env.VITE_API_URL || 'https://api.zspeedapp.com/';
    console.log('🔌 SocketContext: Connecting to:', socketUrl);
    
    const newSocket = io(socketUrl, {
      auth: { token },
      transports: ['polling', 'websocket']
    });

    newSocket.on('connect', () => {
      console.log('Connected to realtime server');
      if (selectedRestaurant?.id) {
        newSocket.emit('vendor:subscribe', { restaurantId: selectedRestaurant.id });
      }
    });

    newSocket.on('order:new', (order) => {
      console.log('🔥🔥 REAL-TIME: New order received via Socket.io:', order);
      setNewOrder(order);
      // Sound is handled by NewOrderAlert component now
    });

    newSocket.on('connect_error', (err) => {
      console.error('❌ Socket Connection Error:', err);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket && selectedRestaurant?.id) {
      console.log(`📡 Emitting vendor:subscribe for restaurant: ${selectedRestaurant.id}`);
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
