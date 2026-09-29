export type PoetryCategory =
  | 'کلیواله شاعري'
  | 'ټپه'
  | 'غزل'
  | 'نظم'
  | 'رباعي'
  | 'لنډۍ'
  | 'د وطن شاعري'
  | 'نور';

export type PoetryStatus = 'published' | 'pending' | 'rejected';

export interface PoetryItem {
  id: string;
  item_number: number;
  poetry_text: string;
  title?: string;
  poet_name: string;
  category: PoetryCategory | string;
  tags: string[];
  created_at: string;
  updated_at?: string;
  status: PoetryStatus;
  views: number;
  likes: number;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large';
  cardSpacing: 'compact' | 'normal' | 'spacious';
  fontFamily: 'noto' | 'amiri' | 'scheherazade';
  direction: 'rtl' | 'ltr';
}

export interface SocialContacts {
  name: string;
  whatsapp: string;
  facebook: string;
  tiktok: string;
  email: string;
  phone?: string;
}

export const DEFAULT_CONTACTS: SocialContacts = {
  name: 'یاسر وزیروال (Yasir Wazirwaal)',
  whatsapp: '+93700000000',
  facebook: 'https://www.facebook.com/share/19hDDMwzmb/?mibextid=wwXIfr',
  tiktok: 'https://www.tiktok.com/@yasirwazirwaal1',
  email: '',
  phone: ''
};

export const CATEGORIES: PoetryCategory[] = [
  'کلیواله شاعري',
  'ټپه',
  'غزل',
  'نظم',
  'رباعي',
  'لنډۍ',
  'د وطن شاعري',
  'نور'
];

export const FAMOUS_POETS: string[] = [
  'رحمان بابا',
  'خوشحال خان خټک',
  'پیر روښان',
  'مرزا خان انصاري',
  'دولت لواڼی',
  'نازو انا',
  'عبدالحمید بابا',
  'افضل خان خټک',
  'دلنواز محب وزیر',
  'سرکی کمال',
  'دیوانه مروت',
  'رحمت الله درد',
  'تبسم مروت',
  'عبدالقادر خټک',
  'اشرف خان هجري',
  'احمد شاه ابدالي',
  'حافظ الپوري',
  'راحت زاخېلي',
  'عبدالرؤف بینوا',
  'ګل پاچا الفت',
  'سلیمان لایق',
  'حمزه شینواري',
  'غني خان',
  'اجمل خټک',
  'خاطر آفریدي',
  'قلندر مومند',
  'پریشان خټک',
  'کبیر ستوري',
  'رحمت شاه سائل',
  'اباسین یوسفزی',
  'عبدالباري جهاني',
  'پیر محمد کاروان',
  'سلمیٰ شاهین',
  'صاحب شاه صابر'
];
