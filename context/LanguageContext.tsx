import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, Translation } from '../types';
import { TRANSLATIONS } from '../constants';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof Translation) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Default to Hindi
  const [language, setLanguageState] = useState<Language>('hi');

  useEffect(() => {
    // Enforce Hindi on load, ignoring previous settings
    setLanguageState('hi');
    localStorage.setItem('bhaskar_lang', 'hi');
  }, []);

  const setLanguage = (lang: Language) => {
    // Force Hindi regardless of input
    setLanguageState('hi');
    localStorage.setItem('bhaskar_lang', 'hi');
  };

  const t = (key: keyof Translation): string => {
    const entry = TRANSLATIONS[key];
    if (!entry) return key as string; // Fallback to key if missing
    return entry[language];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};