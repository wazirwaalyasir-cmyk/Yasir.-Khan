import React from 'react';
import { Menu, Search, Settings } from 'lucide-react';

interface HeaderProps {
  onOpenMenu: () => void;
  onOpenSearch: () => void;
  onOpenSettings: () => void;
  activeFilter?: string | null;
  onClearFilter?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMenu,
  onOpenSearch,
  onOpenSettings,
  activeFilter,
  onClearFilter
}) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-white/95 dark:bg-[#15121b]/95 backdrop-blur-md border-b border-gray-100 dark:border-purple-950/40 transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 sm:h-18 flex items-center justify-between relative">
        {/* Left Side: Three-line hamburger menu */}
        <div className="flex items-center">
          <button
            onClick={onOpenMenu}
            className="p-2 sm:p-2.5 rounded-full text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-purple-900/30 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-purple-400"
            aria-label="مینو پرانیستل (Open Menu)"
            title="مینو (Menu)"
          >
            <Menu className="w-6 h-6 stroke-[2.2]" />
          </button>
        </div>

        {/* Center: Website Title "پشتو شاعری" */}
        <div className="absolute left-1/2 -translate-x-1/2 text-center pointer-events-auto flex flex-col items-center">
          <h1 
            onClick={() => onClearFilter && onClearFilter()}
            className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white font-pashto cursor-pointer hover:opacity-90 transition-opacity select-none leading-tight"
          >
            پشتو شاعری
          </h1>
          <span className="text-[10px] sm:text-xs text-purple-700 dark:text-purple-300 font-medium tracking-wide">
            (published by Yasir wazirwaal)
          </span>
          {activeFilter && (
            <div className="flex items-center justify-center gap-1 mt-0.5">
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 font-pashto">
                {activeFilter}
              </span>
            </div>
          )}
        </div>

        {/* Right Side: Search & Settings Icons */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={onOpenSearch}
            className="p-2 sm:p-2.5 rounded-full text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-purple-900/30 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-purple-400"
            aria-label="لټون (Search)"
            title="لټون (Search)"
          >
            <Search className="w-5 h-5 sm:w-5.5 sm:h-5.5 stroke-[2.2]" />
          </button>

          <button
            onClick={onOpenSettings}
            className="p-2 sm:p-2.5 rounded-full text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-purple-900/30 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-purple-400"
            aria-label="ترتیبات (Settings)"
            title="ترتیبات (Settings)"
          >
            <Settings className="w-5 h-5 sm:w-5.5 sm:h-5.5 stroke-[2.2]" />
          </button>
        </div>
      </div>
    </header>
  );
};
