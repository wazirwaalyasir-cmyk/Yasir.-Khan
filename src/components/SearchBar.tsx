import React, { useRef, useEffect } from 'react';
import { Search, X, Sparkles, Feather, CornerDownLeft } from 'lucide-react';

interface SearchBarProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onExecuteSearch?: () => void;
  popularSearches?: string[];
}

const PASHTO_SPECIAL_LETTERS = ['ښ', 'ږ', 'څ', 'ځ', 'ڼ', 'ې', 'ۍ', 'ئ', 'ء'];

export const SearchBar: React.FC<SearchBarProps> = ({
  isOpen,
  onClose,
  searchQuery,
  onSearchChange,
  onExecuteSearch,
  popularSearches = ['رحمان بابا', 'غني خان', 'خوشحال خان', 'ټپه', 'وطن', 'مینه']
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleInsertLetter = (letter: string) => {
    onSearchChange(searchQuery + letter);
    inputRef.current?.focus();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-200 animate-in fade-in"
      />

      {/* Search Dialog */}
      <div className="relative w-full max-w-xl bg-white dark:bg-[#1f192b] text-gray-900 dark:text-gray-100 rounded-3xl shadow-2xl border border-gray-100 dark:border-purple-900/50 p-5 z-10 transition-all duration-200 animate-in zoom-in-95 font-pashto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-purple-900/30">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span className="font-semibold text-base">په شاعرۍ کې لټون (Search)</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-purple-900/30 text-gray-500 dark:text-gray-400 transition-colors"
            aria-label="بندول"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Box */}
        <div className="relative mt-4">
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                onExecuteSearch && onExecuteSearch();
                onClose();
              }
              if (e.key === 'Escape') {
                onClose();
              }
            }}
            placeholder="د شعر متن، د شاعر نوم، کټګوري یا موضوع وپلټئ..."
            className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-purple-950/30 border border-gray-200 dark:border-purple-900/40 rounded-2xl text-base text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            dir="auto"
          />
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            {searchQuery ? (
              <button
                onClick={() => onSearchChange('')}
                className="p-1 hover:bg-gray-200 dark:hover:bg-purple-900/50 rounded-full text-gray-500 transition-colors"
                title="پاکول"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <Search className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </div>

        {/* Pashto Special Letters helper bar */}
        <div className="mt-3 flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-gray-400 dark:text-purple-300/60 ml-1">پښتو توري:</span>
          {PASHTO_SPECIAL_LETTERS.map(letter => (
            <button
              key={letter}
              type="button"
              onClick={() => handleInsertLetter(letter)}
              className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-gray-800 dark:text-gray-200 text-sm font-semibold transition-colors flex items-center justify-center border border-gray-200/60 dark:border-purple-900/40 active:scale-95"
            >
              {letter}
            </button>
          ))}
        </div>

        {/* Popular Searches */}
        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-purple-900/30">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-purple-300/80 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>مشهور لټونونه:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {popularSearches.map(term => (
              <button
                key={term}
                onClick={() => {
                  onSearchChange(term);
                  onExecuteSearch && onExecuteSearch();
                  onClose();
                }}
                className="text-xs px-3 py-1.5 rounded-full bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 transition-colors border border-purple-100 dark:border-purple-800/40"
              >
                {term}
              </button>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-5 flex items-center justify-between text-xs text-gray-400">
          <span>د Enter په کېکاږلو سره پلټنه بشپړه کړئ</span>
          <button
            onClick={() => {
              onExecuteSearch && onExecuteSearch();
              onClose();
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors"
          >
            <span>لټون وکړئ</span>
            <CornerDownLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
