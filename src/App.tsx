import React, { useState, useEffect, useCallback } from 'react';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { FavoritesProvider, useFavorites } from './context/FavoritesContext';
import { LikesProvider } from './context/LikesContext';
import { Header } from './components/Header';
import { HamburgerMenu } from './components/HamburgerMenu';
import { SearchBar } from './components/SearchBar';
import { SettingsPanel } from './components/SettingsPanel';
import { PoetryCard } from './components/PoetryCard';
import { AddPoetryModal } from './components/AddPoetryModal';
import { ShareModal } from './components/ShareModal';
import { AdminDashboard } from './components/AdminDashboard';
import { PoetsModal } from './components/PoetsModal';
import { AboutModal } from './components/AboutModal';
import { ContactModal } from './components/ContactModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import { PoetryItem, PoetryCategory, CATEGORIES } from './types/poetry';
import { fetchPoetryFeed, fetchCategoryCounts, fetchPoetsList } from './services/apiService';
import {
  Plus,
  Sparkles,
  Bookmark,
  X,
  ChevronDown,
  RotateCw,
  BookOpen,
  AlertCircle,
  Tag,
  Users
} from 'lucide-react';

function PoetryAppContent() {
  const { settings } = useSettings();
  const { favoriteIds } = useFavorites();

  // Data state
  const [poetryList, setPoetryList] = useState<PoetryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPoet, setSelectedPoet] = useState<string | null>(null);
  const [selectedPoetForAdd, setSelectedPoetForAdd] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'views'>('latest');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // Category counts & Poets data
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [poetsList, setPoetsList] = useState<{ name: string; count: number }[]>([]);

  // Modals state
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isPoetsOpen, setIsPoetsOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [sharingPoetry, setSharingPoetry] = useState<PoetryItem | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', text: string) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, type, text }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Fetch Meta (categories, poets)
  const fetchMetadata = async () => {
    try {
      const [counts, poets] = await Promise.all([
        fetchCategoryCounts(),
        fetchPoetsList()
      ]);
      setCategoryCounts(counts);
      setPoetsList(poets);
    } catch (e) {
      console.error('Error fetching metadata', e);
    }
  };

  useEffect(() => {
    fetchMetadata();
  }, []);

  // Fetch Poetry Feed
  const fetchPoetry = useCallback(async (isLoadMore = false, pageNum = 1) => {
    if (isLoadMore) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      if (showFavoritesOnly) {
        if (favoriteIds.length === 0) {
          setPoetryList([]);
          setHasNextPage(false);
          setTotalCount(0);
          setPage(1);
          setIsLoading(false);
          setIsLoadingMore(false);
          return;
        }
      }

      const res = await fetchPoetryFeed({
        page: pageNum,
        limit: 12,
        sort: sortBy,
        category: selectedCategory,
        poet: selectedPoet,
        search: searchQuery.trim() || null,
        ids: showFavoritesOnly ? favoriteIds : undefined
      });

      const newItems: PoetryItem[] = res.data || [];

      if (isLoadMore) {
        setPoetryList(prev => [...prev, ...newItems]);
      } else {
        setPoetryList(newItems);
      }

      setHasNextPage(Boolean(res.pagination?.hasNext));
      setTotalCount(res.pagination?.total || 0);
      setPage(pageNum);
    } catch (err: any) {
      setError(err.message || 'د شاعرۍ په راوستلو کې تېروتنه وشوه');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [selectedCategory, selectedPoet, searchQuery, sortBy, showFavoritesOnly, favoriteIds]);

  // Refetch when filters change
  useEffect(() => {
    fetchPoetry(false, 1);
  }, [fetchPoetry]);

  // Handle Like count sync
  const handleLikeChange = (id: string, newLikes: number) => {
    setPoetryList(prev =>
      prev.map(item => (item.id === id ? { ...item, likes: newLikes } : item))
    );
  };

  // Handle new poetry added
  const handlePoetryAdded = (newPoetry: PoetryItem, message: string) => {
    addToast('success', message);
    fetchMetadata();
    // Prepend to current feed if matches filter or no filter
    if (
      (!selectedCategory || selectedCategory === newPoetry.category) &&
      (!selectedPoet || selectedPoet === newPoetry.poet_name)
    ) {
      setPoetryList(prev => [newPoetry, ...prev]);
      setTotalCount(prev => prev + 1);
    } else {
      // Clear filters so user sees their new poetry immediately
      setSelectedCategory(null);
      setSelectedPoet(null);
      setSearchQuery('');
      setShowFavoritesOnly(false);
      fetchPoetry(false, 1);
    }
  };

  const handleClearAllFilters = () => {
    setSelectedCategory(null);
    setSelectedPoet(null);
    setSearchQuery('');
    setShowFavoritesOnly(false);
  };

  // Filter for display: if showFavoritesOnly is true, only show saved items
  const displayedPoetry = showFavoritesOnly
    ? poetryList.filter(item => favoriteIds.includes(item.id))
    : poetryList;

  const activeFilterLabel = showFavoritesOnly
    ? 'خوندي شوي شعرونه'
    : selectedCategory
    ? selectedCategory
    : selectedPoet
    ? `شاعر: ${selectedPoet}`
    : searchQuery
    ? `لټون: "${searchQuery}"`
    : null;

  return (
    <div className="min-h-screen bg-white dark:bg-[#14101c] text-gray-900 dark:text-gray-100 flex flex-col transition-colors duration-200 selection:bg-purple-200 selection:text-purple-900">
      {/* 1. Header / Top Navigation */}
      <Header
        onOpenMenu={() => setIsMenuOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        activeFilter={activeFilterLabel}
        onClearFilter={handleClearAllFilters}
      />

      {/* Horizontal Quick Category Chips Carousel */}
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-3 pb-1">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none font-pashto text-xs select-none">
          {/* All */}
          <button
            onClick={() => {
              setShowFavoritesOnly(false);
              setSelectedCategory(null);
            }}
            className={`px-3.5 py-1.5 rounded-full font-semibold shrink-0 transition-all active:scale-95 ${
              !selectedCategory && !showFavoritesOnly
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-[#f4f1f8] dark:bg-[#211a2c] hover:bg-purple-100 dark:hover:bg-purple-900/40 text-gray-700 dark:text-gray-200 border border-purple-200/50 dark:border-purple-900/40'
            }`}
          >
            ټول (All)
          </button>

          {/* Favorites Filter Chip */}
          <button
            onClick={() => {
              setShowFavoritesOnly(!showFavoritesOnly);
              setSelectedCategory(null);
            }}
            className={`inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full font-semibold shrink-0 transition-all active:scale-95 ${
              showFavoritesOnly
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-[#f4f1f8] dark:bg-[#211a2c] hover:bg-purple-100 dark:hover:bg-purple-900/40 text-purple-700 dark:text-purple-300 border border-purple-200/50 dark:border-purple-900/40'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${showFavoritesOnly ? 'fill-white' : ''}`} />
            <span>خوندي شوي ({favoriteIds.length})</span>
          </button>

          {/* Famous Poets Quick Chip */}
          <button
            onClick={() => setIsPoetsOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-semibold shrink-0 transition-all active:scale-95 bg-[#f4f1f8] dark:bg-[#211a2c] hover:bg-purple-100 dark:hover:bg-purple-900/40 text-purple-700 dark:text-purple-300 border border-purple-200/50 dark:border-purple-900/40"
          >
            <Users className="w-3.5 h-3.5" />
            <span>پښتو شاعران (۳۴)</span>
          </button>

          {/* Categories */}
          {CATEGORIES.map(cat => {
            const isSelected = selectedCategory === cat && !showFavoritesOnly;
            return (
              <button
                key={cat}
                onClick={() => {
                  setShowFavoritesOnly(false);
                  setSelectedCategory(cat);
                }}
                className={`px-3.5 py-1.5 rounded-full font-semibold shrink-0 transition-all active:scale-95 ${
                  isSelected
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-[#f4f1f8] dark:bg-[#211a2c] hover:bg-purple-100 dark:hover:bg-purple-900/40 text-gray-700 dark:text-gray-200 border border-purple-200/50 dark:border-purple-900/40'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-2 sm:py-4 relative">
        {/* Active Filter Pills Bar (if filtering) */}
        {(selectedCategory || selectedPoet || searchQuery || showFavoritesOnly) && (
          <div className="mb-5 p-3 sm:p-4 rounded-2xl bg-[#f4f1f8] dark:bg-[#20182c] border border-purple-200/70 dark:border-purple-900/50 flex items-center justify-between gap-3 animate-in fade-in font-pashto">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-gray-500 dark:text-purple-300">فلټر شوی پر:</span>

              {showFavoritesOnly && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-600 text-white text-xs font-medium shadow-sm">
                  <Bookmark className="w-3.5 h-3.5 fill-white" />
                  <span>خوندي شوي شعرونه</span>
                  <button
                    onClick={() => setShowFavoritesOnly(false)}
                    className="p-0.5 hover:bg-white/20 rounded-full"
                    title="پاکول"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}

              {selectedCategory && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-600 text-white text-xs font-medium shadow-sm">
                  <span>{selectedCategory}</span>
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="p-0.5 hover:bg-white/20 rounded-full"
                    title="پاکول"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}

              {selectedPoet && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-600 text-white text-xs font-medium shadow-sm">
                  <span>شاعر: {selectedPoet}</span>
                  <button
                    onClick={() => setSelectedPoet(null)}
                    className="p-0.5 hover:bg-white/20 rounded-full"
                    title="پاکول"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}

              {searchQuery && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-800 text-purple-100 text-xs font-medium shadow-sm">
                  <span>پلټنه: {searchQuery}</span>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="p-0.5 hover:bg-white/20 rounded-full"
                    title="پاکول"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}
            </div>

            <button
              onClick={handleClearAllFilters}
              className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline shrink-0"
            >
              ټول پاک کړئ
            </button>
          </div>
        )}

        {/* Sort Controls & Feed Header */}
        <div className="flex items-center justify-between pb-3 mb-2 text-xs font-pashto text-gray-500 dark:text-purple-300/80 border-b border-gray-100 dark:border-purple-950/40">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-800 dark:text-gray-200">
              {showFavoritesOnly
                ? `${displayedPoetry.length} خوندي شوي شعرونه`
                : totalCount > 0
                ? `${totalCount} شعرونه موندل شوي`
                : 'د پښتو شعرونو ټولګه'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span>ترتیب:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="bg-transparent text-purple-700 dark:text-purple-300 font-semibold focus:outline-none cursor-pointer text-xs"
            >
              <option value="latest" className="bg-white dark:bg-[#1a1426] text-gray-900 dark:text-white">نوي (Latest)</option>
              <option value="popular" className="bg-white dark:bg-[#1a1426] text-gray-900 dark:text-white">خوښ شوي (Popular)</option>
              <option value="views" className="bg-white dark:bg-[#1a1426] text-gray-900 dark:text-white">ډېر لیدل شوي (Views)</option>
            </select>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="my-8 p-6 rounded-3xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-center font-pashto">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
            <p className="text-rose-800 dark:text-rose-300 font-bold text-base mb-1">{error}</p>
            <p className="text-rose-600 dark:text-rose-400 text-xs mb-4">مهرباني وکړئ خپل پیوستون وګورئ او بیا هڅه وکړئ</p>
            <button
              onClick={() => fetchPoetry(false, 1)}
              className="px-5 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors"
            >
              بیا هڅه وکړئ
            </button>
          </div>
        )}

        {/* Loading Skeletons */}
        {isLoading && (
          <div className="space-y-6 my-4">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className="w-full max-w-2xl mx-auto rounded-3xl p-8 bg-[#f4f1f8] dark:bg-[#20182c] border border-[#e7e0ef] dark:border-[#382b4a] animate-pulse"
              >
                <div className="flex justify-between items-center mb-6">
                  <div className="w-24 h-6 bg-purple-200/60 dark:bg-purple-900/40 rounded-full" />
                  <div className="w-12 h-4 bg-purple-200/50 dark:bg-purple-900/30 rounded-md" />
                </div>
                <div className="space-y-3.5 my-6 flex flex-col items-center">
                  <div className="w-3/4 h-5 bg-purple-200/70 dark:bg-purple-900/50 rounded-lg" />
                  <div className="w-4/5 h-5 bg-purple-200/70 dark:bg-purple-900/50 rounded-lg" />
                  <div className="w-2/3 h-5 bg-purple-200/70 dark:bg-purple-900/50 rounded-lg" />
                </div>
                <div className="w-32 h-6 bg-purple-200/60 dark:bg-purple-900/40 rounded-md mx-auto my-4" />
                <div className="flex justify-between items-center pt-4 border-t border-purple-200/50 dark:border-purple-900/40 mt-6">
                  <div className="w-20 h-4 bg-purple-200/50 dark:bg-purple-900/30 rounded-md" />
                  <div className="flex gap-2">
                    <div className="w-14 h-6 bg-purple-200/50 dark:bg-purple-900/30 rounded-full" />
                    <div className="w-14 h-6 bg-purple-200/50 dark:bg-purple-900/30 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && displayedPoetry.length === 0 && (
          <div className="py-16 sm:py-20 text-center font-pashto animate-in fade-in">
            <div className="w-20 h-20 rounded-3xl bg-purple-100 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-900/40 flex items-center justify-center text-purple-600 dark:text-purple-300 mx-auto mb-4">
              <BookOpen className="w-10 h-10" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
              {showFavoritesOnly ? 'هیڅ شعر نه دی خوندي شوی' : 'تر اوسه شاعري نه ده اضافه شوې'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-purple-300/70 max-w-sm mx-auto mb-6 leading-relaxed">
              {showFavoritesOnly
                ? 'تاسې کولی شئ په هر شعر کې د نښې (Bookmark) تڼۍ په کېکاږلو سره هغه دلته خوندي کړئ.'
                : 'په ټاکل شوي فلټر کې هیڅ شعر شتون نلري، یا لا تر اوسه شعر ندی خپور شوی. لومړی شعر تاسې اضافه کړئ!'}
            </p>
            <div className="flex items-center justify-center gap-3">
              {(selectedCategory || selectedPoet || searchQuery || showFavoritesOnly) && (
                <button
                  onClick={handleClearAllFilters}
                  className="px-5 py-2.5 rounded-2xl border border-purple-300 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-sm font-semibold hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-colors"
                >
                  ټول فلټرونه پاک کړئ
                </button>
              )}
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold shadow-md transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>شاعري اضافه کړئ</span>
              </button>
            </div>
          </div>
        )}

        {/* Poetry Cards List */}
        {!isLoading && !error && displayedPoetry.length > 0 && (
          <div className="space-y-6 pb-32 sm:pb-36">
            {displayedPoetry.map(item => (
              <PoetryCard
                key={item.id}
                poetry={item}
                onLikeChange={handleLikeChange}
                onShare={p => setSharingPoetry(p)}
                onSelectPoet={poet => {
                  setShowFavoritesOnly(false);
                  setSelectedPoet(poet);
                }}
                onSelectCategory={cat => {
                  setShowFavoritesOnly(false);
                  setSelectedCategory(cat);
                }}
                onCopySuccess={() => addToast('success', 'د شعر متن په بریالیتوب سره کاپي شو')}
                onBookmarkChange={saved =>
                  addToast(
                    'info',
                    saved ? 'شعر په بريالیتوب سره خوندي شو' : 'شعر له خوندي شوو څخه لیرې شو'
                  )
                }
              />
            ))}

            {/* Load More Button (only when not in favorites-only mode) */}
            {!showFavoritesOnly && hasNextPage && (
              <div className="pt-4 text-center">
                <button
                  onClick={() => fetchPoetry(true, page + 1)}
                  disabled={isLoadingMore}
                  className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl bg-[#f4f1f8] dark:bg-[#20182c] hover:bg-purple-100 dark:hover:bg-purple-900/50 border border-purple-200 dark:border-purple-800/40 text-purple-900 dark:text-purple-200 text-sm font-bold shadow-sm hover:shadow transition-all active:scale-95 font-pashto"
                >
                  {isLoadingMore ? (
                    <>
                      <RotateCw className="w-4 h-4 animate-spin text-purple-600" />
                      <span>د شعرونو بارولو په حال کې...</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      <span>نور شعرونه وښایاست</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Floating Circular "+" Button centered horizontally with safe-area spacing */}
      <div className="fixed bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-40 pointer-events-none pb-[env(safe-area-inset-bottom)]">
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="pointer-events-auto w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-purple-700 via-purple-600 to-indigo-600 hover:from-purple-800 hover:to-indigo-700 text-white shadow-xl hover:shadow-2xl flex items-center justify-center transition-all duration-300 active:scale-90 border-2 border-white dark:border-purple-950 group focus:outline-none focus:ring-4 focus:ring-purple-400"
          aria-label="شاعري اضافه کړئ (Add Poetry)"
          title="شاعري اضافه کړئ"
        >
          <Plus className="w-7 h-7 sm:w-8 sm:h-8 stroke-[2.5] transition-transform duration-300 group-hover:rotate-90" />
        </button>
      </div>

      {/* Modals & Drawers */}
      <HamburgerMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        selectedCategory={selectedCategory}
        onSelectCategory={cat => {
          setShowFavoritesOnly(false);
          setSelectedCategory(cat);
        }}
        categoryCounts={categoryCounts}
        onOpenPoets={() => setIsPoetsOpen(true)}
        onOpenAddPoet={() => setIsPoetsOpen(true)}
        onOpenAbout={() => setIsAboutOpen(true)}
        onOpenContact={() => setIsContactOpen(true)}
        onOpenFavorites={() => {
          setShowFavoritesOnly(true);
          setSelectedCategory(null);
        }}
        favoritesCount={favoriteIds.length}
        isFavoritesActive={showFavoritesOnly}
      />

      <SearchBar
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        searchQuery={searchQuery}
        onSearchChange={q => setSearchQuery(q)}
        onExecuteSearch={() => fetchPoetry(false, 1)}
      />

      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <AddPoetryModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setSelectedPoetForAdd('');
        }}
        onPoetryAdded={handlePoetryAdded}
        initialPoetName={selectedPoetForAdd}
      />

      <AdminDashboard
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        onPoetryUpdated={() => {
          fetchPoetry(false, 1);
          fetchMetadata();
        }}
      />

      <PoetsModal
        isOpen={isPoetsOpen}
        onClose={() => setIsPoetsOpen(false)}
        poets={poetsList}
        selectedPoet={selectedPoet}
        onSelectPoet={poet => {
          setShowFavoritesOnly(false);
          setSelectedPoet(poet);
        }}
        onOpenAddPoetry={poetName => {
          setSelectedPoetForAdd(poetName || '');
          setIsAddModalOpen(true);
        }}
        onPoetAdded={poetName => {
          fetchMetadata();
          addToast('success', `شاعر «${poetName}» په برياليتوب سره اضافه شو`);
        }}
      />

      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
        onOpenContact={() => setIsContactOpen(true)}
      />

      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
        onSuccess={msg => addToast('success', msg)}
      />

      <ShareModal
        poetry={sharingPoetry}
        isOpen={Boolean(sharingPoetry)}
        onClose={() => setSharingPoetry(null)}
        onCopySuccess={() => addToast('success', 'د شعر متن په برياليتوب سره کاپي شو')}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <FavoritesProvider>
        <LikesProvider>
          <PoetryAppContent />
        </LikesProvider>
      </FavoritesProvider>
    </SettingsProvider>
  );
}
