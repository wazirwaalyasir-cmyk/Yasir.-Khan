import { PoetryItem, SocialContacts, DEFAULT_CONTACTS, FAMOUS_POETS } from '../types/poetry';
import { INITIAL_POETRY } from '../data/seedPoetry';

const STORAGE_KEY_POETRY = 'pashto_poetry_items';
const STORAGE_KEY_CUSTOM_POETS = 'pashto_poetry_custom_poets';
const STORAGE_KEY_CONTACTS = 'pashto_poetry_contacts';

// Initialize local storage if empty
function getLocalPoetry(): PoetryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_POETRY);
    if (!raw) {
      // Use INITIAL_POETRY (or empty if cleared)
      localStorage.setItem(STORAGE_KEY_POETRY, JSON.stringify(INITIAL_POETRY));
      return [...INITIAL_POETRY];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveLocalPoetry(items: PoetryItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY_POETRY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save to localStorage', e);
  }
}

function getLocalCustomPoets(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_POETS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalCustomPoets(poets: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY_CUSTOM_POETS, JSON.stringify(poets));
  } catch (e) {
    console.error('Failed to save custom poets', e);
  }
}

export function getLocalContacts(): SocialContacts {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONTACTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return { ...DEFAULT_CONTACTS, ...parsed };
      }
    }
  } catch {}
  return DEFAULT_CONTACTS;
}

// ---------------- API WRAPPERS WITH SEAMLESS STATIC FALLBACK ---------------- //

export async function fetchPoetryFeed(params: {
  page?: number;
  limit?: number;
  sort?: string;
  category?: string | null;
  poet?: string | null;
  search?: string | null;
  ids?: string[];
}): Promise<{ data: PoetryItem[]; pagination: { total: number; hasNext: boolean } }> {
  try {
    const query = new URLSearchParams();
    if (params.page) query.append('page', String(params.page));
    if (params.limit) query.append('limit', String(params.limit));
    if (params.sort) query.append('sort', params.sort);
    if (params.category) query.append('category', params.category);
    if (params.poet) query.append('poet', params.poet);
    if (params.search) query.append('search', params.search);
    if (params.ids && params.ids.length > 0) query.append('ids', params.ids.join(','));

    const res = await fetch(`/api/poetry?${query.toString()}`);
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const json = await res.json();
      if (json && Array.isArray(json.data)) {
        return json;
      }
    }
  } catch {
    // Server unreachable or static GitHub Pages hosting -> proceed to client fallback
  }

  // Client-side fallback for GitHub Pages (purely static)
  const allItems = getLocalPoetry();
  let filtered = allItems.filter(item => item.status === 'published' || !item.status);

  if (params.ids && params.ids.length > 0) {
    filtered = filtered.filter(item => params.ids!.includes(item.id));
  }

  if (params.category) {
    filtered = filtered.filter(item => item.category === params.category);
  }

  if (params.poet) {
    filtered = filtered.filter(item => item.poet_name === params.poet);
  }

  if (params.search && params.search.trim()) {
    const q = params.search.trim().toLowerCase();
    filtered = filtered.filter(
      item =>
        item.poetry_text.toLowerCase().includes(q) ||
        item.poet_name.toLowerCase().includes(q) ||
        (item.title && item.title.toLowerCase().includes(q))
    );
  }

  // Sort
  if (params.sort === 'popular') {
    filtered.sort((a, b) => (b.likes || 0) - (a.likes || 0));
  } else if (params.sort === 'views') {
    filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
  } else {
    // latest
    filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  const page = params.page || 1;
  const limit = params.limit || 12;
  const start = (page - 1) * limit;
  const pagedItems = filtered.slice(start, start + limit);

  return {
    data: pagedItems,
    pagination: {
      total: filtered.length,
      hasNext: start + limit < filtered.length
    }
  };
}

export async function fetchCategoryCounts(): Promise<Record<string, number>> {
  try {
    const res = await fetch('/api/categories');
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (data && typeof data === 'object') return data;
    }
  } catch {}

  const items = getLocalPoetry();
  const counts: Record<string, number> = {};
  items.forEach(item => {
    if (item.category) counts[item.category] = (counts[item.category] || 0) + 1;
  });
  return counts;
}

export async function fetchPoetsList(): Promise<{ name: string; count: number }[]> {
  try {
    const res = await fetch('/api/poets');
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (Array.isArray(data)) return data;
    }
  } catch {}

  const items = getLocalPoetry();
  const counts: Record<string, number> = {};
  items.forEach(item => {
    if (item.poet_name) counts[item.poet_name] = (counts[item.poet_name] || 0) + 1;
  });

  const customPoets = getLocalCustomPoets();
  const allNames = Array.from(new Set([...FAMOUS_POETS, ...customPoets, ...Object.keys(counts)]));

  const list = allNames.map(name => ({
    name,
    count: counts[name] || 0
  }));

  list.sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    return allNames.indexOf(a.name) - allNames.indexOf(b.name);
  });

  return list;
}

export async function submitNewPoetry(payload: {
  poetry_text: string;
  poet_name?: string;
  category?: string;
}): Promise<{ data: PoetryItem; message: string }> {
  try {
    const res = await fetch('/api/poetry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const json = await res.json();
      if (json && json.data) {
        // Also keep local copy updated
        const local = getLocalPoetry();
        saveLocalPoetry([json.data, ...local]);
        return json;
      }
    }
  } catch {}

  // Fallback for static hosting
  const items = getLocalPoetry();
  const maxNumber = items.reduce((max, item) => Math.max(max, item.item_number || 0), 0);
  const newItem: PoetryItem = {
    id: `local-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    item_number: maxNumber + 1,
    poetry_text: payload.poetry_text.trim(),
    poet_name: payload.poet_name?.trim() || '',
    category: payload.category || 'غزل',
    tags: [],
    created_at: new Date().toISOString(),
    status: 'published',
    views: 0,
    likes: 0
  };

  saveLocalPoetry([newItem, ...items]);
  return {
    data: newItem,
    message: 'شاعري په برياليتوب سره اضافه شوه!'
  };
}

export async function submitNewPoet(name: string): Promise<{ name: string; count: number }> {
  const trimmed = name.trim();
  try {
    const res = await fetch('/api/poets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: trimmed })
    });
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (data && data.poet) return data.poet;
    }
  } catch {}

  // Local fallback
  const custom = getLocalCustomPoets();
  if (!custom.includes(trimmed) && !FAMOUS_POETS.includes(trimmed)) {
    custom.push(trimmed);
    saveLocalCustomPoets(custom);
  }
  return { name: trimmed, count: 0 };
}
