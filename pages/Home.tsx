import React, { useEffect, useState } from 'react';
import { Api } from '../services/api';
import { NewsItem } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useSiteConfig } from '../context/SiteConfigContext';
import NewsCard from '../components/NewsCard';
import { ArrowRight, Loader } from 'lucide-react';

const Home: React.FC = () => {
  const { language, t } = useLanguage();
  const { config } = useSiteConfig();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        const data = await Api.getNews(language);
        setNews(data);
      } catch (error) {
        console.error("Failed to fetch news", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, [language]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="animate-spin text-brand-primary" size={32} />
      </div>
    );
  }

  const featuredNews = news.length > 0 ? news[0] : null;
  const topStories = news.slice(1, 5);
  const latestFeed = news.slice(5);

  return (
    <div className="space-y-8">
      {config.promotions.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {config.promotions.map(p => (
                  <a key={p.id} href={p.linkUrl} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-lg shadow-sm hover:opacity-95 transition">
                      <img src={p.imageUrl} alt="न्यूज़ऑर्बिट प्रमोशन" className="w-full h-auto object-cover max-h-32" />
                  </a>
              ))}
          </div>
      )}

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {featuredNews && <NewsCard news={featuredNews} featured={true} />}
        </div>
        <aside className="space-y-4">
          <div className="flex items-center justify-between border-b-2 border-brand-breaking pb-2">
            <h2 className="text-xl font-bold text-text-headline">{t('trending')}</h2>
            <ArrowRight size={16} className="text-brand-breaking" />
          </div>
          <div className="flex flex-col gap-4">
            {topStories.map(item => (
              <NewsCard key={item.id} news={item} />
            ))}
          </div>
        </aside>
      </section>

      <section>
        <div className="flex items-center justify-between border-b border-brand-border pb-2 mb-6">
          <h2 className="text-2xl font-bold border-l-4 border-brand-primary pl-3 text-text-headline">
            {t('latestNews')}
          </h2>
        </div>
        
        {latestFeed.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {latestFeed.map(item => (
              <NewsCard key={item.id} news={item} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-text-muted bg-white rounded-lg border border-brand-border">
            {t('noNews')}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;