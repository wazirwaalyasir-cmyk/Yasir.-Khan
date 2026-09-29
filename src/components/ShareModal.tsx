import React from 'react';
import { X, Copy, Share2, MessageCircle, Facebook, Send, Check, Download, Image as ImageIcon, Loader2 } from 'lucide-react';
import { PoetryItem } from '../types/poetry';
import { generatePoetryImage, downloadDataUrl } from '../utils/imageExporter';
import { useSettings } from '../context/SettingsContext';

interface ShareModalProps {
  poetry: PoetryItem | null;
  isOpen: boolean;
  onClose: () => void;
  onCopySuccess: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  poetry,
  isOpen,
  onClose,
  onCopySuccess
}) => {
  const { settings } = useSettings();
  const [copied, setCopied] = React.useState(false);
  const [isGeneratingImg, setIsGeneratingImg] = React.useState(false);

  if (!isOpen || !poetry) return null;

  const poetLine = poetry.poet_name && poetry.poet_name.trim() ? `\n\n— ${poetry.poet_name.trim()}` : '';
  const shareText = `${poetry.title ? `${poetry.title}\n\n` : ''}${poetry.poetry_text}${poetLine}\n\nپشتو شاعری (Pashto Poetry)`;
  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://pashto-poetry.app';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      onCopySuccess();
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}&quote=${encodeURIComponent(shareText)}`;

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: poetry.title || `شعر د ${poetry.poet_name}`,
          text: shareText,
          url: currentUrl
        });
      } catch (err) {
        console.log('Share dismissed', err);
      }
    } else {
      handleCopy();
    }
  };

  const handleDownloadImage = async () => {
    setIsGeneratingImg(true);
    try {
      const themeMode = settings.theme === 'dark' ? 'dark' : 'light';
      const dataUrl = await generatePoetryImage(poetry, themeMode);
      downloadDataUrl(dataUrl, `pashto-poetry-${poetry.id}.png`);
    } catch (err) {
      console.error('Image export failed', err);
    } finally {
      setIsGeneratingImg(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-200 animate-in fade-in"
      />

      {/* Share Dialog */}
      <div className="relative w-full max-w-sm bg-white dark:bg-[#1f192b] text-gray-900 dark:text-gray-100 rounded-3xl shadow-2xl border border-gray-100 dark:border-purple-900/40 p-5 z-10 transition-all duration-200 animate-in zoom-in-95 font-pashto">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-purple-900/30">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h3 className="font-bold text-base">د شعر شریکول (Share Poetry)</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-purple-900/30 text-gray-500"
            aria-label="بندول"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Poetry Preview Box */}
        <div className="my-4 p-3.5 bg-purple-50/70 dark:bg-purple-950/30 rounded-2xl border border-purple-100 dark:border-purple-900/40 text-center">
          <p className="text-sm font-medium line-clamp-3 text-gray-800 dark:text-purple-200 leading-relaxed whitespace-pre-line">
            {poetry.poetry_text}
          </p>
          <span className="block mt-2 text-xs text-purple-700 dark:text-purple-400 font-semibold">
            — {poetry.poet_name}
          </span>
        </div>

        {/* Download as Image Button */}
        <button
          onClick={handleDownloadImage}
          disabled={isGeneratingImg}
          className="w-full mb-3 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-sm font-bold shadow-md transition-all active:scale-95 disabled:opacity-50"
        >
          {isGeneratingImg ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>د انځور جوړولو په حال کې...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>د شعر انځور ډاونلوډول (Save Image)</span>
            </>
          )}
        </button>

        {/* Share buttons grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl bg-gray-100 dark:bg-purple-950/50 hover:bg-purple-100 dark:hover:bg-purple-900/50 text-gray-800 dark:text-gray-200 text-xs sm:text-sm font-semibold transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
            <span>{copied ? 'کاپی شو!' : 'متن کاپی کول'}</span>
          </button>

          {/* WhatsApp */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm font-semibold transition-colors"
          >
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <span>واټساپ</span>
          </a>

          {/* Facebook */}
          <a
            href={facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-800 dark:text-blue-300 text-xs sm:text-sm font-semibold transition-colors"
          >
            <Facebook className="w-4 h-4 text-blue-600" />
            <span>فېسبوک</span>
          </a>

          {/* Native Web Share */}
          <button
            onClick={handleNativeShare}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl bg-purple-100 dark:bg-purple-900/60 hover:bg-purple-200 text-purple-900 dark:text-purple-100 text-xs sm:text-sm font-semibold transition-colors"
          >
            <Send className="w-4 h-4" />
            <span>نور آپشنونه</span>
          </button>
        </div>
      </div>
    </div>
  );
};
