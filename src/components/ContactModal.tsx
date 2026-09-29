import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { SocialContacts, DEFAULT_CONTACTS } from '../types/poetry';
import { WhatsAppIcon, FacebookIcon, TikTokIcon } from './AboutModal';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (msg: string) => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  const [contacts, setContacts] = useState<SocialContacts>(DEFAULT_CONTACTS);

  // Fetch contacts whenever modal opens
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

  const whatsappLink = formatWhatsAppUrl(contacts.whatsapp);
  const facebookLink = formatFacebookUrl(contacts.facebook);
  const tiktokLink = formatTikTokUrl(contacts.tiktok);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-200 animate-in fade-in"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md my-8 bg-white dark:bg-[#1d1728] text-gray-900 dark:text-gray-100 rounded-3xl shadow-2xl border border-gray-100 dark:border-purple-900/40 p-5 sm:p-7 z-10 max-h-[90vh] flex flex-col">
        {/* Modal Header: Category title is strictly "Contacts" with no other Pashto words */}
        <div className="flex items-center justify-between pb-3.5 border-b border-gray-100 dark:border-purple-900/30 shrink-0">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-sans tracking-tight text-gray-900 dark:text-white">
              Contacts
            </h2>
            <p className="text-xs text-purple-600 dark:text-purple-400 font-sans mt-0.5">
              WhatsApp • Facebook • TikTok
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-purple-900/30 text-gray-500 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Only functional social links, no email, no message form, no edit links */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#f8f6fc] to-[#f0e9f8] dark:from-[#231b31] dark:to-[#1a1426] border border-purple-200/80 dark:border-purple-900/50 shadow-sm text-center">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-1">
              {contacts.name || 'یاسر وزیروال (Yasir Wazirwaal)'}
            </h3>
            <p className="text-xs text-purple-700 dark:text-purple-300 font-medium mb-6">
              خپروونکی او ادبي همغږی کوونکی
            </p>

            {/* 3 Prominent Clickable Social Action Buttons: WhatsApp, Facebook, TikTok */}
            <div className="flex flex-col gap-3">
              {/* WhatsApp Button */}
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-sm hover:shadow transition-all active:scale-95 cursor-pointer select-none font-sans"
              >
                <WhatsAppIcon className="w-5 h-5 fill-white shrink-0" />
                <span>WhatsApp</span>
              </a>

              {/* Facebook Button */}
              <a
                href={facebookLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-sm hover:shadow transition-all active:scale-95 cursor-pointer select-none font-sans"
              >
                <FacebookIcon className="w-5 h-5 fill-white shrink-0" />
                <span>Facebook</span>
              </a>

              {/* TikTok Button */}
              <a
                href={tiktokLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl bg-black hover:bg-gray-800 text-white text-sm font-bold shadow-sm hover:shadow transition-all active:scale-95 border border-white/10 cursor-pointer select-none font-sans"
              >
                <TikTokIcon className="w-5 h-5 fill-white shrink-0" />
                <span>TikTok</span>
              </a>
            </div>
          </div>
        </div>

        {/* Modal Footer: Simple Close Button */}
        <div className="pt-3 border-t border-gray-100 dark:border-purple-900/30 flex items-center justify-end font-sans shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-gray-100 dark:bg-purple-950/60 hover:bg-gray-200 dark:hover:bg-purple-900/50 text-gray-700 dark:text-gray-200 text-xs font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
