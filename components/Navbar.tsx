import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CATEGORIES } from '../constants';
import { useLanguage } from '../context/LanguageContext';

const Navbar: React.FC = () => {
  const { language } = useLanguage();
  const location = useLocation();

  return (
    <nav className="sticky top-0 z-40 bg-white shadow-sm border-b border-brand-border">
      <div className="max-w-7xl mx-auto">
        <div className="flex overflow-x-auto no-scrollbar py-3 px-4 md:px-0 space-x-6 whitespace-nowrap scroll-smooth">
          <Link
            to="/"
            className={`text-sm font-bold uppercase hover:text-brand-link transition-colors ${
              location.pathname === '/' ? 'text-brand-link border-b-2 border-brand-link' : 'text-text-headline'
            }`}
          >
            {language === 'hi' ? 'होम' : 'Home'}
          </Link>
          
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              to={`/category/${cat.id}`}
              className={`text-sm font-bold hover:text-brand-link transition-colors ${
                location.pathname === `/category/${cat.id}` ? 'text-brand-link border-b-2 border-brand-link' : 'text-text-body'
              } ${language === 'hi' ? 'font-devanagari' : 'font-sans'}`}
            >
              {language === 'hi' ? cat.labelHi : cat.labelEn}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;