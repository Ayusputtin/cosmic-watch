import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';

// Assuming server runs on 3001 locally
const SOCKET_URL = 'http://localhost:3001';

const AsteroidChat = ({ asteroidId, asteroidName, onClose }) => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  
  // Get user info from localStorage
  const [user] = useState(() => localStorage.getItem('cosmicwatch_username') || `Agent-${Math.floor(Math.random() * 1000)}`);
  const [role] = useState(() => localStorage.getItem('cosmicwatch_userRole') || 'Analyst');

  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.emit('join_asteroid', asteroidId);

    newSocket.on('receive_message', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => newSocket.close();
  }, [asteroidId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (text) => {
    if (socket) {
      const messageData = {
        asteroidId,
        user,
        role,
        text,
        timestamp: new Date().toISOString(),
      };
      socket.emit('send_message', messageData);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[500px] flex flex-col bg-black/80 border border-blue-500/50 rounded-lg backdrop-blur-md shadow-[0_0_30px_rgba(0,0,0,0.8)] overflow-hidden z-50 animate-in slide-in-from-bottom-10 fade-in duration-300 font-sans">
      {/* Header */}
      <div className="p-3 border-b border-blue-500/30 bg-blue-900/20 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <h3 className="font-bold text-blue-100 tracking-widest uppercase text-sm">
            COMMS: {asteroidName}
          </h3>
        </div>
        <button 
          onClick={onClose}
          className="text-blue-300 hover:text-white transition-colors text-xl leading-none"
        >
          &times;
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar bg-gradient-to-b from-transparent to-blue-900/5">
        {messages.length === 0 && (
          <div className="text-center text-blue-300/40 text-xs mt-10 font-mono">
            // CHANNEL OPEN. NO TRAFFIC.
          </div>
        )}
        {messages.map((msg, idx) => (
          <ChatMessage key={idx} message={msg} isSelf={msg.user === user} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput onSend={handleSend} />
    </div>
  );
};

export default AsteroidChat;
