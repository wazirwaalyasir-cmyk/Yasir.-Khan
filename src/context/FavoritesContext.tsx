import React, { createContext, useContext, useEffect, useState } from 'react';

interface FavoritesContextType {
  favoriteIds: string[];
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('pashto_poetry_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('pashto_poetry_favorites', JSON.stringify(favoriteIds));
    } catch (e) {
      console.error('Failed to save favorites', e);
    }
  }, [favoriteIds]);

  const isFavorite = (id: string) => favoriteIds.includes(id);

  const toggleFavorite = (id: string): boolean => {
    if (favoriteIds.includes(id)) {
      setFavoriteIds(prev => prev.filter(fId => fId !== id));
      return false;
    } else {
      setFavoriteIds(prev => [id, ...prev]);
      return true;
    }
  };

  return (
    <FavoritesContext.Provider value={{ favoriteIds, isFavorite, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
