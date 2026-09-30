import express, { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { INITIAL_POETRY } from './src/data/seedPoetry.ts';
import { PoetryItem, SocialContacts, FAMOUS_POETS } from './src/types/poetry.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'poetry.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

app.use(express.json());

interface AppSettings {
  autoApprove: boolean;
  contacts?: SocialContacts;
  customPoets?: string[];
}

// Ensure data directory and file exist
function initStorage() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(INITIAL_POETRY, null, 2), 'utf-8');
  }

  if (!fs.existsSync(SETTINGS_FILE)) {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify({
      autoApprove: true,
      contacts: {
        name: 'یاسر وزیروال (Yasir Wazirwaal)',
        whatsapp: '+93700000000',
        facebook: 'https://www.facebook.com/share/19hDDMwzmb/?mibextid=wwXIfr',
        tiktok: 'https://www.tiktok.com/@yasirwazirwaal1',
        email: '',
        phone: ''
      }
    }, null, 2), 'utf-8');
  }
}

initStorage();

function readPoetry(): PoetryItem[] {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading poetry data:', err);
    return INITIAL_POETRY;
  }
}

function writePoetry(items: PoetryItem[]) {
  const tmpFile = `${DATA_FILE}.tmp`;
  fs.writeFileSync(tmpFile, JSON.stringify(items, null, 2), 'utf-8');
  fs.renameSync(tmpFile, DATA_FILE);
}

function readSettings(): AppSettings {
  try {
    const raw = fs.readFileSync(SETTINGS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return { autoApprove: true };
  }
}

function writeSettings(settings: AppSettings) {
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
}

// Simple in-memory rate limiter for submissions
const submissionHistory = new Map<string, number[]>();
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 5 * 60 * 1000; // 5 minutes
  const maxSubmissions = 10;
  
  const history = submissionHistory.get(ip) || [];
  const validHistory = history.filter(time => now - time < windowMs);
  
  if (validHistory.length >= maxSubmissions) {
    return false;
  }
  
  validHistory.push(now);
  submissionHistory.set(ip, validHistory);
  return true;
}

// Admin secret token validation
const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE || 'pashto2026';
const ADMIN_TOKENS = new Set<string>();

function adminAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'غیر مجاز لاسرسی (Unauthorized)' });
  }
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!ADMIN_TOKENS.has(token) && token !== ADMIN_PASSCODE) {
    return res.status(403).json({ error: 'ناسم کوډ یا ټوکن (Invalid credentials)' });
  }
  next();
}

// ---------------- API ENDPOINTS ---------------- //

// GET /api/poetry - Public feed with filters and search
app.get('/api/poetry', (req: Request, res: Response) => {
  const { category, poet, search, sort = 'latest', page = '1', limit = '20', ids } = req.query;
  const items = readPoetry();
  
  // Public users only see published poetry
  let filtered = items.filter(item => item.status === 'published');

  // Filter by explicit IDs (e.g. saved/favorite poetry)
  if (ids && typeof ids === 'string' && ids.trim()) {
    const idList = ids.split(',').map(id => id.trim()).filter(Boolean);
    filtered = filtered.filter(item => idList.includes(item.id));
  }

  if (category && typeof category === 'string' && category !== 'ټول' && category !== 'all') {
    filtered = filtered.filter(item => item.category === category);
  }

  if (poet && typeof poet === 'string' && poet.trim()) {
    const pTrim = poet.trim().toLowerCase();
    filtered = filtered.filter(item => item.poet_name.toLowerCase().includes(pTrim));
  }

  if (search && typeof search === 'string' && search.trim()) {
    const q = search.trim().toLowerCase();
    filtered = filtered.filter(item => {
      const matchText = item.poetry_text.toLowerCase().includes(q);
      const matchPoet = item.poet_name.toLowerCase().includes(q);
      const matchTitle = item.title ? item.title.toLowerCase().includes(q) : false;
      const matchCat = item.category.toLowerCase().includes(q);
      const matchTags = item.tags && item.tags.some(t => t.toLowerCase().includes(q));
      const matchNumber = item.item_number ? `#${item.item_number}` === q || `${item.item_number}` === q : false;
      return matchText || matchPoet || matchTitle || matchCat || matchTags || matchNumber;
    });
  }

  // Sorting
  if (sort === 'popular' || sort === 'likes') {
    filtered.sort((a, b) => (b.likes || 0) - (a.likes || 0));
  } else if (sort === 'views') {
    filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
  } else if (sort === 'oldest') {
    filtered.sort((a, b) => (a.item_number || 0) - (b.item_number || 0));
  } else {
    // latest (highest item_number or newest created_at)
    filtered.sort((a, b) => (b.item_number || 0) - (a.item_number || 0));
  }

  const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit as string, 10) || 20));
  const total = filtered.length;
  const totalPages = Math.ceil(total / limitNum);
  const startIdx = (pageNum - 1) * limitNum;
  const paginated = filtered.slice(startIdx, startIdx + limitNum);

  res.json({
    data: paginated,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages,
      hasNext: pageNum < totalPages
    }
  });
});

// GET /api/poetry/:id - Single poetry item
app.get('/api/poetry/:id', (req: Request, res: Response) => {
  const items = readPoetry();
  const found = items.find(item => item.id === req.params.id);
  if (!found) {
    return res.status(404).json({ error: 'شاعري ونه موندل شوه (Poetry not found)' });
  }
  res.json(found);
});

let idCounter = 1;

// POST /api/poetry - Submit new poetry
app.post('/api/poetry', (req: Request, res: Response) => {
  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
  if (!checkRateLimit(clientIp)) {
    return res.status(429).json({
      error: 'ډېر زیات غوښتنلیکونه. مهرباني وکړئ لږ وروسته هڅه وکړئ. (Too many submissions, please wait)'
    });
  }

  const { poetry_text, poet_name, category, title, tags } = req.body;

  if (!poetry_text || typeof poetry_text !== 'string' || poetry_text.trim().length < 5) {
    return res.status(400).json({ error: 'مهرباني وکړئ د شاعرۍ بشپړ متن وليکئ (Poetry text required)' });
  }

  // Poet name is optional - poetry can save without poet name
  const cleanPoetName = poet_name && typeof poet_name === 'string' ? poet_name.trim() : '';

  const settings = readSettings();
  const initialStatus = settings.autoApprove ? 'published' : 'pending';

  const items = readPoetry();
  const maxNumber = items.reduce((max, item) => Math.max(max, item.item_number || 0), 0);
  const nextNumber = maxNumber + 1;

  const newItem: PoetryItem = {
    id: `p-${Date.now()}-${idCounter++}`,
    item_number: nextNumber,
    poetry_text: poetry_text.trim(),
    poet_name: cleanPoetName,
    category: category && typeof category === 'string' ? category.trim() : 'نور',
    title: title && typeof title === 'string' ? title.trim() : undefined,
    tags: Array.isArray(tags)
      ? tags.map(t => String(t).trim()).filter(Boolean)
      : typeof tags === 'string'
      ? tags.split(',').map(t => t.trim()).filter(Boolean)
      : [],
    created_at: new Date().toISOString(),
    status: initialStatus,
    views: 0,
    likes: 0
  };

  items.unshift(newItem);
  writePoetry(items);

  res.status(201).json({
    message: initialStatus === 'published' 
      ? 'شاعري په برياليتوب سره خپره شوه! (Poetry published successfully)' 
      : 'شاعري واستول شوه او د مدیر د تایید په تمه ده (Submitted for review)',
    data: newItem
  });
});

// POST /api/poetry/:id/like - Like or unlike a poem
app.post('/api/poetry/:id/like', (req: Request, res: Response) => {
  const { action } = req.body || {};
  const items = readPoetry();
  const index = items.findIndex(item => item.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Poetry not found' });
  }

  const currentLikes = items[index].likes || 0;
  if (action === 'unlike') {
    items[index].likes = Math.max(0, currentLikes - 1);
  } else {
    items[index].likes = currentLikes + 1;
  }

  writePoetry(items);
  res.json({ success: true, likes: items[index].likes, action });
});

// POST /api/poetry/:id/view - Record view
app.post('/api/poetry/:id/view', (req: Request, res: Response) => {
  const items = readPoetry();
  const index = items.findIndex(item => item.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Poetry not found' });
  }

  items[index].views = (items[index].views || 0) + 1;
  writePoetry(items);
  res.json({ success: true, views: items[index].views });
});

// GET /api/categories - Categories with counts
app.get('/api/categories', (req: Request, res: Response) => {
  const items = readPoetry().filter(item => item.status === 'published');
  const counts: Record<string, number> = {};
  items.forEach(item => {
    counts[item.category] = (counts[item.category] || 0) + 1;
  });
  res.json(counts);
});

// GET /api/poets - Unique poets with counts (includes all 34 famous poets & custom poets)
app.get('/api/poets', (_req: Request, res: Response) => {
  const items = readPoetry().filter(item => item.status === 'published');
  const counts: Record<string, number> = {};
  items.forEach(item => {
    counts[item.poet_name] = (counts[item.poet_name] || 0) + 1;
  });
  
  const settings = readSettings();
  const customPoets = settings.customPoets || [];

  // Combine famous poets + custom poets + any poets from published poems
  const allPoetNames = Array.from(new Set([...FAMOUS_POETS, ...customPoets, ...Object.keys(counts)]));

  const poetsList = allPoetNames.map(name => ({
    name,
    count: counts[name] || 0
  }));

  // Sort: poets with poems first, then original order
  poetsList.sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    return allPoetNames.indexOf(a.name) - allPoetNames.indexOf(b.name);
  });

  res.json(poetsList);
});

// POST /api/poets - Add a new poet name (option: add شاعر)
app.post('/api/poets', (req: Request, res: Response) => {
  const { name } = req.body;
  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'د شاعر نوم اړین دی (Poet name is required)' });
  }

  const trimmed = name.trim();
  const settings = readSettings();
  const customPoets = settings.customPoets || [];

  if (!customPoets.includes(trimmed) && !FAMOUS_POETS.includes(trimmed)) {
    customPoets.push(trimmed);
    settings.customPoets = customPoets;
    writeSettings(settings);
  }

  const items = readPoetry().filter(item => item.status === 'published');
  const counts: Record<string, number> = {};
  items.forEach(item => {
    if (item.poet_name) counts[item.poet_name] = (counts[item.poet_name] || 0) + 1;
  });

  const allPoetNames = Array.from(new Set([...FAMOUS_POETS, ...customPoets, ...Object.keys(counts)]));
  const poetsList = allPoetNames.map(pName => ({
    name: pName,
    count: counts[pName] || 0
  }));

  res.status(201).json({
    message: 'شاعر په برياليتوب سره اضافه شو (Poet added successfully)',
    poet: { name: trimmed, count: counts[trimmed] || 0 },
    poets: poetsList
  });
});

// ---------------- CONTACTS / SOCIAL ACCOUNTS ENDPOINTS ---------------- //

// GET /api/contacts - Public contact details (WhatsApp, Facebook, TikTok, email)
app.get('/api/contacts', (_req: Request, res: Response) => {
  const settings = readSettings();
  const contacts = settings.contacts || {
    name: 'یاسر وزیروال (Yasir Wazirwaal)',
    whatsapp: '+93700000000',
    facebook: 'https://www.facebook.com/share/19hDDMwzmb/?mibextid=wwXIfr',
    tiktok: 'https://www.tiktok.com/@yasirwazirwaal1',
    email: '',
    phone: ''
  };
  res.json(contacts);
});

// POST /api/contacts - Update contact details (Protected: owner passcode required so no public can edit)
app.post('/api/contacts', (req: Request, res: Response) => {
  const { passcode, contacts } = req.body;
  const authHeader = req.headers.authorization;
  const token = authHeader ? authHeader.replace(/^Bearer\s+/i, '').trim() : '';

  const isAuthorized =
    (passcode && passcode.trim() === ADMIN_PASSCODE) ||
    (token && (ADMIN_TOKENS.has(token) || token === ADMIN_PASSCODE));

  if (!isAuthorized) {
    return res.status(403).json({
      error: 'غیر مجاز لاسرسی! یوازې خپروونکی یا ادمین کولی شي ټولنیز حسابونه بدل کړي. (Owner passcode required)'
    });
  }

  if (!contacts || typeof contacts !== 'object') {
    return res.status(400).json({ error: 'د اړیکو معلومات ناسم دي' });
  }

  const settings = readSettings();
  settings.contacts = {
    name: contacts.name ? String(contacts.name).trim() : 'یاسر وزیروال (Yasir Wazirwaal)',
    whatsapp: contacts.whatsapp ? String(contacts.whatsapp).trim() : '',
    facebook: contacts.facebook ? String(contacts.facebook).trim() : '',
    tiktok: contacts.tiktok ? String(contacts.tiktok).trim() : '',
    email: contacts.email ? String(contacts.email).trim() : '',
    phone: contacts.phone ? String(contacts.phone).trim() : ''
  };

  writeSettings(settings);
  res.json({ success: true, contacts: settings.contacts });
});

// ---------------- ADMIN ENDPOINTS ---------------- //

// POST /api/admin/login
app.post('/api/admin/login', (req: Request, res: Response) => {
  const { passcode } = req.body;
  if (!passcode || passcode.trim() !== ADMIN_PASSCODE) {
    return res.status(401).json({ error: 'ناسم پټ نوم (Incorrect passcode)' });
  }

  const token = `token-${Date.now()}-${++idCounter}`;
  ADMIN_TOKENS.add(token);
  res.json({ success: true, token });
});

// GET /api/admin/poetry
app.get('/api/admin/poetry', adminAuth, (req: Request, res: Response) => {
  const { status, search } = req.query;
  const items = readPoetry();
  let list = items;

  if (status && typeof status === 'string' && status !== 'all') {
    list = list.filter(item => item.status === status);
  }

  if (search && typeof search === 'string') {
    const q = search.trim().toLowerCase();
    list = list.filter(item => 
      item.poetry_text.toLowerCase().includes(q) ||
      item.poet_name.toLowerCase().includes(q) ||
      (item.title && item.title.toLowerCase().includes(q))
    );
  }

  res.json({
    total: items.length,
    published: items.filter(i => i.status === 'published').length,
    pending: items.filter(i => i.status === 'pending').length,
    rejected: items.filter(i => i.status === 'rejected').length,
    data: list
  });
});

// PATCH /api/admin/poetry/:id - Edit or moderate
app.patch('/api/admin/poetry/:id', adminAuth, (req: Request, res: Response) => {
  const items = readPoetry();
  const index = items.findIndex(item => item.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Poetry not found' });
  }

  const current = items[index];
  const { status, title, poet_name, category, poetry_text, tags } = req.body;

  if (status && ['published', 'pending', 'rejected'].includes(status)) {
    current.status = status;
  }
  if (title !== undefined) current.title = title;
  if (poet_name) current.poet_name = poet_name.trim();
  if (category) current.category = category.trim();
  if (poetry_text) current.poetry_text = poetry_text.trim();
  if (tags && Array.isArray(tags)) current.tags = tags;
  current.updated_at = new Date().toISOString();

  items[index] = current;
  writePoetry(items);

  res.json({ success: true, data: current });
});

// DELETE /api/admin/poetry/:id
app.delete('/api/admin/poetry/:id', adminAuth, (req: Request, res: Response) => {
  const items = readPoetry();
  const filtered = items.filter(item => item.id !== req.params.id);
  if (filtered.length === items.length) {
    return res.status(404).json({ error: 'Poetry not found' });
  }

  writePoetry(filtered);
  res.json({ success: true, message: 'په بریالیتوب سره ړنګ شو (Successfully deleted)' });
});

// GET /api/admin/settings
app.get('/api/admin/settings', adminAuth, (_req: Request, res: Response) => {
  res.json(readSettings());
});

// POST /api/admin/settings
app.post('/api/admin/settings', adminAuth, (req: Request, res: Response) => {
  const { autoApprove } = req.body;
  if (typeof autoApprove === 'boolean') {
    writeSettings({ autoApprove });
  }
  res.json(readSettings());
});

// ---------------- VITE / STATIC SERVING ---------------- //

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use('/Yasir.-Khan', express.static(distPath));
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT} in ${isProd ? 'production' : 'development'} mode`);
  });
}

startServer();
