import React, { useState } from 'react';
import { Heart, Share2, Copy, Check, Eye, Tag, Calendar, Bookmark, BookmarkCheck } from 'lucide-react';
import { PoetryItem } from '../types/poetry';
import { useSettings } from '../context/SettingsContext';
import { useFavorites } from '../context/FavoritesContext';
import { useLikes } from '../context/LikesContext';

interface PoetryCardProps {
  poetry: PoetryItem;
  onShare: (poetry: PoetryItem) => void;
  onSelectPoet?: (poet: string) => void;
  onSelectCategory?: (category: string) => void;
  onCopySuccess: () => void;
  onBookmarkChange?: (isSaved: boolean) => void;
  onLikeChange?: (id: string, newLikes: number) => void;
}

export const PoetryCard: React.FC<PoetryCardProps> = ({
  poetry,
  onShare,
  onSelectPoet,
  onSelectCategory,
  onCopySuccess,
  onBookmarkChange,
  onLikeChange
}) => {
  const { settings } = useSettings();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isLiked, toggleLike } = useLikes();

  const [copied, setCopied] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [likesCount, setLikesCount] = useState<number>(poetry.likes || 0);

  const isSaved = isFavorite(poetry.id);
  const userHasLiked = isLiked(poetry.id);

  // Sync likes count with parent prop if updated
  React.useEffect(() => {
    setLikesCount(poetry.likes || 0);
  }, [poetry.likes]);

  // Split lines into verses (misras) for rhythmic, clean line-by-line presentation
  const verses = poetry.poetry_text.split('\n');

  const handleCopy = async () => {
    const textToCopy = `${poetry.title ? `${poetry.title}\n\n` : ''}${poetry.poetry_text}\n\n— ${poetry.poet_name}\n(پشتو شاعری - published by Yasir wazirwaal)`;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = textToCopy;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      onCopySuccess();
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed', err);
    }
  };

  const handleToggleBookmark = () => {
    const nextSaved = toggleFavorite(poetry.id);
    onBookmarkChange && onBookmarkChange(nextSaved);
  };

  const handleLikeClick = async () => {
    if (isLiking) return;
    setIsLiking(true);

    // Optimistic count update
    const nextCount = userHasLiked ? Math.max(0, likesCount - 1) : likesCount + 1;
    setLikesCount(nextCount);

    try {
      const result = await toggleLike(poetry.id);
      setLikesCount(result.likes);
      onLikeChange && onLikeChange(poetry.id, result.likes);
    } catch {
      // Revert if error
      setLikesCount(likesCount);
    } finally {
      setIsLiking(false);
    }
  };

  const handleShareClick = async () => {
    const shareText = `${poetry.title ? `${poetry.title}\n\n` : ''}${poetry.poetry_text}\n\n— ${poetry.poet_name}\n(پشتو شاعری - published by Yasir wazirwaal)`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: poetry.title || `شعر د ${poetry.poet_name}`,
          text: shareText,
          url: window.location.href
        });
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') return;
      }
    }
    // Fallback to share dialog
    onShare(poetry);
  };

  // Font size mapping based on settings
  const getFontSizeClass = () => {
    switch (settings.fontSize) {
      case 'small':
        return 'text-lg sm:text-xl leading-relaxed sm:leading-loose';
      case 'large':
        return 'text-2xl sm:text-3xl leading-[2.2] sm:leading-[2.4]';
      case 'medium':
      default:
        return 'text-xl sm:text-2xl leading-loose sm:leading-[2.2]';
    }
  };

  // Font family mapping
  const getFontFamilyClass = () => {
    switch (settings.fontFamily) {
      case 'amiri':
        return 'font-amiri';
      case 'scheherazade':
        return 'font-scheherazade';
      case 'noto':
      default:
        return 'font-pashto';
    }
  };

  // Spacing mapping based on settings
  const getPaddingClass = () => {
    switch (settings.cardSpacing) {
      case 'compact':
        return 'p-5 sm:p-7 my-3';
      case 'spacious':
        return 'p-8 sm:p-12 my-6';
      case 'normal':
      default:
        return 'p-6 sm:p-9 my-4';
    }
  };

  // Format date readable in Pashto or standard date
  const formatDate = (dateString: string) => {
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('ps-AF', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString.split('T')[0];
    }
  };

  return (
    <article
      className={`relative w-full max-w-2xl mx-auto rounded-3xl transition-all duration-300 ${getPaddingClass()} 
        bg-[#f4f1f8] dark:bg-[#211a2c] 
        border border-[#e7e0ef] dark:border-[#382b4a]
        card-soft-shadow hover:shadow-xl hover:border-purple-200 dark:hover:border-purple-800/60
        group`}
    >
      {/* Top Meta Header: Sequential Number, Category Badge & Title */}
      <div className="flex items-center justify-between gap-2 mb-4 text-xs font-pashto text-gray-500 dark:text-purple-300/70">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Sequential Number #1, #2, #3... */}
          <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full bg-purple-200/70 dark:bg-purple-900/60 text-purple-900 dark:text-purple-200 font-bold text-xs tracking-wider border border-purple-300/50 dark:border-purple-800/40">
            #{poetry.item_number}
          </span>

          {poetry.category && (
            <button
              onClick={() => onSelectCategory && onSelectCategory(poetry.category)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-800 dark:text-purple-200 border border-purple-200/50 dark:border-purple-800/40 font-semibold transition-colors"
            >
              <Tag className="w-3 h-3 text-purple-600 dark:text-purple-400" />
              <span>{poetry.category}</span>
            </button>
          )}

          {poetry.title && (
            <span className="font-semibold text-gray-700 dark:text-gray-300">
              {poetry.title}
            </span>
          )}
        </div>

        {/* Real Views counter (if > 0, otherwise real value) */}
        <div className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-purple-400/60">
          <Eye className="w-3.5 h-3.5" />
          <span>{poetry.views || 0}</span>
        </div>
      </div>

      {/* Main Poetry Text (Line-by-line with original line breaks preserved) */}
      <div className={`text-center my-6 sm:my-8 text-gray-900 dark:text-[#f8f6fb] ${getFontSizeClass()} ${getFontFamilyClass()} tracking-normal`}>
        {verses.map((verse, index) => (
          <p
            key={index}
            className="my-1.5 sm:my-2.5 transition-all text-gray-900 dark:text-gray-100 font-normal hover:text-purple-900 dark:hover:text-purple-200"
            dir="rtl"
          >
            {verse}
          </p>
        ))}
      </div>

      {/* Poet Attribution (only shown if poet name is provided) */}
      {poetry.poet_name && poetry.poet_name.trim() && (
        <div className="text-center mt-6 mb-4">
          <button
            onClick={() => onSelectPoet && onSelectPoet(poetry.poet_name)}
            className="inline-block text-base sm:text-lg font-bold text-purple-900 dark:text-purple-200 hover:text-purple-600 dark:hover:text-purple-400 font-pashto transition-colors group-hover:underline underline-offset-4 decoration-purple-400"
          >
            — {poetry.poet_name}
          </button>
        </div>
      )}

      {/* Tags if present */}
      {poetry.tags && poetry.tags.length > 0 && (
        <div className="flex items-center justify-center gap-1.5 flex-wrap my-3">
          {poetry.tags.map(tag => (
            <span
              key={tag}
              className="text-[11px] px-2 py-0.5 rounded-md bg-purple-100/50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300/80 font-pashto"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Divider */}
      <div className="w-24 h-px bg-purple-200/60 dark:bg-purple-900/50 mx-auto my-4" />

      {/* Card Footer: Date & Interactive Buttons */}
      <div className="flex items-center justify-between pt-1 text-xs text-gray-500 dark:text-purple-300/70 font-pashto">
        {/* Date added */}
        <div className="flex items-center gap-1.5 text-[11px] text-gray-400 dark:text-gray-500">
          <Calendar className="w-3.5 h-3.5" />
          <span>{formatDate(poetry.created_at)}</span>
        </div>

        {/* Action Buttons: Bookmark, Like, Copy, Share */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Bookmark / Save Button */}
          <button
            onClick={handleToggleBookmark}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-95 ${
              isSaved
                ? 'bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800'
                : 'hover:bg-purple-100/70 dark:hover:bg-purple-900/40 text-gray-600 dark:text-gray-300 border border-transparent'
            }`}
            title={isSaved ? 'له خوندي شوو لیرې کول' : 'شعر خوندي کړئ (Save)'}
            aria-label="خوندي کول"
          >
            {isSaved ? (
              <BookmarkCheck className="w-4 h-4 text-purple-600 dark:text-purple-400 fill-purple-600 dark:fill-purple-400" />
            ) : (
              <Bookmark className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            )}
          </button>

          {/* Like Button */}
          <button
            onClick={handleLikeClick}
            disabled={isLiking}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-95 ${
              userHasLiked
                ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50'
                : 'hover:bg-purple-100/70 dark:hover:bg-purple-900/40 text-gray-600 dark:text-gray-300 border border-transparent'
            }`}
            title={userHasLiked ? 'خوښول لغوه کړئ (Unlike)' : 'خوښول (Like)'}
            aria-label="خوښول"
          >
            <Heart
              className={`w-4 h-4 transition-transform ${
                userHasLiked ? 'fill-rose-500 text-rose-500 scale-110' : 'text-gray-500 dark:text-gray-400'
              }`}
            />
            <span>{likesCount}</span>
          </button>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold hover:bg-purple-100/70 dark:hover:bg-purple-900/40 text-gray-600 dark:text-gray-300 active:scale-95 transition-all"
            title="کاپی کول (Copy)"
            aria-label="کاپی کول"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-emerald-600 dark:text-emerald-400">کاپی شو</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span>کاپی</span>
              </>
            )}
          </button>

          {/* Share Button */}
          <button
            onClick={handleShareClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold hover:bg-purple-100/70 dark:hover:bg-purple-900/40 text-gray-600 dark:text-gray-300 active:scale-95 transition-all"
            title="شریکول (Share)"
            aria-label="شریکول"
          >
            <Share2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <span>شریکول</span>
          </button>
        </div>
      </div>
    </article>
  );
};
