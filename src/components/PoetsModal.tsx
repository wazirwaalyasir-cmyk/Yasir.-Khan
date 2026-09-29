import React, { useState, useMemo } from 'react';
import {
  X,
  Feather,
  Users,
  Search,
  Plus,
  Heart,
  ChevronDown,
  ChevronLeft,
  Quote,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { FAMOUS_POETS } from '../types/poetry';
import { POET_BIOGRAPHIES, PoetBio } from '../data/poetBios';

interface PoetItem {
  name: string;
  count: number;
}

interface PoetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  poets: PoetItem[];
  selectedPoet: string | null;
  onSelectPoet: (poetName: string | null) => void;
  onOpenAddPoetry?: (poetName?: string) => void;
  onPoetAdded?: (poetName: string) => void;
}

export const PoetsModal: React.FC<PoetsModalProps> = ({
  isOpen,
  onClose,
  poets,
  selectedPoet,
  onSelectPoet,
  onOpenAddPoetry,
  onPoetAdded
}) => {
  const [expandedPoet, setExpandedPoet] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingPoet, setIsAddingPoet] = useState(false);
  const [newPoetName, setNewPoetName] = useState('');
  const [isSubmittingPoet, setIsSubmittingPoet] = useState(false);
  const [addPoetError, setAddPoetError] = useState<string | null>(null);
  const [addPoetSuccess, setAddPoetSuccess] = useState<string | null>(null);

  // Merge provided poets with the complete 34 FAMOUS_POETS
  const allPoetsList = useMemo(() => {
    const map = new Map<string, number>();

    // 1. First ensure all 34 FAMOUS_POETS exist with at least 0
    FAMOUS_POETS.forEach(name => {
      map.set(name, 0);
    });

    // 2. Overlay actual counts from server poets
    poets.forEach(p => {
      map.set(p.name, p.count);
    });

    const list: PoetItem[] = Array.from(map.entries()).map(([name, count]) => ({
      name,
      count
    }));

    // Sort: poets with poems first, then maintain standard order
    list.sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      const indexA = FAMOUS_POETS.indexOf(a.name);
      const indexB = FAMOUS_POETS.indexOf(b.name);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return a.name.localeCompare(b.name, 'ps');
    });

    return list;
  }, [poets]);

  // Filtered by search
  const filteredPoets = useMemo(() => {
    if (!searchQuery.trim()) return allPoetsList;
    const q = searchQuery.trim().toLowerCase();
    return allPoetsList.filter(p => p.name.toLowerCase().includes(q));
  }, [allPoetsList, searchQuery]);

  if (!isOpen) return null;

  // Handle Add New Poet
  const handleAddNewPoet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPoetName.trim()) return;
    setAddPoetError(null);
    setAddPoetSuccess(null);
    setIsSubmittingPoet(true);

    try {
      const res = await fetch('/api/poets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newPoetName.trim() })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'د نوي شاعر په اضافه کولو کې ستونزه راغله');
      }

      setAddPoetSuccess(`«${newPoetName.trim()}» په برياليتوب سره اضافه شو!`);
      if (onPoetAdded) {
        onPoetAdded(newPoetName.trim());
      }
      const added = newPoetName.trim();
      setNewPoetName('');
      setTimeout(() => {
        setIsAddingPoet(false);
        setAddPoetSuccess(null);
      }, 1500);
    } catch (err: any) {
      setAddPoetError(err.message || 'ستونزه رامنځته شوه');
    } finally {
      setIsSubmittingPoet(false);
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
      <div className="relative w-full max-w-2xl my-6 bg-white dark:bg-[#1e172a] text-gray-900 dark:text-gray-100 rounded-3xl shadow-2xl border border-gray-100 dark:border-purple-900/40 p-5 sm:p-7 z-10 font-pashto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-gray-100 dark:border-purple-900/30 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-purple-700 dark:text-purple-300">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold">پښتو شاعران (مشهور شاعران)</h2>
              <p className="text-xs text-purple-600 dark:text-purple-400">
                د پښتو ژبې د نامتو او کلاسیکو شاعرانو بشپړ نوملړ
              </p>
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

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto py-3 space-y-4 pr-1">
          {/* UPSIDE OFFICIAL NOTICE CARD AS REQUESTED BY USER */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-purple-50 via-[#f9f5ff] to-purple-100/60 dark:from-[#241a35] dark:via-[#1f172e] dark:to-[#2a1d40] border border-purple-200 dark:border-purple-800/50 shadow-sm space-y-3 text-xs sm:text-sm leading-relaxed text-gray-800 dark:text-purple-100">
            <div className="flex items-center justify-between gap-2 border-b border-purple-200/60 dark:border-purple-800/40 pb-2">
              <span className="font-bold text-sm text-purple-900 dark:text-purple-200 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>د پښتو شاعرانو په اړه ځانګړی پيغام</span>
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-200/80 dark:bg-purple-900/70 text-purple-800 dark:text-purple-200 font-semibold">
                پښتو شاعري
              </span>
            </div>

            <p className="leading-relaxed">
              په دې ویب‌سایټ کې شامل ټول شاعران د پښتو ژبې له شاعرانو څخه دي. له تاسو څخه په درنښت غوښتنه کوو چې د خپلې پوهې او معلوماتو له مخې د هغو شاعرانو شاعري، شعرونه او بیتونه له موږ سره شریک کړئ چې تاسو یې پېژنئ.
            </p>

            <p className="leading-relaxed">
              که د کوم شاعر شعر، غزل، نظم، ټپه یا بل ادبي اثر درسره موجود وي، نو مهرباني وکړئ د شاعر سم نوم او د هغه شعر ولیکئ او زموږ د «شاعري اضافه کړئ» (+) له لارې یې ویب‌سایټ ته اضافه کړئ.
            </p>

            <p className="leading-relaxed">
              ستاسو د ونډې په مرسته به د پښتو شاعرۍ دا ویب‌سایټ لا بشپړ شي او د پښتو ادب، شاعرانو او د هغوی د شاعرۍ لپاره به یوه جامع ذخیره جوړه شي.
            </p>

            <p className="font-semibold text-purple-900 dark:text-purple-200 flex items-center gap-1.5 pt-1">
              <span>راځئ چې په ګډه د پښتو شاعرۍ خزانه ژوندۍ وساتو او راتلونکو نسلونو ته یې ورسوو.</span>
              <span className="text-rose-500 text-base">❤️</span>
            </p>

            <div className="pt-2 border-t border-purple-200/60 dark:border-purple-800/40 text-[11px] sm:text-xs text-amber-900 dark:text-amber-200/90 font-medium">
              <strong>یادونه:</strong> مهرباني وکړئ یوازې هغه شعرونه اضافه کړئ چې د شاعر نوم یې درته معلوم وي، او د بل چا شعر د خپل شعر په توګه مه خپروئ.
            </div>

            {/* Quick Action in Banner: Add Poetry with + button */}
            <div className="pt-2 flex items-center justify-end gap-2">
              {onOpenAddPoetry && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAddPoetry();
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm transition-all active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>شاعري اضافه کړئ (+)</span>
                </button>
              )}
            </div>
          </div>

          {/* Action Bar: Search Poets + Option: (Add شاعر) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="د شاعر نوم ولټوئ (مثال: رحمان بابا، غني خان...)"
                className="w-full pr-10 pl-4 py-2 bg-gray-50 dark:bg-purple-950/30 border border-gray-200 dark:border-purple-900/40 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-pashto"
              />
            </div>

            {/* "add شاعر" / "شاعر اضافه کړئ" Button */}
            <button
              type="button"
              onClick={() => {
                setIsAddingPoet(!isAddingPoet);
                setAddPoetError(null);
                setAddPoetSuccess(null);
              }}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm hover:shadow transition-all active:scale-95 shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>شاعر اضافه کړئ (Add Poet)</span>
            </button>
          </div>

          {/* New Poet Input Form (Shown when Add Poet is clicked) */}
          {isAddingPoet && (
            <div className="p-4 rounded-2xl bg-purple-50/80 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 animate-in fade-in space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-900 dark:text-purple-200 flex items-center gap-1.5">
                  <Feather className="w-4 h-4 text-purple-600" />
                  <span>د نوي پښتو شاعر اضافه کول (Add New Poet)</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsAddingPoet(false)}
                  className="text-gray-400 hover:text-gray-600 text-xs"
                >
                  بندول
                </button>
              </div>

              {addPoetError && (
                <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold">{addPoetError}</p>
              )}
              {addPoetSuccess && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{addPoetSuccess}</span>
                </p>
              )}

              <form onSubmit={handleAddNewPoet} className="flex gap-2">
                <input
                  type="text"
                  value={newPoetName}
                  onChange={e => setNewPoetName(e.target.value)}
                  placeholder="د نوي شاعر بشپړ نوم داخل کړئ..."
                  className="flex-1 px-3.5 py-2 bg-white dark:bg-[#1a1426] border border-purple-200 dark:border-purple-800 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 font-pashto"
                  required
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={isSubmittingPoet || !newPoetName.trim()}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-bold transition-all active:scale-95 shrink-0"
                >
                  {isSubmittingPoet ? 'د اضافه کولو په حال کې...' : 'اضافه کړئ'}
                </button>
              </form>
            </div>
          )}

          {/* Current Active Poet Filter Bar */}
          {selectedPoet && (
            <div className="p-3 rounded-2xl bg-purple-100/70 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/50 flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5">
                <span className="text-gray-600 dark:text-gray-300">اوسنی ټاکل شوی شاعر:</span>
                <strong className="text-purple-800 dark:text-purple-200 text-sm font-bold">
                  {selectedPoet}
                </strong>
              </span>
              <button
                onClick={() => {
                  onSelectPoet(null);
                  onClose();
                }}
                className="text-rose-600 dark:text-rose-400 font-bold hover:underline"
              >
                فیلټر پاک کړئ
              </button>
            </div>
          )}

          {/* Poets List Header */}
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-purple-300/70 px-1 pt-1">
            <span>ټول شاعران ({filteredPoets.length})</span>
            <span>د شعرونو شمېر او ژوندلیک</span>
          </div>

          {/* Poets List */}
          <div className="space-y-2">
            {filteredPoets.length === 0 ? (
              <div className="py-8 text-center text-gray-400 text-sm">
                د «{searchQuery}» په نوم هیڅ شاعر ونه موندل شو.
              </div>
            ) : (
              filteredPoets.map((item, idx) => {
                const isSelected = selectedPoet === item.name;
                const isExpanded = expandedPoet === item.name;
                const bio: PoetBio | undefined =
                  POET_BIOGRAPHIES[item.name] ||
                  (item.name === 'حوشحال حان حٹک' ? POET_BIOGRAPHIES['خوشحال خان خټک'] : undefined);

                return (
                  <div
                    key={item.name}
                    className={`rounded-2xl border transition-all ${
                      isSelected
                        ? 'border-purple-600 bg-purple-50/70 dark:bg-purple-950/70 shadow-sm'
                        : 'border-gray-100 dark:border-purple-900/30 bg-gray-50/40 dark:bg-purple-950/20 hover:border-purple-200 dark:hover:border-purple-800/50'
                    }`}
                  >
                    <div className="flex items-center justify-between p-3 sm:p-3.5">
                      <div
                        onClick={() => setExpandedPoet(isExpanded ? null : item.name)}
                        className="flex items-center gap-3 cursor-pointer flex-1 select-none"
                      >
                        <div className="w-9 h-9 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center text-purple-700 dark:text-purple-300 font-bold text-xs shrink-0">
                          {idx + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                              {item.name}
                            </span>
                            {bio && (
                              <span className="text-[11px] text-purple-600 dark:text-purple-400 font-medium">
                                ({bio.title})
                              </span>
                            )}
                          </div>
                          {bio && (
                            <span className="text-[11px] text-gray-400 dark:text-gray-400 block mt-0.5">
                              {bio.era}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* Select/View Poetry for this Poet */}
                        <button
                          type="button"
                          onClick={() => {
                            onSelectPoet(item.name);
                            onClose();
                          }}
                          className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all active:scale-95 ${
                            isSelected
                              ? 'bg-purple-600 text-white shadow-sm'
                              : item.count > 0
                              ? 'bg-purple-100 dark:bg-purple-900/50 hover:bg-purple-600 hover:text-white text-purple-800 dark:text-purple-200'
                              : 'bg-gray-100 dark:bg-purple-950/40 text-gray-600 dark:text-purple-300 hover:bg-purple-600 hover:text-white'
                          }`}
                        >
                          {item.count > 0 ? `${item.count} شعرونه` : 'کتل'}
                        </button>

                        {/* Add Poetry button for this specific poet if they have 0 or want to add more */}
                        {onOpenAddPoetry && (
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              onOpenAddPoetry(item.name);
                            }}
                            className="p-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-200 dark:hover:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs transition-colors"
                            title={`د ${item.name} شاعري اضافه کړئ`}
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {bio && (
                          <button
                            type="button"
                            onClick={() => setExpandedPoet(isExpanded ? null : item.name)}
                            className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-purple-900/40 text-gray-400 transition-colors"
                            title="ژوندلیک کتل"
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-purple-600" />
                            ) : (
                              <ChevronLeft className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Expanded Bio Section */}
                    {bio && isExpanded && (
                      <div className="px-4 pb-4 pt-1 border-t border-purple-100 dark:border-purple-900/30 text-xs sm:text-sm text-gray-700 dark:text-gray-300 space-y-2.5 animate-in fade-in">
                        <p className="leading-relaxed bg-white/70 dark:bg-purple-950/40 p-3 rounded-xl border border-purple-100/60 dark:border-purple-900/30">
                          {bio.description}
                        </p>
                        {bio.famousQuote && (
                          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-purple-100/60 dark:bg-purple-900/30 text-purple-900 dark:text-purple-200 font-medium">
                            <Quote className="w-4 h-4 shrink-0 text-purple-600" />
                            <span className="italic">«{bio.famousQuote}»</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between pt-1">
                          <button
                            onClick={() => {
                              onSelectPoet(item.name);
                              onClose();
                            }}
                            className="inline-flex items-center gap-1.5 text-xs text-purple-700 dark:text-purple-300 font-bold hover:underline"
                          >
                            <span>د {item.name} شعرونه فلټر کړئ</span>
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>

                          {onOpenAddPoetry && (
                            <button
                              onClick={() => {
                                onClose();
                                onOpenAddPoetry(item.name);
                              }}
                              className="text-xs text-purple-600 dark:text-purple-400 font-bold hover:underline flex items-center gap-1"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>د ده شعر اضافه کړئ</span>
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-gray-100 dark:border-purple-900/30 flex items-center justify-between shrink-0">
          <span className="text-xs text-gray-400 dark:text-purple-400/70">
            ټول ۳۴ نامتو شاعران د لټون او شعر اضافه کولو لپاره چمتو دي
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-colors"
          >
            تړل
          </button>
        </div>
      </div>
    </div>
  );
};
