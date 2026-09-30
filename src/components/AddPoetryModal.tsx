import React, { useState, useEffect } from 'react';
import { X, Plus, Send, Eye } from 'lucide-react';
import { CATEGORIES, FAMOUS_POETS, PoetryCategory, PoetryItem } from '../types/poetry';
import { submitNewPoetry } from '../services/apiService';

interface AddPoetryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPoetryAdded: (newPoetry: PoetryItem, message: string) => void;
  initialPoetName?: string;
}

export const AddPoetryModal: React.FC<AddPoetryModalProps> = ({
  isOpen,
  onClose,
  onPoetryAdded,
  initialPoetName
}) => {
  const [poetryText, setPoetryText] = useState('');
  const [poetName, setPoetName] = useState(initialPoetName || '');
  const [category, setCategory] = useState<PoetryCategory>('غزل');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Update poet name if initialPoetName changes
  useEffect(() => {
    if (initialPoetName) {
      setPoetName(initialPoetName);
    }
  }, [initialPoetName]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!poetryText.trim()) {
      setErrorMsg('مهرباني وکړئ د شعر متن داخل کړئ (Poetry text is required)');
      return;
    }

    // Poet name is NOT required - poetry can be saved without poet name as requested
    setIsSubmitting(true);

    try {
      const data = await submitNewPoetry({
        poetry_text: poetryText.trim(),
        poet_name: poetName.trim(), // Can be empty string
        category
      });

      // Success
      onPoetryAdded(data.data, data.message || 'شاعري په برياليتوب سره اضافه شوه');
      // Reset form
      setPoetryText('');
      setPoetName('');
      setShowPreview(false);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'شبکوي ستونزه. مهرباني وکړئ بیا هڅه وکړئ');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-200 animate-in fade-in"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-xl my-8 bg-white dark:bg-[#1e182a] text-gray-900 dark:text-gray-100 rounded-3xl shadow-2xl border border-gray-100 dark:border-purple-900/40 p-5 sm:p-7 z-10 transition-all duration-200 animate-in zoom-in-95 font-pashto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-purple-900/30 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-purple-700 dark:text-purple-300">
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold">شاعري اضافه کړئ (Add Poetry)</h2>
              <p className="text-xs text-purple-600 dark:text-purple-400">خپله يا د نامتو شاعر شاعري دلته خپره کړئ</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-purple-900/30 text-gray-500 dark:text-gray-400 transition-colors"
            aria-label="بندول"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs sm:text-sm">
              {errorMsg}
            </div>
          )}

          {/* Poetry Text (Required) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-gray-700 dark:text-purple-200">
                د شعر متن (Poetry Text) <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="text-xs text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{showPreview ? 'فورم وګورئ' : 'مخکتنه (Preview)'}</span>
              </button>
            </div>

            {showPreview ? (
              <div className="p-6 bg-[#f4f1f8] dark:bg-[#251d32] border border-purple-200 dark:border-purple-800/40 rounded-3xl text-center">
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 inline-block mb-3">
                  {category}
                </span>
                {poetryText ? (
                  poetryText.split('\n').map((line, idx) => (
                    <p key={idx} className="my-1.5 text-base sm:text-lg font-pashto text-gray-900 dark:text-gray-100">
                      {line}
                    </p>
                  ))
                ) : (
                  <p className="text-gray-400 italic text-sm">تر اوسه متن نه دی لیکل شوی</p>
                )}
                {poetName.trim() && (
                  <span className="block mt-4 text-sm font-bold text-purple-900 dark:text-purple-300">
                    — {poetName.trim()}
                  </span>
                )}
              </div>
            ) : (
              <textarea
                rows={6}
                value={poetryText}
                onChange={e => setPoetryText(e.target.value)}
                placeholder="شپه د سپوږمۍ په رڼا ښکلې ده&#10;زړه مې ستا په یاد کې ډوب دی..."
                className="w-full p-4 bg-gray-50 dark:bg-purple-950/30 border border-gray-200 dark:border-purple-900/40 rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-purple-500 leading-relaxed transition-all resize-y"
                required
                autoFocus
              />
            )}
          </div>

          {/* Poet Name (Optional - Can save without poet name) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-gray-700 dark:text-purple-200">
                د شاعر نوم (اختیاري / Poet Name - Optional)
              </label>
              <span className="text-[11px] text-gray-400">اختیاري</span>
            </div>
            <input
              type="text"
              value={poetName}
              onChange={e => setPoetName(e.target.value)}
              placeholder="د شاعر نوم ولیکئ (یا خالي پرېږدئ)..."
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-purple-950/30 border border-gray-200 dark:border-purple-900/40 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            />
            {/* Quick dropdown for all 34 famous poets */}
            <div className="mt-2">
              <select
                onChange={e => {
                  if (e.target.value) setPoetName(e.target.value);
                }}
                value=""
                className="w-full px-3.5 py-2 bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-900/50 rounded-xl text-xs text-purple-900 dark:text-purple-200 font-pashto cursor-pointer focus:outline-none"
              >
                <option value="" disabled>یا له ۳۴ نومياليو پښتو شاعرانو څخه نوم وټاکئ...</option>
                {FAMOUS_POETS.map(name => (
                  <option key={name} value={name} className="bg-white dark:bg-[#1e182a] text-gray-900 dark:text-gray-100">
                    {name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-purple-200 mb-1.5">
              کټګوري (Category)
            </label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value as PoetryCategory)}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-purple-950/30 border border-gray-200 dark:border-purple-900/40 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all cursor-pointer font-pashto"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat} className="bg-white dark:bg-[#1e182a] text-gray-900 dark:text-gray-100">
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons: Cancel and Save strictly in English */}
          <div className="pt-3 border-t border-gray-100 dark:border-purple-900/30 flex items-center justify-end gap-3 font-sans">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl border border-gray-200 dark:border-purple-900/40 hover:bg-gray-100 dark:hover:bg-purple-950/40 text-gray-700 dark:text-gray-300 text-sm font-semibold transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-95"
            >
              {isSubmitting ? (
                <span>Saving...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Save</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
