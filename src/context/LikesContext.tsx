import React, { createContext, useContext, useEffect, useState } from 'react';

interface LikesContextType {
  likedIds: string[];
  isLiked: (id: string) => boolean;
  toggleLike: (id: string) => Promise<{ likes: number; isLiked: boolean }>;
}

const LikesContext = createContext<LikesContextType | undefined>(undefined);

export const LikesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [likedIds, setLikedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('pashto_poetry_likes');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('pashto_poetry_likes', JSON.stringify(likedIds));
    } catch (e) {
      console.error('Failed to save liked IDs', e);
    }
  }, [likedIds]);

  const isLiked = (id: string) => likedIds.includes(id);

  const toggleLike = async (id: string): Promise<{ likes: number; isLiked: boolean }> => {
    const currentlyLiked = likedIds.includes(id);
    const action = currentlyLiked ? 'unlike' : 'like';

    // Optimistically update local liked list
    if (currentlyLiked) {
      setLikedIds(prev => prev.filter(item => item !== id));
    } else {
      setLikedIds(prev => [...prev, id]);
    }

    try {
      const res = await fetch(`/api/poetry/${id}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });

      if (!res.ok) {
        throw new Error('Failed to update like status');
      }

      const data = await res.json();
      return { likes: data.likes, isLiked: !currentlyLiked };
    } catch (err) {
      // Revert local state on error
      if (currentlyLiked) {
        setLikedIds(prev => [...prev, id]);
      } else {
        setLikedIds(prev => prev.filter(item => item !== id));
      }
      throw err;
    }
  };

  return (
    <LikesContext.Provider value={{ likedIds, isLiked, toggleLike }}>
      {children}
    </LikesContext.Provider>
  );
};

export const useLikes = () => {
  const context = useContext(LikesContext);
  if (!context) {
    throw new Error('useLikes must be used within a LikesProvider');
  }
  return context;
};
