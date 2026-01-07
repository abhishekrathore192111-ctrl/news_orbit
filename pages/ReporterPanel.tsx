import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Api } from '../services/api';
import { CATEGORIES } from '../constants';
import { CheckCircle, Link as LinkIcon, Send, AlertTriangle, User as UserIcon, Trash2, ArrowLeft, Loader, ImageIcon } from 'lucide-react';
import { NewsStatus } from '../types';

const ReporterPanel: React.FC = () => {
  const { newsId } = useParams<{ newsId: string }>(); 
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [publishDate, setPublishDate] = useState(new Date().toISOString().slice(0, 16));

  const [formData, setFormData] = useState({
    title: '',
    subHeadline: '',
    location: '',
    content: '',
    image: '',
    category: 'top-news',
    tags: '',
    language: 'hi' as 'en' | 'hi'
  });

  useEffect(() => {
    if (newsId) {
        setLoading(true);
        Api.getNewsById(newsId).then(data => {
            if (data) {
                setFormData({
                    title: data.title,
                    subHeadline: data.subHeadline || '',
                    location: data.location || '',
                    content: data.content,
                    image: data.image || '',
                    category: data.category,
                    tags: data.tags?.join(', ') || '',
                    language: data.language
                });
                setPublishDate(data.createdAt.slice(0, 16));
            }
        }).finally(() => setLoading(false));
    }
  }, [newsId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent, actionType: 'draft' | 'publish') => {
    e.preventDefault();

    if (!formData.title.trim()) { alert("शीर्षक अनिवार्य है।"); return; }
    if (!formData.content.trim()) { alert("सामग्री अनिवार्य है।"); return; }
    
    setLoading(true);
    try {
      let finalStatus: NewsStatus = actionType === 'publish' 
        ? (user?.role === 'admin' ? 'approved' : 'pending') 
        : 'draft';

      const payload = {
        title: formData.title,
        subHeadline: formData.subHeadline,
        content: formData.content,
        image: formData.image || '', // Using the URL from the input
        additionalImages: [], // Keeping simple for URL-only focus
        category: formData.category,
        location: formData.location,
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
        language: formData.language,
        status: finalStatus,
        createdAt: new Date(publishDate).toISOString()
      };

      if (newsId) {
          await Api.updateNews(newsId, payload);
          setStatusMessage({ type: 'success', text: 'समाचार अपडेट कर दिया गया है!' });
      } else {
          await Api.addNews(payload, user!);
          setStatusMessage({ type: 'success', text: 'समाचार सफलतापूर्वक पोस्ट कर दिया गया है!' });
          setFormData({ title: '', subHeadline: '', location: '', content: '', image: '', category: 'top-news', tags: '', language: 'hi' });
      }
      
      window.scrollTo(0, 0);
      setTimeout(() => {
          setStatusMessage({ type: '', text: '' });
          if (newsId || actionType === 'publish') navigate(user?.role === 'admin' ? '/admin/dashboard' : '/');
      }, 2000);

    } catch (error: any) {
      setStatusMessage({ type: 'error', text: error.message || 'कार्रवाई विफल रही' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto bg-white p-6 md:p-10 rounded-lg shadow-sm border border-brand-border">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-6 border-b border-gray-100">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-text-headline">
             {newsId && (
                 <button onClick={() => navigate(-1)} className="mr-2 p-1 rounded hover:bg-gray-100"><ArrowLeft /></button>
             )}
            <Send className="text-brand-primary" />
            {newsId ? 'खबर एडिट करें' : 'नई खबर लिखें'}
          </h1>
        </div>
        
        <div className="bg-blue-50 text-brand-primary px-3 py-1 rounded text-sm font-medium border border-blue-100 flex items-center gap-2">
          <UserIcon size={14} /> {user?.name}
        </div>
      </div>

      {statusMessage.text && (
        <div className={`p-4 rounded mb-8 flex items-start animate-fade-in ${
          statusMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {statusMessage.type === 'success' ? <CheckCircle className="mr-2" size={20} /> : <AlertTriangle className="mr-2" size={20} />}
          <span className="font-medium">{statusMessage.text}</span>
        </div>
      )}

      <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">मुख्य शीर्षक (Headline) <span className="text-red-500">*</span></label>
            <input name="title" required value={formData.title} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary outline-none" placeholder="यहाँ मुख्य हेडलाइन लिखें" />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">संक्षिप्त विवरण (Sub Headline)</label>
            <input name="subHeadline" value={formData.subHeadline} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary outline-none" placeholder="एक छोटी समरी (वैकल्पिक)" />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">स्थान (Location)</label>
            <input name="location" value={formData.location} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none" placeholder="जैसे: मुंबई, दिल्ली" />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">कैटेगरी (Category)</label>
            <select name="category" value={formData.category} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none bg-white">
                {CATEGORIES.map(cat => (<option key={cat.id} value={cat.id}>{cat.labelHi}</option>))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8">
           <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
              <LinkIcon size={16} className="text-brand-primary" /> खबर की फोटो का लिंक (Image URL)
            </label>
            <div className="flex gap-2">
              <input 
                name="image" 
                value={formData.image} 
                onChange={handleChange} 
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary outline-none" 
                placeholder="https://example.com/image.jpg" 
              />
            </div>
            
            {/* Image Preview Area */}
            <div className="mt-4 border-2 border-dashed border-gray-200 rounded-lg p-2 min-h-[200px] flex items-center justify-center bg-gray-50 overflow-hidden">
                {formData.image ? (
                    <img 
                        src={formData.image} 
                        alt="Preview" 
                        className="max-w-full max-h-[300px] object-contain rounded shadow-sm"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Invalid+Image+URL';
                        }}
                    />
                ) : (
                    <div className="text-center text-gray-400">
                        <ImageIcon size={48} className="mx-auto mb-2 opacity-20" />
                        <p className="text-sm">लिंक डालने पर यहाँ फोटो दिखाई देगी</p>
                    </div>
                )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">खबर विस्तार से (Content) <span className="text-red-500">*</span></label>
            <textarea name="content" required rows={10} value={formData.content} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-primary" placeholder="यहाँ पूरी खबर लिखें..."></textarea>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-gray-100">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">टैग्स (Tags)</label>
            <input name="tags" value={formData.tags} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none" placeholder="चुनाव, राजनीति, क्रिकेट" />
          </div>
          <div>
             <label className="block text-sm font-bold text-gray-700 mb-2">तारीख और समय</label>
            <input type="datetime-local" value={publishDate} onChange={(e) => setPublishDate(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none" />
          </div>
        </div>

        <div className="flex gap-4 pt-6 border-t border-gray-200">
          <button 
            type="button" 
            disabled={loading}
            onClick={(e) => handleSubmit(e, 'draft')} 
            className="flex-1 bg-white border border-gray-300 py-3 rounded-lg font-bold hover:bg-gray-50 disabled:opacity-50"
          >
            ड्राफ्ट सेव करें
          </button>
          <button 
            type="button" 
            disabled={loading}
            onClick={(e) => handleSubmit(e, 'publish')} 
            className="flex-1 bg-brand-primary text-white py-3 rounded-lg font-bold hover:bg-blue-800 disabled:opacity-50 flex justify-center items-center gap-2 shadow-lg"
          >
            {loading && <Loader size={18} className="animate-spin" />}
            {newsId ? 'अपडेट करें' : (user?.role === 'admin' ? 'अभी पब्लिश करें' : 'मंजूरी के लिए भेजें')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReporterPanel;