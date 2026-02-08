import React, { createContext, useContext, useState, useEffect } from 'react';

const WatchlistContext = createContext(null);

export const WatchlistProvider = ({ children }) => {
  const [watchedIds, setWatchedIds] = useState(() => {
    const saved = localStorage.getItem('cosmic_watchlist');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  useEffect(() => {
    localStorage.setItem('cosmic_watchlist', JSON.stringify([...watchedIds]));
  }, [watchedIds]);

  const toggleWatch = (id) => {
    setWatchedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <WatchlistContext.Provider value={{ watchedIds, toggleWatch }}>
      {children}
    </WatchlistContext.Provider>
  );
};

export const useWatchlist = () => {
  const context = useContext(WatchlistContext);
  if (!context) {
    throw new Error('useWatchlist must be used within a WatchlistProvider');
  }
  return context;
};
