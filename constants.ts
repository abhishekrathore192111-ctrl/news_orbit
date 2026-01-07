import { Category, Translation } from './types';

export const APP_CONFIG = {
  logoUrl: "https://i.imghippo.com/files/KyF9434tVI.jpeg"
};
// ------------------------------------------------------------------

export const CATEGORIES: Category[] = [
  { id: 'top-news', labelEn: 'Top News', labelHi: 'टॉप न्यूज़' },
  { id: 'local', labelEn: 'Local', labelHi: 'राज्य-शहर' },
  { id: 'db-original', labelEn: 'Orbit Original', labelHi: 'Orbit ओरिजिनल' },
  { id: 'sports', labelEn: 'Sports', labelHi: 'स्पोर्ट्स' },
  { id: 'entertainment', labelEn: 'Entertainment', labelHi: 'बॉलीवुड' },
  { id: 'education', labelEn: 'Jobs & Education', labelHi: 'जॉब - एजुकेशन' },
  { id: 'business', labelEn: 'Business', labelHi: 'बिजनेस' },
  { id: 'lifestyle', labelEn: 'Lifestyle', labelHi: 'लाइफस्टाइल' },
  { id: 'national', labelEn: 'National', labelHi: 'देश' },
  { id: 'international', labelEn: 'International', labelHi: 'विदेश' },
  { id: 'tech-auto', labelEn: 'Tech - Auto', labelHi: 'टेक - ऑटो' },
];

export const TRANSLATIONS: Translation = {
  login: { en: 'Login', hi: 'लॉगिन' },
  logout: { en: 'Logout', hi: 'लॉगआउट' },
  dashboard: { en: 'Dashboard', hi: 'डैशबोर्ड' },
  postNews: { en: 'Post News', hi: 'खबर पोस्ट करें' },
  readMore: { en: 'Read More', hi: 'और पढ़ें' },
  latestNews: { en: 'Latest News', hi: 'ताज़ा ख़बरें' },
  trending: { en: 'Trending', hi: 'ट्रेंडिंग' },
  pending: { en: 'Pending', hi: 'लंबित' },
  approved: { en: 'Approved', hi: 'स्वीकृत' },
  rejected: { en: 'Rejected', hi: 'अस्वीकृत' },
  submit: { en: 'Submit News', hi: 'समाचार जमा करें' },
  title: { en: 'Title', hi: 'शीर्षक' },
  content: { en: 'Content', hi: 'सामग्री' },
  image: { en: 'Image URL', hi: 'छवि यूआरएल' },
  category: { en: 'Category', hi: 'श्रेणी' },
  pleaseLogin: { en: 'Please login to continue', hi: 'कृपया आगे बढ़ने के लिए लॉगिन करें' },
  welcome: { en: 'Welcome', hi: 'स्वागत है' },
  adminPanel: { en: 'Admin Panel', hi: 'एडमिन पैनल' },
  approve: { en: 'Approve', hi: 'मंजूर करें' },
  reject: { en: 'Reject', hi: 'अस्वीकार करें' },
  delete: { en: 'Delete', hi: 'हटाएं' },
  status: { en: 'Status', hi: 'स्थिति' },
  date: { en: 'Date', hi: 'दिनांक' },
  author: { en: 'Reporter', hi: 'रिपोर्टर' },
  actions: { en: 'Actions', hi: 'कार्रवाई' },
  noNews: { en: 'No news found in this category.', hi: 'इस श्रेणी में कोई समाचार नहीं मिला।' },
  search: { en: 'Search news...', hi: 'समाचार खोजें...' },
};