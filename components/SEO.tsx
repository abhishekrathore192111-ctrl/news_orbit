import React, { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  article?: boolean;
}

const SEO: React.FC<SEOProps> = ({ title, description, image, article }) => {
  useEffect(() => {
    const siteTitle = 'Newsorbit India';
    const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
    document.title = fullTitle;

    const metaDescription = description || 'न्यूज़ऑर्बिट इंडिया पर पाएं देश, दुनिया, खेल, मनोरंजन और व्यापार की ताजातरीन खबरें हिंदी में।';
    const metaImage = image || 'https://i.imghippo.com/files/KyF9434tVI.jpeg';

    const updateMeta = (name: string, content: string, property = false) => {
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement('meta');
        if (property) el.setAttribute('property', name);
        else el.setAttribute('name', name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    updateMeta('description', metaDescription);
    updateMeta('og:title', fullTitle, true);
    updateMeta('og:description', metaDescription, true);
    updateMeta('og:image', metaImage, true);
    updateMeta('og:type', article ? 'article' : 'website', true);
    updateMeta('twitter:title', fullTitle, true);
    updateMeta('twitter:description', metaDescription, true);
    
  }, [title, description, image, article]);

  return null;
};

export default SEO;