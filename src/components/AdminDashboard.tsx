import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  CheckCircle2,
  XCircle,
  Edit3,
  Trash2,
  Search,
  RefreshCw,
  Sliders,
  ShieldCheck,
  Check,
  AlertTriangle,
  LogOut
} from 'lucide-react';
import { CATEGORIES, PoetryCategory, PoetryItem, PoetryStatus } from '../types/poetry';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  onPoetryUpdated?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  onClose,
  onPoetryUpdated
}) => {
  const [token, setToken] = useState<string | null>(() => {
    return sessionStorage.getItem('admin_token') || null;
  });
  const [passcode, setPasscode] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Admin Data State
  const [submissions, setSubmissions] = useState<PoetryItem[]>([]);
  const [stats, setStats] = useState({ total: 0, published: 0, pending: 0, rejected: 0 });
  const [statusFilter, setStatusFilter] = useState<'all' | PoetryStatus>('all');
  const [adminSearch, setAdminSearch] = useState('');
  const [autoApprove, setAutoApprove] = useState(true);

  // Editing state
  const [editingItem, setEditingItem] = useState<PoetryItem | null>(null);
  const [editPoet, setEditPoet] = useState('');
  const [editCategory, setEditCategory] = useState<string>('');
  const [editText, setEditText] = useState('');
  const [editTitle, setEditTitle] = useState('');

  // Fetch admin items
  const fetchAdminData = async (authToken: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/poetry?status=${statusFilter}&search=${encodeURIComponent(adminSearch)}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          sessionStorage.removeItem('admin_token');
          setToken(null);
          return;
        }
        throw new Error('Failed to fetch admin data');
      }
      const data = await res.json();
      setSubmissions(data.data || []);
      setStats({
        total: data.total || 0,
        published: data.published || 0,
        pending: data.pending || 0,
        rejected: data.rejected || 0
      });

      // Also get settings
      const setRes = await fetch('/api/admin/settings', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (setRes.ok) {
        const setData = await setRes.json();
        setAutoApprove(setData.autoApprove ?? true);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && token) {
      fetchAdminData(token);
    }
  }, [isOpen, token, statusFilter]);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: passcode.trim() })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'ناسم کوډ (Invalid passcode)');
      }

      setToken(data.token);
      sessionStorage.setItem('admin_token', data.token);
      setPasscode('');
      fetchAdminData(data.token);
    } catch (err: any) {
      setLoginError(err.message || 'د ننوتلو تېروتنه');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_token');
    setToken(null);
    setSubmissions([]);
  };

  const handleUpdateStatus = async (id: string, status: PoetryStatus) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/poetry/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchAdminData(token);
        onPoetryUpdated && onPoetryUpdated();
      }
    } catch (err) {
      console.error('Update status error', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!token || !window.confirm('ایا تاسې ډاډه یاست چې دا شاعري ړنګوئ؟')) return;
    try {
      const res = await fetch(`/api/admin/poetry/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchAdminData(token);
        onPoetryUpdated && onPoetryUpdated();
      }
    } catch (err) {
      console.error('Delete error', err);
    }
  };

  const handleToggleAutoApprove = async () => {
    if (!token) return;
    const nextVal = !autoApprove;
    setAutoApprove(nextVal);
    try {
      await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ autoApprove: nextVal })
      });
    } catch (err) {
      console.error('Failed to update auto approve setting', err);
    }
  };

  const handleStartEdit = (item: PoetryItem) => {
    setEditingItem(item);
    setEditPoet(item.poet_name);
    setEditCategory(item.category);
    setEditText(item.poetry_text);
    setEditTitle(item.title || '');
  };

  const handleSaveEdit = async () => {
    if (!token || !editingItem) return;
    try {
      const res = await fetch(`/api/admin/poetry/${editingItem.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          poet_name: editPoet,
          category: editCategory,
          poetry_text: editText,
          title: editTitle
        })
      });
      if (res.ok) {
        setEditingItem(null);
        fetchAdminData(token);
        onPoetryUpdated && onPoetryUpdated();
      }
    } catch (err) {
      console.error('Save edit error', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-200 animate-in fade-in"
      />

      {/* Main Admin Modal */}
      <div className="relative w-full max-w-4xl bg-white dark:bg-[#1a1426] text-gray-900 dark:text-gray-100 rounded-3xl shadow-2xl border border-gray-100 dark:border-purple-900/40 p-5 sm:p-7 z-10 font-pashto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-purple-900/30 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold">د مدیریت او نظارت پنل (Admin Panel)</h2>
              <p className="text-xs text-gray-500 dark:text-purple-300/80">د شعرونو څارنه، تاییدول، ردول او اصلاح کول</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {token && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                title="وتل"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>وتل</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-purple-900/30 text-gray-500 transition-colors"
              aria-label="بندول"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        {!token ? (
          /* Login Form */
          <div className="py-8 max-w-sm mx-auto w-full text-center">
            <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-950/50 flex items-center justify-center text-purple-600 dark:text-purple-300 mx-auto mb-4">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold mb-1">د مدیر پاسکوډ دننه کړئ</h3>
            <p className="text-xs text-gray-500 mb-6">د تایید او تنظیماتو لپاره اداري پاسکوډ ته اړتیا ده</p>

            <form onSubmit={handleLogin} className="space-y-4">
              {loginError && (
                <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs">
                  {loginError}
                </div>
              )}

              <input
                type="password"
                value={passcode}
                onChange={e => setPasscode(e.target.value)}
                placeholder="د ادارې پټ نوم (Passcode)"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-purple-950/40 border border-gray-200 dark:border-purple-900/50 rounded-2xl text-center text-base tracking-wider focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                autoFocus
              />

              <div className="text-[11px] text-gray-400">
                ډیفالټ پاسکوډ: <code className="bg-gray-100 dark:bg-purple-950 px-2 py-0.5 rounded text-purple-600">pashto2026</code>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-sm shadow-md transition-all active:scale-95"
              >
                {isLoading ? 'د چک په حال کې...' : 'ننوتل'}
              </button>
            </form>
          </div>
        ) : (
          /* Admin Dashboard Content */
          <div className="flex-1 overflow-y-auto py-4 space-y-5 pr-1">
            {/* Stats Cards & System Settings */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-purple-50/80 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/40">
                <span className="text-xs text-purple-700 dark:text-purple-300 font-medium">ټول شعرونه</span>
                <p className="text-2xl font-bold mt-1 text-purple-950 dark:text-white">{stats.total}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40">
                <span className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">خپاره شوي</span>
                <p className="text-2xl font-bold mt-1 text-emerald-950 dark:text-white">{stats.published}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/40">
                <span className="text-xs text-amber-700 dark:text-amber-300 font-medium">د تایید په تمه</span>
                <p className="text-2xl font-bold mt-1 text-amber-950 dark:text-white">{stats.pending}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/40">
                <span className="text-xs text-rose-700 dark:text-rose-300 font-medium">رد شوي</span>
                <p className="text-2xl font-bold mt-1 text-rose-950 dark:text-white">{stats.rejected}</p>
              </div>
            </div>

            {/* Moderation Controls: Auto-approve toggle & Filters */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-2xl bg-gray-50 dark:bg-purple-950/20 border border-gray-200/70 dark:border-purple-900/30">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-gray-700 dark:text-purple-200">
                  د نویو شعرونو اتومات خپرېدل:
                </span>
                <button
                  type="button"
                  onClick={handleToggleAutoApprove}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    autoApprove ? 'bg-emerald-600' : 'bg-gray-300 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      autoApprove ? '-translate-x-6' : '-translate-x-1'
                    }`}
                  />
                </button>
                <span className="text-xs text-gray-500">
                  {autoApprove ? 'فعال (سملاسي خپریږي)' : 'غیر فعال (د مدیر تایید غواړي)'}
                </span>
              </div>

              <button
                onClick={() => fetchAdminData(token)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-purple-900/40 hover:bg-gray-100 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-purple-800/40 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>تازه کول</span>
              </button>
            </div>

            {/* Tabs for Status */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-xl transition-colors ${
                  statusFilter === 'all'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 dark:bg-purple-950/40 text-gray-700 dark:text-gray-300'
                }`}
              >
                ټول ({stats.total})
              </button>
              <button
                onClick={() => setStatusFilter('pending')}
                className={`px-3 py-1.5 rounded-xl transition-colors ${
                  statusFilter === 'pending'
                    ? 'bg-amber-600 text-white'
                    : 'bg-gray-100 dark:bg-purple-950/40 text-gray-700 dark:text-gray-300'
                }`}
              >
                د تایید په تمه ({stats.pending})
              </button>
              <button
                onClick={() => setStatusFilter('published')}
                className={`px-3 py-1.5 rounded-xl transition-colors ${
                  statusFilter === 'published'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 dark:bg-purple-950/40 text-gray-700 dark:text-gray-300'
                }`}
              >
                خپاره شوي ({stats.published})
              </button>
              <button
                onClick={() => setStatusFilter('rejected')}
                className={`px-3 py-1.5 rounded-xl transition-colors ${
                  statusFilter === 'rejected'
                    ? 'bg-rose-600 text-white'
                    : 'bg-gray-100 dark:bg-purple-950/40 text-gray-700 dark:text-gray-300'
                }`}
              >
                رد شوي ({stats.rejected})
              </button>
            </div>

            {/* Submissions List */}
            <div className="space-y-3">
              {submissions.length === 0 ? (
                <div className="py-12 text-center text-gray-400 text-sm">
                  هیڅ شاعري ونه موندل شوه
                </div>
              ) : (
                submissions.map(item => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-gray-50 dark:bg-purple-950/30 border border-gray-200/80 dark:border-purple-900/40 transition-all hover:border-purple-300"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-purple-200/80 dark:bg-purple-900/60 text-purple-900 dark:text-purple-200 font-bold text-xs">
                            #{item.item_number}
                          </span>
                          <span className="font-bold text-sm text-gray-900 dark:text-white">
                            {item.title || 'بې سرلیکه'}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300">
                            {item.category}
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-md font-semibold ${
                              item.status === 'published'
                                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                                : item.status === 'pending'
                                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                                : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                            }`}
                          >
                            {item.status === 'published' ? 'خپور شوی' : item.status === 'pending' ? 'په تمه' : 'رد شوی'}
                          </span>
                        </div>
                        <span className="text-xs text-purple-700 dark:text-purple-400 font-semibold block mt-1">
                          شاعر: {item.poet_name}
                        </span>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {item.status !== 'published' && (
                          <button
                            onClick={() => handleUpdateStatus(item.id, 'published')}
                            className="p-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-600 dark:text-emerald-300 transition-colors"
                            title="تایید او خپرول"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}
                        {item.status !== 'rejected' && (
                          <button
                            onClick={() => handleUpdateStatus(item.id, 'rejected')}
                            className="p-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 text-amber-600 dark:text-amber-300 transition-colors"
                            title="رد کول"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleStartEdit(item)}
                          className="p-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 text-purple-600 dark:text-purple-300 transition-colors"
                          title="سمول"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 text-rose-600 dark:text-rose-300 transition-colors"
                          title="ړنګول"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <p className="mt-3 text-xs sm:text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line line-clamp-3 bg-white/60 dark:bg-purple-950/40 p-2.5 rounded-xl border border-gray-100 dark:border-purple-900/30">
                      {item.poetry_text}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Edit Sub-Modal */}
        {editingItem && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-20 flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-white dark:bg-[#1f192b] p-6 rounded-3xl shadow-2xl border border-gray-100 dark:border-purple-900/50 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-purple-900/30">
                <h3 className="font-bold text-base">د شعر سمول (Edit Poetry)</h3>
                <button onClick={() => setEditingItem(null)} className="p-1 text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 mt-4 text-xs sm:text-sm">
                <div>
                  <label className="block font-semibold mb-1">عنوان</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-purple-950/40 border border-gray-200 dark:border-purple-900/40 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">د شاعر نوم</label>
                  <input
                    type="text"
                    value={editPoet}
                    onChange={e => setEditPoet(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-purple-950/40 border border-gray-200 dark:border-purple-900/40 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">کټګوري</label>
                  <select
                    value={editCategory}
                    onChange={e => setEditCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-purple-950/40 border border-gray-200 dark:border-purple-900/40 rounded-xl"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">د شعر متن</label>
                  <textarea
                    rows={5}
                    value={editText}
                    onChange={e => setEditText(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-purple-950/40 border border-gray-200 dark:border-purple-900/40 rounded-xl leading-relaxed"
                  />
                </div>
              </div>

              <div className="mt-5 flex items-center justify-end gap-2">
                <button
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 rounded-xl text-xs border border-gray-200 hover:bg-gray-100"
                >
                  لغوه کول
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-5 py-2 rounded-xl text-xs bg-purple-600 hover:bg-purple-700 text-white font-bold"
                >
                  بدلونونه خوندي کړئ
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
