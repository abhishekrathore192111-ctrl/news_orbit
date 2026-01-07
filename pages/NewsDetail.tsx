import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Api } from '../services/api';
import { NewsItem } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { Loader, Clock, User, Share2, MapPin, Tag, Copy, Facebook, MessageCircle, Twitter } from 'lucide-react';

const NewsDetail: React.FC = () => {
  const { newsId } = useParams<{ newsId: string }>();
  const { language } = useLanguage();
  const [article, setArticle] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [showShareMenu, setShowShareMenu] = useState(false);

  useEffect(() => {
    const fetchArticle = async () => {
      if (!newsId) return;
      setLoading(true);
      try {
        const data = await Api.getNewsById(newsId);
        setArticle(data);
      } catch (error) {
        console.error("Failed to fetch article", error);
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [newsId]);

  const handleShare = async () => {
    if (!article) return;
    const shareUrl = window.location.href;
    const shareTitle = article.title;
    if (navigator.share) {
      try { await navigator.share({ title: shareTitle, url: shareUrl }); } catch {}
    } else { setShowShareMenu(!showShareMenu); }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Link copied!");
    setShowShareMenu(false);
  };

  if (loading) return <div className="flex justify-center items-center h-screen"><Loader className="animate-spin text-brand-primary" size={32} /></div>;
  if (!article) return <div className="text-center py-20 text-xl text-text-muted">खबर नहीं मिली।</div>;

  const encodedUrl = encodeURIComponent(window.location.href);
  const encodedText = encodeURIComponent(article.title);

  return (
    <article className="max-w-4xl mx-auto bg-white shadow-sm rounded-lg overflow-hidden border border-brand-border">
      <div className="p-6 md:p-8">
        <header>
          <div className="flex items-center gap-4 mb-2">
             <span className="text-brand-primary font-bold uppercase tracking-wider text-sm bg-blue-50 px-2 py-1 rounded">
               {article.category}
             </span>
             {article.location && (
               <span className="flex items-center text-text-muted text-sm">
                 <MapPin size={14} className="mr-1" /> {article.location}
               </span>
             )}
          </div>
          
          <h1 className={`text-3xl md:text-4xl font-bold mt-2 mb-2 leading-tight text-text-headline ${language === 'hi' ? 'font-devanagari' : ''}`}>
            {article.title}
          </h1>
          
          {article.subHeadline && (
            <h2 className="text-xl text-text-body mb-4 font-medium leading-snug">
              {article.subHeadline}
            </h2>
          )}

          <div className="flex flex-wrap items-center gap-4 text-text-muted text-sm mb-6 pb-6 border-b border-brand-border relative">
            <div className="flex items-center">
              <Clock size={16} className="mr-1" />
              <time dateTime={article.createdAt}>{new Date(article.createdAt).toLocaleString('hi-IN')}</time>
            </div>
            <div className="flex items-center">
              <User size={16} className="mr-1" />
              <span>{article.authorName}</span>
            </div>
            
            <div className="ml-auto relative">
              <button onClick={handleShare} className="flex items-center text-brand-link hover:underline gap-1 font-bold">
                  <Share2 size={18} /> शेयर करें
              </button>
              {showShareMenu && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white shadow-lg rounded-lg border border-gray-200 z-50 p-2">
                       <a href={`https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`} target="_blank" rel="noreferrer" className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-green-50 rounded transition"><MessageCircle size={16} className="mr-2" /> WhatsApp</a>
                       <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`} target="_blank" rel="noreferrer" className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded transition"><Facebook size={16} className="mr-2" /> Facebook</a>
                       <a href={`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`} target="_blank" rel="noreferrer" className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded transition"><Twitter size={16} className="mr-2" /> Twitter</a>
                       <button onClick={copyToClipboard} className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition text-left"><Copy size={16} className="mr-2" /> लिंक कॉपी करें</button>
                  </div>
              )}
            </div>
          </div>
        </header>

        {article.image && (
          <figure className="w-full mb-8">
            <img 
              src={article.image} 
              alt={article.title} 
              className="w-full h-auto rounded-lg shadow-sm"
              loading="lazy"
            />
          </figure>
        )}

        <div className={`prose prose-lg max-w-none text-text-body leading-relaxed ${language === 'hi' ? 'font-devanagari' : ''}`}>
          {article.content.split('\n').map((paragraph, idx) => (
            <p key={idx} className="mb-4">{paragraph}</p>
          ))}
        </div>

        {article.additionalImages && article.additionalImages.length > 0 && (
            <div className="mt-8 mb-8">
                <h3 className="text-xl font-bold mb-4 text-gray-800">गैलरी</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {article.additionalImages.map((img, index) => (
                        <div key={index} className="rounded-lg overflow-hidden shadow-sm border border-gray-100">
                             <img src={img} alt={`${article.title} - गैलरी ${index + 1}`} className="w-full h-auto" loading="lazy" />
                        </div>
                    ))}
                </div>
            </div>
        )}
        
        {article.tags && article.tags.length > 0 && (
          <footer className="mt-8 pt-6 border-t border-brand-border">
             <div className="flex flex-wrap gap-2">
               {article.tags.map((tag, idx) => (
                 <span key={idx} className="flex items-center text-sm bg-brand-section px-3 py-1 rounded-full text-text-body border border-brand-border">
                   <Tag size={12} className="mr-1" />
                   {tag}
                 </span>
               ))}
             </div>
          </footer>
        )}
      </div>
    </article>
  );
};

export default NewsDetail;