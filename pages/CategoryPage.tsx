import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Api } from '../services/api';
import { NewsItem } from '../types';
import { useLanguage } from '../context/LanguageContext';
import NewsCard from '../components/NewsCard';
import { Loader } from 'lucide-react';
import { CATEGORIES } from '../constants';

const CategoryPage: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const { language, t } = useLanguage();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  const categoryLabel = CATEGORIES.find(c => c.id === categoryId);
  const title = language === 'hi' ? categoryLabel?.labelHi : categoryLabel?.labelEn;

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        const data = await Api.getNews(language, categoryId);
        setNews(data);
      } catch (error) {
        console.error("Failed to fetch category news", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, [language, categoryId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="animate-spin text-brand-primary" size={32} />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 border-b border-gray-200 pb-2">
        <h1 className={`text-3xl font-bold text-gray-900 border-l-4 border-brand-primary pl-4 ${language === 'hi' ? 'font-devanagari' : ''}`}>
          {title || categoryId}
        </h1>
      </div>

      {news.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {news.map(item => (
            <NewsCard key={item.id} news={item} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded shadow-sm">
          <p className="text-gray-500 text-lg">{t('noNews')}</p>
        </div>
      )}
    </div>
  );
};

export default CategoryPage;