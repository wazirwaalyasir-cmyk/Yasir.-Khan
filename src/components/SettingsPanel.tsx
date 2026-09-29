import React from 'react';
import { X, Sun, Moon, Monitor, Type, Layout, AlignRight, AlignLeft, RotateCcw } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings, resetSettings } = useSettings();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-200 animate-in fade-in"
      />

      {/* Settings Modal */}
      <div className="relative w-full max-w-md bg-white dark:bg-[#1c1728] text-gray-900 dark:text-gray-100 rounded-3xl shadow-2xl border border-gray-100 dark:border-purple-900/40 p-5 sm:p-6 z-10 transition-all duration-200 animate-in zoom-in-95 font-pashto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-purple-900/30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-purple-600 dark:text-purple-300">
              <Type className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold">ترتیبات او بڼه (Settings)</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-purple-900/30 text-gray-500 dark:text-gray-400 transition-colors"
            aria-label="بندول"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-5 max-h-[75vh] overflow-y-auto pr-1">
          {/* 1. Theme Selection: Light / Dark / System */}
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-purple-300/80 mb-2 uppercase tracking-wider">
              بڼه او رنګ (Theme / Mode)
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => updateSettings({ theme: 'light' })}
                className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-2xl border text-sm font-medium transition-all ${
                  settings.theme === 'light'
                    ? 'border-purple-600 bg-purple-50 text-purple-900 shadow-sm'
                    : 'border-gray-200 dark:border-purple-900/40 hover:bg-gray-50 dark:hover:bg-purple-950/30 text-gray-700 dark:text-gray-300'
                }`}
              >
                <Sun className={`w-5 h-5 ${settings.theme === 'light' ? 'text-purple-600' : 'text-amber-500'}`} />
                <span>رڼا (Light)</span>
              </button>

              <button
                type="button"
                onClick={() => updateSettings({ theme: 'dark' })}
                className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-2xl border text-sm font-medium transition-all ${
                  settings.theme === 'dark'
                    ? 'border-purple-500 bg-purple-950 text-purple-200 shadow-sm'
                    : 'border-gray-200 dark:border-purple-900/40 hover:bg-gray-50 dark:hover:bg-purple-950/30 text-gray-700 dark:text-gray-300'
                }`}
              >
                <Moon className={`w-5 h-5 ${settings.theme === 'dark' ? 'text-purple-300' : 'text-indigo-400'}`} />
                <span>تیاره (Dark)</span>
              </button>

              <button
                type="button"
                onClick={() => updateSettings({ theme: 'system' })}
                className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-2xl border text-sm font-medium transition-all ${
                  settings.theme === 'system'
                    ? 'border-purple-600 bg-purple-50 dark:bg-purple-950 text-purple-900 dark:text-purple-200 shadow-sm'
                    : 'border-gray-200 dark:border-purple-900/40 hover:bg-gray-50 dark:hover:bg-purple-950/30 text-gray-700 dark:text-gray-300'
                }`}
              >
                <Monitor className="w-5 h-5 text-gray-500" />
                <span>سیسټم (Auto)</span>
              </button>
            </div>
          </div>

          {/* 2. Font Size: Small / Medium / Large */}
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-purple-300/80 mb-2 uppercase tracking-wider">
              د لیک اندازه (Font Size)
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => updateSettings({ fontSize: 'small' })}
                className={`py-2.5 px-3 rounded-2xl border text-sm font-medium transition-all text-center ${
                  settings.fontSize === 'small'
                    ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/70 text-purple-800 dark:text-purple-200 font-semibold'
                    : 'border-gray-200 dark:border-purple-900/40 hover:bg-gray-50 dark:hover:bg-purple-950/30'
                }`}
              >
                کوچنی (Small)
              </button>

              <button
                type="button"
                onClick={() => updateSettings({ fontSize: 'medium' })}
                className={`py-2.5 px-3 rounded-2xl border text-sm font-medium transition-all text-center ${
                  settings.fontSize === 'medium'
                    ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/70 text-purple-800 dark:text-purple-200 font-semibold'
                    : 'border-gray-200 dark:border-purple-900/40 hover:bg-gray-50 dark:hover:bg-purple-950/30'
                }`}
              >
                منځنی (Medium)
              </button>

              <button
                type="button"
                onClick={() => updateSettings({ fontSize: 'large' })}
                className={`py-2.5 px-3 rounded-2xl border text-sm font-medium transition-all text-center ${
                  settings.fontSize === 'large'
                    ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/70 text-purple-800 dark:text-purple-200 font-semibold'
                    : 'border-gray-200 dark:border-purple-900/40 hover:bg-gray-50 dark:hover:bg-purple-950/30'
                }`}
              >
                لوی (Large)
              </button>
            </div>
          </div>

          {/* 3. Card Size / Spacing */}
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-purple-300/80 mb-2 uppercase tracking-wider">
              د شعر کارت اندازه (Card Spacing)
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => updateSettings({ cardSpacing: 'compact' })}
                className={`py-2 px-2.5 rounded-2xl border text-xs sm:text-sm font-medium transition-all text-center ${
                  settings.cardSpacing === 'compact'
                    ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/70 text-purple-800 dark:text-purple-200 font-semibold'
                    : 'border-gray-200 dark:border-purple-900/40 hover:bg-gray-50 dark:hover:bg-purple-950/30'
                }`}
              >
                تړلی (Compact)
              </button>

              <button
                type="button"
                onClick={() => updateSettings({ cardSpacing: 'normal' })}
                className={`py-2 px-2.5 rounded-2xl border text-xs sm:text-sm font-medium transition-all text-center ${
                  settings.cardSpacing === 'normal'
                    ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/70 text-purple-800 dark:text-purple-200 font-semibold'
                    : 'border-gray-200 dark:border-purple-900/40 hover:bg-gray-50 dark:hover:bg-purple-950/30'
                }`}
              >
                معیاري (Normal)
              </button>

              <button
                type="button"
                onClick={() => updateSettings({ cardSpacing: 'spacious' })}
                className={`py-2 px-2.5 rounded-2xl border text-xs sm:text-sm font-medium transition-all text-center ${
                  settings.cardSpacing === 'spacious'
                    ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/70 text-purple-800 dark:text-purple-200 font-semibold'
                    : 'border-gray-200 dark:border-purple-900/40 hover:bg-gray-50 dark:hover:bg-purple-950/30'
                }`}
              >
                فراخ (Spacious)
              </button>
            </div>
          </div>

          {/* 4. Font Family */}
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-purple-300/80 mb-2 uppercase tracking-wider">
              د لیکلو رسم الخط (Calligraphy Font)
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => updateSettings({ fontFamily: 'noto' })}
                className={`py-2 px-2 rounded-2xl border text-xs sm:text-sm transition-all text-center font-pashto ${
                  settings.fontFamily === 'noto'
                    ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/70 text-purple-800 dark:text-purple-200 font-bold'
                    : 'border-gray-200 dark:border-purple-900/40 hover:bg-gray-50 dark:hover:bg-purple-950/30'
                }`}
              >
                نسخ (Noto Naskh)
              </button>

              <button
                type="button"
                onClick={() => updateSettings({ fontFamily: 'amiri' })}
                className={`py-2 px-2 rounded-2xl border text-xs sm:text-sm transition-all text-center font-amiri ${
                  settings.fontFamily === 'amiri'
                    ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/70 text-purple-800 dark:text-purple-200 font-bold'
                    : 'border-gray-200 dark:border-purple-900/40 hover:bg-gray-50 dark:hover:bg-purple-950/30'
                }`}
              >
                امیري (Amiri)
              </button>

              <button
                type="button"
                onClick={() => updateSettings({ fontFamily: 'scheherazade' })}
                className={`py-2 px-2 rounded-2xl border text-xs sm:text-sm transition-all text-center font-scheherazade ${
                  settings.fontFamily === 'scheherazade'
                    ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/70 text-purple-800 dark:text-purple-200 font-bold'
                    : 'border-gray-200 dark:border-purple-900/40 hover:bg-gray-50 dark:hover:bg-purple-950/30'
                }`}
              >
                شهرزاد (Scheherazade)
              </button>
            </div>
          </div>

          {/* 5. Direction: RTL / LTR */}
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-purple-300/80 mb-2 uppercase tracking-wider">
              د لیکنې لوری (Direction)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => updateSettings({ direction: 'rtl' })}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl border text-sm font-medium transition-all ${
                  settings.direction === 'rtl'
                    ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/70 text-purple-800 dark:text-purple-200 font-semibold'
                    : 'border-gray-200 dark:border-purple-900/40 hover:bg-gray-50 dark:hover:bg-purple-950/30'
                }`}
              >
                <AlignRight className="w-4 h-4" />
                <span>ښي څخه کیڼ (RTL)</span>
              </button>

              <button
                type="button"
                onClick={() => updateSettings({ direction: 'ltr' })}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl border text-sm font-medium transition-all ${
                  settings.direction === 'ltr'
                    ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/70 text-purple-800 dark:text-purple-200 font-semibold'
                    : 'border-gray-200 dark:border-purple-900/40 hover:bg-gray-50 dark:hover:bg-purple-950/30'
                }`}
              >
                <AlignLeft className="w-4 h-4" />
                <span>کیڼ څخه ښي (LTR)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-gray-100 dark:border-purple-900/30 flex items-center justify-between">
          <button
            type="button"
            onClick={resetSettings}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>اصلي ترتیبات (Reset)</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold transition-colors"
          >
            بشپړ شو (Done)
          </button>
        </div>
      </div>
    </div>
  );
};
