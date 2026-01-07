import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useSiteConfig } from '../context/SiteConfigContext';
import { Menu, User as UserIcon, LogOut, PenTool, LayoutDashboard } from 'lucide-react';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { language, t } = useLanguage();
  const { config } = useSiteConfig();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-brand-header text-white shadow-md">
      {/* Top utility bar */}
      <div className="bg-white/10 py-1 text-xs border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center text-gray-300">
          <div>
            {new Date().toLocaleDateString('hi-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          <div className="flex gap-4 font-medium text-white">
             <span>हिंदी</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
           {/* Dynamic Logo */}
           {config.logoUrl && (
             <img 
               src={config.logoUrl} 
               alt="Logo" 
               className="h-14 w-auto object-contain bg-white rounded p-1 group-hover:opacity-90 transition"
               onError={(e) => {
                 // Hide broken image
                 (e.target as HTMLImageElement).style.display = 'none';
               }}
             />
           )}
           <div className="hidden md:flex flex-col">
             <span className="text-2xl font-bold leading-none tracking-tight text-white group-hover:text-brand-primary transition-colors">
               {config.siteName || 'NewsOrbit'}
             </span>
             <span className="text-xs text-gray-400 uppercase tracking-widest mt-1">
               देश और दुनिया की हर खबर
             </span>
           </div>
        </Link>

        {/* User Actions */}
        <div className="relative">
          {user ? (
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-2 text-sm font-medium hover:text-brand-primary transition text-white"
              >
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white backdrop-blur-sm">
                  <UserIcon size={16} />
                </div>
                <span className="hidden md:inline">{user.name}</span>
              </button>

              {/* Dropdown Menu */}
              {isMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-brand-border shadow-lg rounded-md z-50 py-1 text-text-body">
                  {user.role === 'admin' && (
                    <Link 
                      to="/admin/dashboard" 
                      className="flex items-center px-4 py-2 text-sm hover:bg-brand-section hover:text-brand-primary"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <LayoutDashboard size={16} className="mr-2" />
                      {t('adminPanel')}
                    </Link>
                  )}
                  {/* Check permission canPost */}
                  {(user.canPost || user.role === 'admin') && (
                    <Link 
                      to="/reporter/add" 
                      className="flex items-center px-4 py-2 text-sm hover:bg-brand-section hover:text-brand-primary"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <PenTool size={16} className="mr-2" />
                      {t('postNews')}
                    </Link>
                  )}
                  <button 
                    onClick={handleLogout}
                    className="flex w-full items-center px-4 py-2 text-sm hover:bg-brand-section hover:text-brand-danger"
                  >
                    <LogOut size={16} className="mr-2" />
                    {t('logout')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link 
              to="/login" 
              className="bg-brand-primary text-white px-5 py-2.5 rounded font-bold hover:bg-blue-700 transition shadow-lg"
            >
              {t('login')}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;