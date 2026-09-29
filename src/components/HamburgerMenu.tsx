import React from 'react';
import {
  X,
  Home,
  BookOpen,
  Sparkles,
  Heart,
  Shield,
  Frown,
  Flame,
  Users,
  Feather,
  Info,
  Mail,
  Lock,
  Clock,
  ChevronLeft,
  Bookmark,
  Shuffle,
  Plus
} from 'lucide-react';
import { CATEGORIES, PoetryCategory } from '../types/poetry';

interface HamburgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCategory: string | null;
  onSelectCategory: (cat: string | null) => void;
  categoryCounts: Record<string, number>;
  onOpenPoets: () => void;
  onOpenAddPoet?: () => void;
  onOpenAbout: () => void;
  onOpenContact: () => void;
  onOpenAdmin?: () => void;
  onOpenFavorites: () => void;
  favoritesCount: number;
  isFavoritesActive?: boolean;
}

export const HamburgerMenu: React.FC<HamburgerMenuProps> = ({
  isOpen,
  onClose,
  selectedCategory,
  onSelectCategory,
  categoryCounts,
  onOpenPoets,
  onOpenAddPoet,
  onOpenAbout,
  onOpenContact,
  onOpenAdmin,
  onOpenFavorites,
  favoritesCount,
  isFavoritesActive
}) => {
  if (!isOpen) return null;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'کلیواله شاعري':
        return <Feather className="w-4 h-4 text-amber-500" />;
      case 'ټپه':
        return <Sparkles className="w-4 h-4 text-purple-500" />;
      case 'غزل':
        return <BookOpen className="w-4 h-4 text-indigo-500" />;
      case 'نظم':
        return <BookOpen className="w-4 h-4 text-blue-500" />;
      case 'رباعي':
        return <Sparkles className="w-4 h-4 text-teal-500" />;
      case 'لنډۍ':
        return <Flame className="w-4 h-4 text-rose-500" />;
      case 'د وطن شاعري':
        return <Shield className="w-4 h-4 text-emerald-500" />;
      default:
        return <BookOpen className="w-4 h-4 text-gray-500" />;
    }
  };

  const handleCategoryClick = (cat: string | null) => {
    onSelectCategory(cat);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
      />

      {/* Drawer Panel - slides out from the left */}
      <div className="relative w-80 max-w-[85vw] h-full bg-white dark:bg-[#1a1523] text-gray-900 dark:text-gray-100 shadow-2xl flex flex-col z-10 transition-transform duration-300 animate-in slide-in-from-left">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-purple-900/30 flex items-center justify-between bg-purple-50/50 dark:bg-purple-950/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600/10 dark:bg-purple-500/20 flex items-center justify-center text-purple-700 dark:text-purple-300">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-pashto text-gray-900 dark:text-white">پشتو شاعری</h2>
              <p className="text-xs text-purple-600 dark:text-purple-400 font-pashto">د پښتو شعر او ادب خوند</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-purple-900/40 text-gray-600 dark:text-gray-300 transition-colors"
            aria-label="بندول (Close)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 font-pashto">
          {/* Home */}
          <button
            onClick={() => handleCategoryClick(null)}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              selectedCategory === null && !isFavoritesActive
                ? 'bg-purple-600 text-white font-semibold shadow-sm'
                : 'hover:bg-gray-100 dark:hover:bg-purple-950/40 text-gray-700 dark:text-gray-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <Home className={`w-4 h-4 ${selectedCategory === null && !isFavoritesActive ? 'text-white' : 'text-purple-600 dark:text-purple-400'}`} />
              <span>کور / Home</span>
            </div>
            {selectedCategory === null && !isFavoritesActive && <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Favorites / خوندي شوي شعرونه */}
          <button
            onClick={() => {
              onClose();
              onOpenFavorites();
            }}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              isFavoritesActive
                ? 'bg-purple-600 text-white font-semibold shadow-sm'
                : 'hover:bg-gray-100 dark:hover:bg-purple-950/40 text-gray-700 dark:text-gray-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <Bookmark className={`w-4 h-4 ${isFavoritesActive ? 'text-white fill-white' : 'text-purple-600 dark:text-purple-400'}`} />
              <span>خوندي شوي شعرونه (Favorites)</span>
            </div>
            {favoritesCount > 0 && (
              <span className={`text-xs px-2 py-0.5 rounded-full ${isFavoritesActive ? 'bg-purple-800 text-white' : 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300'}`}>
                {favoritesCount}
              </span>
            )}
          </button>

          {/* New / Latest Poetry */}
          <button
            onClick={() => handleCategoryClick(null)}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-100 dark:hover:bg-purple-950/40 text-gray-700 dark:text-gray-200 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-emerald-500" />
              <span>نوي شاعري</span>
            </div>
          </button>

          <div className="pt-3 pb-1 px-3 text-[11px] font-bold text-gray-400 dark:text-purple-400/70 uppercase tracking-wider">
            د شاعرۍ ډولونه او موضوعات
          </div>

          {/* Category List */}
          {CATEGORIES.map(cat => {
            const count = categoryCounts[cat] || 0;
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isSelected
                    ? 'bg-purple-600 text-white font-semibold shadow-sm'
                    : 'hover:bg-gray-100 dark:hover:bg-purple-950/40 text-gray-700 dark:text-gray-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  {getCategoryIcon(cat)}
                  <span>{cat}</span>
                </div>
                {count > 0 && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      isSelected
                        ? 'bg-purple-800 text-purple-100'
                        : 'bg-gray-100 dark:bg-purple-950/60 text-gray-500 dark:text-purple-300'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-3 pb-1 px-3 text-[11px] font-bold text-gray-400 dark:text-purple-400/70 uppercase tracking-wider">
            مشہور شاعران
          </div>

          {/* Famous Poets */}
          <button
            onClick={() => {
              onClose();
              onOpenPoets();
            }}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-100 dark:hover:bg-purple-950/40 text-gray-700 dark:text-gray-200 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>مشہور شاعران (۳۴ نوميالي شاعران)</span>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
              لړلیک
            </span>
          </button>

          {/* Option: Add Poet / شاعر اضافه کړئ */}
          <button
            onClick={() => {
              onClose();
              if (onOpenAddPoet) {
                onOpenAddPoet();
              } else {
                onOpenPoets();
              }
            }}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium hover:bg-purple-50 dark:hover:bg-purple-950/40 text-purple-700 dark:text-purple-300 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Plus className="w-4 h-4 text-purple-600 dark:text-purple-400 stroke-[2.5]" />
              <span className="font-bold">شاعر اضافه کړئ (Add شاعر)</span>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 font-bold">
              +
            </span>
          </button>

          {/* Filter by Poet Name */}
          <button
            onClick={() => {
              onClose();
              onOpenPoets();
            }}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-100 dark:hover:bg-purple-950/40 text-gray-700 dark:text-gray-200 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Feather className="w-4 h-4 text-amber-500" />
              <span>د شاعر له مخې لټون</span>
            </div>
          </button>

          <div className="pt-3 pb-1 px-3 text-[11px] font-bold text-gray-400 dark:text-purple-400/70 uppercase tracking-wider">
            معلومات او اړیکه
          </div>

          {/* About Publisher */}
          <button
            onClick={() => {
              onClose();
              onOpenAbout();
            }}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-100 dark:hover:bg-purple-950/40 text-gray-700 dark:text-gray-200 transition-colors"
          >
            <Info className="w-4 h-4 text-blue-500" />
            <span>About Publisher (د خپروونکي په اړه)</span>
          </button>

          {/* Contacts */}
          <button
            onClick={() => {
              onClose();
              onOpenContact();
            }}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-100 dark:hover:bg-purple-950/40 text-gray-700 dark:text-gray-200 transition-colors"
          >
            <Mail className="w-4 h-4 text-rose-500" />
            <span className="font-sans font-semibold">Contacts</span>
          </button>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-purple-900/30 text-center text-xs text-gray-400 dark:text-gray-500 font-pashto">
          پشتو شاعری • ډیجیټل ادبی کلتور ۲۰۲۶
        </div>
      </div>
    </div>
  );
};
