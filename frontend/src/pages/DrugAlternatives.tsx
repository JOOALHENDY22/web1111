import { useState, useEffect, useRef } from 'react';
import { RefreshCw, Search, ArrowRight, Loader2, Info, Factory, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { fetchDrugAlternatives, fetchDrugSuggestions } from '../services/api';

export default function DrugAlternatives() {
  const { i18n } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [alternatives, setAlternatives] = useState<any>(null);
  const [error, setError] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (alternatives && resultsRef.current) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [alternatives]);
  
  const suggestionRef = useRef<HTMLDivElement>(null);

  // Close suggestions on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search for autocomplete suggestions
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        const results = await fetchDrugSuggestions(searchQuery);
        setSuggestions(results);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    setSearchQuery(query);
    setShowSuggestions(false);
    setIsSearching(true);
    setError(false);
    setAlternatives(null);

    try {
      const data = await fetchDrugAlternatives(query);
      if (data && data.alternatives) {
        setAlternatives(data);
      } else {
        setError(true);
      }
    } catch (e) {
      console.error(e);
      setError(true);
    } finally {
      setIsSearching(false);
    }
  };

  const isArabic = i18n.language.startsWith('ar');

  return (
    <div className="max-w-4xl mx-auto py-8">
      {/* Title */}
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-5xl font-bold mb-4 flex items-center justify-center gap-3">
          <RefreshCw className="h-8 w-8 text-primary-500 animate-spin-slow" />
          {isArabic ? 'بدائل الأدوية المصرية والعالمية' : 'Egyptian & Generic Drug Alternatives'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {isArabic 
            ? 'اعثر على البدائل الطبية التجارية المتاحة في مصر بنفس المادة الفعالة ومستويات الأسعار' 
            : 'Find alternative brand name drugs sharing the exact same active pharmaceutical ingredient.'}
        </p>
      </div>

      {/* Search Section */}
      <div className="relative mb-10" ref={suggestionRef}>
        <form onSubmit={(e) => { e.preventDefault(); handleSearch(searchQuery); }} className="relative">
          <div className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-4 rtl:pr-4 flex items-center pointer-events-none">
            <Search className="h-6 w-6 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-12 rtl:pl-4 rtl:pr-12 pr-32 rtl:pr-12 rtl:pl-32 py-5 text-lg rounded-2xl border-0 ring-1 ring-inset ring-gray-200 dark:ring-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-lg shadow-gray-200/20 dark:shadow-none focus:ring-2 focus:ring-inset focus:ring-primary-500 transition-all"
            placeholder={isArabic ? 'ادخل اسم الدواء (مثال: Voltaren, Antinal, Congestal)...' : 'Enter drug name (e.g. Voltaren, Antinal, Congestal)...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => { if(suggestions.length > 0) setShowSuggestions(true); }}
          />
          <div className="absolute inset-y-0 right-2 rtl:right-auto rtl:left-2 flex items-center">
            <button
              type="submit"
              disabled={!searchQuery.trim() || isSearching}
              className="btn-primary py-3 px-6 rounded-xl text-sm"
            >
              {isSearching ? <Loader2 className="h-5 w-5 animate-spin" /> : (isArabic ? 'ابحث عن البدائل' : 'Find Alternatives')}
            </button>
          </div>
        </form>

        {/* Live Auto-Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute w-full mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-20">
            {suggestions.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => handleSearch(suggestion)}
                className="w-full text-left rtl:text-right px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-center justify-between transition-colors border-b last:border-b-0 border-gray-100 dark:border-gray-700"
              >
                <span className="font-medium text-gray-900 dark:text-white">{suggestion}</span>
                <ArrowRight className="h-4 w-4 text-gray-400 rtl:rotate-180" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Loading state */}
      {isSearching && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-10 w-10 animate-spin text-primary-500 mb-3" />
          <p className="text-gray-500 text-sm">{isArabic ? 'جاري تحليل المادة الفعالة واستخراج البدائل...' : 'Analyzing active ingredient and retrieving alternatives...'}</p>
        </div>
      )}

      {/* Error state */}
      {error && !isSearching && (
        <div className="glass-panel p-8 text-center border-l-4 border-l-red-500">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold mb-2">{isArabic ? 'لم نتمكن من العثور على بدائل' : 'No Alternatives Found'}</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {isArabic 
              ? `عذراً، لم نتمكن من تحديد المادة الفعالة أو بدائل تجارية مسجلة لـ "${searchQuery}". تأكد من كتابة الاسم التجاري بشكل صحيح.` 
              : `Could not identify active ingredients or Egyptian equivalents for "${searchQuery}". Please check the spelling.`}
          </p>
        </div>
      )}

      {/* Results Section */}
      {alternatives && !isSearching && (
        <div ref={resultsRef} className="space-y-6 animate-fade-in scroll-mt-24">
          {/* Active Ingredient Summary */}
          <div className="glass-panel p-6 bg-gradient-to-r from-primary-500/10 to-transparent border-l-4 border-l-primary-500">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-xl">
                <Info className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-primary-800 dark:text-primary-300 uppercase tracking-wider">{isArabic ? 'المادة الفعالة / الاسم العلمي' : 'Active Scientific Ingredient'}</h3>
                <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                  {isArabic 
                    ? (alternatives.active_ingredient_ar || alternatives.active_ingredient) 
                    : (alternatives.active_ingredient_en || alternatives.active_ingredient)}
                </p>
              </div>
            </div>
          </div>

          {/* Alternatives Grid */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {isArabic ? 'البدائل التجارية المطابقة في مصر:' : 'Equivalent Brand Options in Egypt:'}
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {alternatives.alternatives.map((alt: any, idx: number) => (
                <Link
                  key={idx}
                  to={`/drug/${encodeURIComponent(alt.brand_name)}`}
                  className="glass-panel p-5 hover:border-primary-500 hover:shadow-lg transition-all duration-300 flex justify-between items-start group"
                >
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-primary-500 transition-colors">
                      {alt.brand_name}
                    </h3>
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 gap-1">
                      <Factory className="h-3.5 w-3.5" />
                      <span>{alt.manufacturer}</span>
                    </div>
                  </div>
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400">
                    {isArabic 
                      ? (alt.price_category_ar || alt.price_category) 
                      : (alt.price_category_en || alt.price_category)}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="p-4 bg-amber-50 dark:bg-amber-950/10 rounded-xl border border-amber-200 dark:border-amber-900/30 text-xs text-amber-800 dark:text-amber-300 text-center leading-relaxed">
            <strong>{isArabic ? 'تنبيه طبي هام: ' : 'Medical Disclaimer: '}</strong>
            {isArabic 
              ? 'يرجى مراجعة الصيدلي أو الطبيب المعالج قبل استبدال أي دواء، للتأكد من ملاءمة التركيز والجرعة الطبية وشكل الدواء (أقراص، حقن، شراب) لحالتك الصحية.' 
              : 'Please consult your pharmacist or treating physician before replacing any medication to ensure appropriate dosage strength and pharmaceutical form.'}
          </div>
        </div>
      )}
    </div>
  );
}
