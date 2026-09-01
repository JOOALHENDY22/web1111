import { Outlet, Link, useLocation } from 'react-router-dom';
import { Pill, Search, Activity, Scale, Heart, History, Info, Moon, Sun, Menu, X, Globe, RefreshCw, ShieldAlert, HeartPulse, Utensils } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export default function MainLayout() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const langMenuRef = useRef<HTMLDivElement>(null);
  const [showGreeting, setShowGreeting] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => setShowGreeting(true), 1000);
    const timer2 = setTimeout(() => setShowGreeting(false), 6000);
    return () => { clearTimeout(timer1); clearTimeout(timer2); };
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    // Update direction for RTL support
    const dir = i18n.language.startsWith('ar') ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setIsLangMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setIsLangMenuOpen(false);
  };

  const navItems = [
    { name: t('nav.search'), path: '/search', icon: Search },
    { name: t('nav.interactions'), path: '/interaction', icon: Activity },
    { name: t('nav.compare'), path: '/compare', icon: Scale },
    { name: t('nav.alternatives'), path: '/alternatives', icon: RefreshCw },
    { name: t('nav.chronic_safety'), path: '/chronic-safety', icon: ShieldAlert },
    { name: t('nav.vitals'), path: '/vitals', icon: HeartPulse },
    { name: t('nav.food_interactions'), path: '/food-interactions', icon: Utensils },
    { name: t('nav.favorites'), path: '/favorites', icon: Heart },
    { name: t('nav.history'), path: '/history', icon: History },
    { name: t('nav.about'), path: '/about', icon: Info },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-panel rounded-none border-t-0 border-l-0 border-r-0 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary-600 via-primary-500 to-teal-400 flex items-center justify-center shadow-lg shadow-primary-500/25 group-hover:scale-105 group-hover:shadow-primary-500/40 transition-all duration-300">
                  <Pill className="h-5 w-5 text-white transform -rotate-45" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-900 shadow-sm"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black tracking-tight leading-none text-gray-900 dark:text-white">
                  Yo<span className="bg-gradient-to-r from-primary-500 via-teal-500 to-emerald-500 bg-clip-text text-transparent">Pharma</span>
                </span>
                <span className="text-[9px] font-bold tracking-widest uppercase text-gray-400 dark:text-gray-500 font-mono mt-0.5">
                  Clinical Intelligence
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-1 rtl:space-x-reverse">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`flex items-center space-x-1.5 rtl:space-x-reverse px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive 
                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' 
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Actions */}
            <div className="flex items-center space-x-2 rtl:space-x-reverse relative">
              {/* Language Switcher */}
              <div className="relative" ref={langMenuRef}>
                <button
                  onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                  className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 flex items-center"
                  aria-label="Change Language"
                >
                  <Globe className="h-5 w-5" />
                </button>
                
                <AnimatePresence>
                  {isLangMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-48 rounded-xl shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 overflow-hidden z-50 border border-gray-100 dark:border-gray-700"
                    >
                      <div className="py-1">
                        <button onClick={() => changeLanguage('en')} className={`w-full text-left rtl:text-right px-4 py-2 text-sm ${i18n.language === 'en' ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>English</button>
                        <button onClick={() => changeLanguage('ar')} className={`w-full text-left rtl:text-right px-4 py-2 text-sm ${i18n.language === 'ar' ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>عربي فصحى</button>
                        <button onClick={() => changeLanguage('ar-EG')} className={`w-full text-left rtl:text-right px-4 py-2 text-sm ${i18n.language === 'ar-EG' ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>عامية مصرية</button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
                aria-label="Toggle Dark Mode"
              >
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              
              <div className="md:hidden">
                <button
                  onClick={() => {
                    const nextState = !isMobileMenuOpen;
                    setIsMobileMenuOpen(nextState);
                    if (nextState) {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                  className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors focus:outline-none"
                  aria-label="Toggle Navigation Menu"
                >
                  {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-panel rounded-none border-x-0 border-b border-t-0"
          >
            <div className="px-4 pt-2 pb-4 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 rtl:space-x-reverse px-3 py-3 rounded-xl text-base font-medium transition-all ${
                      isActive 
                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' 
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Greeting Toast */}
      <AnimatePresence>
        {showGreeting && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-6 right-6 rtl:left-6 rtl:right-auto z-[100] bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-6 py-4 rounded-2xl shadow-2xl border border-primary-200 dark:border-primary-900/50 flex items-center space-x-3 rtl:space-x-reverse"
          >
            <div className="bg-primary-100 dark:bg-primary-900/30 p-2 rounded-full text-primary-600 dark:text-primary-400">
              <Heart className="h-5 w-5 fill-current" />
            </div>
            <p className="font-bold text-lg tracking-wide text-primary-700 dark:text-primary-400">
              صَلِّ عَلَى النَّبِيِّ مُحَمَّد ﷺ
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
