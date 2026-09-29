import React, { useEffect, useState } from 'react';
import { X, BookOpen, Sparkles, MessageCircle, Share2, Mail, ExternalLink, ShieldCheck } from 'lucide-react';
import { SocialContacts, DEFAULT_CONTACTS } from '../types/poetry';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenContact?: () => void;
}

// Inline brand SVGs for WhatsApp, Facebook, TikTok
export const WhatsAppIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.031 2C6.511 2 2.016 6.48 2.016 11.983c0 1.845.508 3.633 1.472 5.197L2 22l4.981-1.442a9.948 9.948 0 005.05 1.425h.004c5.517 0 10.015-4.48 10.015-9.983C22.05 6.48 17.552 2 12.031 2zm0 18.257h-.003a8.27 8.27 0 01-4.22-1.156l-.303-.18-2.96.857.868-2.883-.198-.316a8.243 8.243 0 01-1.267-4.436c0-4.57 3.73-8.288 8.31-8.288 2.217 0 4.301.862 5.867 2.426a8.22 8.22 0 012.43 5.862c0 4.57-3.73 8.288-8.516 8.288zm4.56-6.197c-.25-.125-1.477-.728-1.706-.811-.229-.083-.396-.125-.562.125-.167.25-.646.812-.792.979-.146.166-.292.187-.542.062-.25-.125-1.055-.389-2.01-1.239-.743-.663-1.246-1.482-1.392-1.732-.146-.25-.015-.385.11-.51.112-.112.25-.291.375-.437.125-.146.167-.25.25-.417.083-.166.042-.312-.021-.437-.062-.125-.562-1.354-.771-1.854-.203-.488-.41-.422-.562-.43-.146-.008-.313-.01-.479-.01-.167 0-.438.063-.667.313-.229.25-.875.854-.875 2.083s.896 2.417 1.021 2.583c.125.167 1.765 2.694 4.276 3.777.597.258 1.064.412 1.428.528.6.191 1.147.164 1.58.099.482-.072 1.477-.604 1.685-1.188.208-.583.208-1.083.146-1.187-.063-.105-.229-.167-.479-.292z" />
  </svg>
);

export const FacebookIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

export const TikTokIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-1.01-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 2.89 3.46 2.75 1.13-.01 2.2-.66 2.7-1.68.27-.53.37-1.13.37-1.72.02-4.58-.02-9.16.02-13.74.01-.19-.01-.38-.01-.57z" />
  </svg>
);

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose, onOpenContact }) => {
  const [contacts, setContacts] = useState<SocialContacts>(DEFAULT_CONTACTS);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/contacts')
        .then(res => res.json())
        .then(data => {
          if (data && typeof data === 'object') {
            setContacts(prev => ({ ...prev, ...data }));
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const formatWhatsAppUrl = (raw?: string) => {
    if (!raw || !raw.trim()) return 'https://wa.me/93700000000';
    const trimmed = raw.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
    if (trimmed.startsWith('wa.me/')) return `https://${trimmed}`;
    const digits = trimmed.replace(/[^0-9]/g, '');
    return digits ? `https://wa.me/${digits}` : 'https://wa.me/93700000000';
  };

  const formatFacebookUrl = (raw?: string) => {
    const fallback = 'https://www.facebook.com/share/19hDDMwzmb/?mibextid=wwXIfr';
    if (!raw || !raw.trim()) return fallback;
    const trimmed = raw.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
    if (trimmed.startsWith('www.')) return `https://${trimmed}`;
    if (trimmed.startsWith('facebook.com/')) return `https://www.${trimmed}`;
    return `https://www.facebook.com/${trimmed.replace(/^@/, '')}`;
  };

  const formatTikTokUrl = (raw?: string) => {
    const fallback = 'https://www.tiktok.com/@yasirwazirwaal1';
    if (!raw || !raw.trim()) return fallback;
    const trimmed = raw.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
    if (trimmed.startsWith('www.')) return `https://${trimmed}`;
    if (trimmed.startsWith('tiktok.com/')) return `https://www.${trimmed}`;
    return `https://www.tiktok.com/@${trimmed.replace(/^@/, '')}`;
  };

  const whatsappUrl = formatWhatsAppUrl(contacts.whatsapp);
  const facebookUrl = formatFacebookUrl(contacts.facebook);
  const tiktokUrl = formatTikTokUrl(contacts.tiktok);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-200 animate-in fade-in"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-white dark:bg-[#1d1728] text-gray-900 dark:text-gray-100 rounded-3xl shadow-2xl border border-gray-100 dark:border-purple-900/40 p-6 z-10 font-pashto max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-purple-900/30">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-purple-700 dark:text-purple-300">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">د خپروونکي په اړه (About Publisher)</h2>
              <p className="text-xs text-purple-600 dark:text-purple-400">یاسر وزیروال • پشتو شاعري</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-purple-900/30 text-gray-500"
            aria-label="بندول"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-4 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
          {/* Official Publisher Bio text requested by user */}
          <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/70 dark:border-purple-900/40 text-gray-800 dark:text-purple-100 space-y-3 shadow-sm">
            <p className="leading-relaxed font-medium">
              یاسر وزیروال د پښتو ژبې او پښتو شاعرۍ له مینې سره د دې ادبي پلاتفورم د جوړولو او خپرولو هڅه کړې ده. د دې پلاتفورم موخه دا ده چې د پښتو شاعرۍ، ادبي اثارو او شاعرانو لپاره یو ساده، ښکلی او د لاسرسي وړ ځای برابر شي.
            </p>
            <p className="leading-relaxed font-medium">
              دلته هڅه کېږي چې پښتو شعرونه په منظم ډول راټول، خوندي او له لوستونکو سره شریک شي، څو د پښتو ژبې ادب او شاعرۍ ته لا ډېره پاملرنه وشي.
            </p>
          </div>

          {/* Publisher Identity Card & Social Accounts */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#f8f6fc] to-[#f2ecfa] dark:from-[#231b31] dark:to-[#1a1426] border border-purple-200/80 dark:border-purple-900/50">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div>
                <span className="text-[11px] text-purple-600 dark:text-purple-400 font-bold uppercase tracking-wider block">
                  خپروونکی او ادبي همغږی کوونکی
                </span>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  {contacts.name || 'یاسر وزیروال (Yasir Wazirwaal)'}
                </h3>
              </div>
              <div className="w-8 h-8 rounded-full bg-purple-600/10 dark:bg-purple-400/10 flex items-center justify-center text-purple-600 dark:text-purple-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>

            <p className="text-xs text-gray-600 dark:text-gray-300 mb-3">
              له خپروونکي سره په لاندې ټولنیزو شبکو او اړیکو کې اړیکه ونیسئ:
            </p>

            {/* Social Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              {/* WhatsApp */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all active:scale-95 cursor-pointer select-none"
              >
                <WhatsAppIcon className="w-4 h-4 fill-white shrink-0" />
                <span>WhatsApp</span>
              </a>

              {/* Facebook */}
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all active:scale-95 cursor-pointer select-none"
              >
                <FacebookIcon className="w-4 h-4 fill-white shrink-0" />
                <span>Facebook</span>
              </a>

              {/* TikTok */}
              <a
                href={tiktokUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-black hover:bg-gray-800 text-white text-xs font-semibold shadow-sm transition-all active:scale-95 border border-white/10 cursor-pointer select-none"
              >
                <TikTokIcon className="w-4 h-4 fill-white shrink-0" />
                <span>TikTok</span>
              </a>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-gray-100 dark:border-purple-900/30 flex items-center justify-between">
          {onOpenContact && (
            <button
              onClick={() => {
                onClose();
                onOpenContact();
              }}
              className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 font-sans"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Contacts</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-colors mr-auto"
          >
            تړل
          </button>
        </div>
      </div>
    </div>
  );
};
