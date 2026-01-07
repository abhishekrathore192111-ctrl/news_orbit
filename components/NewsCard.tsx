import React from 'react';
import { Link } from 'react-router-dom';
import { NewsItem } from '../types';
import { Clock, Image as ImageIcon } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface NewsCardProps {
  news: NewsItem;
  featured?: boolean;
}

const NewsCard: React.FC<NewsCardProps> = ({ news, featured = false }) => {
  const { language } = useLanguage();

  // Use news.image from NewsItem type
  const displayImage = news.image || 'https://i.imghippo.com/files/KyF9434tVI.jpeg';

  if (featured) {
    return (
      <Link
        to={`/news/${news.id}`}
        className="group block relative overflow-hidden rounded-lg shadow-md h-96 bg-gray-100"
      >
        <img
          src={displayImage}
          alt={news.title}
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
            !news.image ? 'opacity-30' : ''
          }`}
          loading="lazy"
        />

        {!news.image && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <ImageIcon size={48} className="text-gray-400 opacity-20" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="bg-brand-breaking text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
              {news.category}
            </span>
            <div className="flex items-center text-gray-300 text-xs">
              <Clock size={12} className="mr-1" />
              {new Date(news.createdAt).toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US')}
            </div>
          </div>
          <h2 className={`text-white text-2xl md:text-3xl font-bold leading-tight group-hover:text-blue-300 transition-colors ${language === 'hi' ? 'font-devanagari' : ''}`}>
            {news.title}
          </h2>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/news/${news.id}`} className="group flex flex-col bg-white rounded-lg border border-brand-border overflow-hidden shadow-sm hover:shadow-md transition-shadow h-full">
      <div className="relative h-48 overflow-hidden bg-gray-50">
        <img
          src={displayImage}
          alt={news.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        {!news.image && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <ImageIcon size={32} className="text-gray-300" />
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex items-center justify-between mb-2">
           <span className="text-[10px] font-bold text-brand-primary uppercase tracking-tighter">
             {news.category}
           </span>
           <span className="text-[10px] text-text-muted flex items-center">
             <Clock size={10} className="mr-1" />
             {new Date(news.createdAt).toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US')}
           </span>
        </div>
        <h3 className={`text-text-headline font-bold text-lg leading-snug group-hover:text-brand-link transition-colors line-clamp-3 mb-2 ${language === 'hi' ? 'font-devanagari' : ''}`}>
          {news.title}
        </h3>
        <p className="text-text-muted text-xs line-clamp-2 mt-auto">
          {news.subHeadline || news.content}
        </p>
      </div>
    </Link>
  );
};

export default NewsCard;