import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, Info, Factory, Activity, Heart, ArrowLeft, Bookmark, Loader2, Baby, PersonStanding, AlertOctagon, HeartPulse, RefreshCw, Utensils, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { searchDrugFDA, fetchDrugAlternatives, fetchFoodInteractions } from '../services/api';
import { translateText } from '../services/translator';

export default function DrugDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [isSaved, setIsSaved] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [drugData, setDrugData] = useState<any>(null);
  const [error, setError] = useState(false);
  const [alternativesData, setAlternativesData] = useState<any>(null);
  const [, setLoadingAlternatives] = useState(false);
  const [foodData, setFoodData] = useState<any>(null);

  const searchName = id ? id.charAt(0).toUpperCase() + id.slice(1) : 'Unknown Drug';

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('savedDrugs') || '[]');
    if (saved.includes(searchName)) setIsSaved(true);
  }, [searchName]);

  const toggleSave = () => {
    const saved: string[] = JSON.parse(localStorage.getItem('savedDrugs') || '[]');
    if (isSaved) {
      const newSaved = saved.filter(d => d !== searchName);
      localStorage.setItem('savedDrugs', JSON.stringify(newSaved));
      setIsSaved(false);
    } else {
      if (!saved.includes(searchName)) saved.push(searchName);
      localStorage.setItem('savedDrugs', JSON.stringify(saved));
      setIsSaved(true);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(false);
      const data = await searchDrugFDA(searchName);
      if (data) {
        const getField = (val: any) => Array.isArray(val) ? val[0] : (typeof val === 'string' ? val : '');

        const isEn = i18n.language.startsWith('en');
        const purpose = (isEn ? data.purpose_en?.[0] : data.purpose_ar?.[0]) || getField(data.purpose) || getField(data.indications_and_usage) || 'No specific indications listed in the label.';
        const warnings = (isEn ? data.warnings_en?.[0] : data.warnings_ar?.[0]) || getField(data.warnings) || getField(data.boxed_warning) || 'No major warnings provided in this label format.';
        const dosage = (isEn ? data.dosage_and_administration_en?.[0] : data.dosage_and_administration_ar?.[0]) || getField(data.dosage_and_administration) || 'Consult a healthcare provider for dosage.';
        const pregnancy = (isEn ? data.pregnancy_en?.[0] : data.pregnancy_ar?.[0]) || getField(data.pregnancy) || 'No specific pregnancy data provided.';
        const pediatric = (isEn ? data.pediatric_use_en?.[0] : data.pediatric_use_ar?.[0]) || getField(data.pediatric_use) || 'No specific pediatric guidelines provided.';
        const geriatric = (isEn ? data.geriatric_use_en?.[0] : data.geriatric_use_ar?.[0]) || getField(data.geriatric_use) || 'No specific geriatric guidelines provided.';
        const contraindications = (isEn ? data.contraindications_en?.[0] : data.contraindications_ar?.[0]) || getField(data.contraindications) || 'No contraindications listed.';
        const adverseReactions = (isEn ? data.adverse_reactions_en?.[0] : data.adverse_reactions_ar?.[0]) || getField(data.adverse_reactions) || 'No adverse reactions listed.';

        setDrugData({
          original: data,
          translated: {
            purpose: (isEn ? data.purpose_en?.[0] : data.purpose_ar?.[0]) ? purpose : await translateText(purpose, i18n.language),
            warnings: (isEn ? data.warnings_en?.[0] : data.warnings_ar?.[0]) ? warnings : await translateText(warnings, i18n.language),
            dosage: (isEn ? data.dosage_and_administration_en?.[0] : data.dosage_and_administration_ar?.[0]) ? dosage : await translateText(dosage, i18n.language),
            pregnancy: (isEn ? data.pregnancy_en?.[0] : data.pregnancy_ar?.[0]) ? pregnancy : await translateText(pregnancy, i18n.language),
            pediatric: (isEn ? data.pediatric_use_en?.[0] : data.pediatric_use_ar?.[0]) ? pediatric : await translateText(pediatric, i18n.language),
            geriatric: (isEn ? data.geriatric_use_en?.[0] : data.geriatric_use_ar?.[0]) ? geriatric : await translateText(geriatric, i18n.language),
            contraindications: (isEn ? data.contraindications_en?.[0] : data.contraindications_ar?.[0]) ? contraindications : await translateText(contraindications, i18n.language),
            adverseReactions: (isEn ? data.adverse_reactions_en?.[0] : data.adverse_reactions_ar?.[0]) ? adverseReactions : await translateText(adverseReactions, i18n.language),
          }
        });

        // Fetch alternatives in background
        try {
          setLoadingAlternatives(true);
          const alts = await fetchDrugAlternatives(searchName);
          setAlternativesData(alts);
        } catch (e) {
          console.error("Failed to load alternatives inside details:", e);
        } finally {
          setLoadingAlternatives(false);
        }

        // Fetch food interactions in background
        try {
          const food = await fetchFoodInteractions(searchName);
          setFoodData(food);
        } catch (e) {
          console.error("Failed to load food interactions inside details:", e);
        }
      } else {
        setError(true);
      }
      setLoading(false);
    };

    if (id) {
      fetchData();
    }
  }, [id, i18n.language]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary-500 mb-4" />
        <p className="text-gray-500">Fetching and translating real medical data...</p>
      </div>
    );
  }

  if (error || !drugData) {
    const isAr = i18n.language.startsWith('ar');
    return (
      <div className="max-w-4xl mx-auto py-16 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-3xl bg-rose-50 dark:bg-rose-950/30 text-rose-500 flex items-center justify-center mx-auto mb-4 border border-rose-200 dark:border-rose-900/50 shadow-lg shadow-rose-500/10">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold mb-2">
          {isAr ? 'تعذر تحميل بيانات الدواء' : 'Unable to Load Medication Details'}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
          {isAr 
            ? `لم يتم العثور على تفاصيل دوائية كافية لـ "${searchName}". قد يكون هناك ضغط على الخادم أو خطأ في الاسم.`
            : `Could not retrieve clinical details for "${searchName}". The service might be busy or the drug name may contain a typo.`}
        </p>
        <div className="flex items-center justify-center gap-3">
          <button 
            onClick={() => window.location.reload()} 
            className="btn-primary"
          >
            {isAr ? 'إعادة المحاولة' : 'Retry'}
          </button>
          <Link to="/search" className="btn-secondary">
            {isAr ? 'البحث عن دواء آخر' : 'Search Another Drug'}
          </Link>
        </div>
      </div>
    );
  }

  const genericName = drugData.original.openfda?.generic_name?.[0] || 'Unknown Generic';
  const manufacturer = drugData.original.openfda?.manufacturer_name?.[0] || 'Unknown Manufacturer';
  
  const { purpose, warnings, dosage, pregnancy, pediatric, geriatric, contraindications, adverseReactions } = drugData.translated;

  return (
    <div className="max-w-4xl mx-auto pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between mb-8 gap-4">
        <div>
          <Link to="/search" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-1 rtl:ml-1 rtl:mr-0 rtl:rotate-180" />
            {t('details.back')}
          </Link>
          <div className="flex items-center space-x-3 rtl:space-x-reverse mb-2">
            <h1 className="text-3xl md:text-5xl font-bold">{searchName}</h1>
            <span className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-semibold rounded-full">{t('details.verified')}</span>
          </div>
          <p className="text-xl text-gray-500 dark:text-gray-400 flex items-center">
            <Factory className="h-5 w-5 mr-2 rtl:ml-2 rtl:mr-0" />
            {genericName}
          </p>
        </div>
        <div className="flex space-x-3 rtl:space-x-reverse">
          <button 
            onClick={toggleSave}
            className={`btn-secondary flex items-center space-x-2 rtl:space-x-reverse ${isSaved ? 'text-red-500 border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10' : ''}`}
          >
            <Heart className={`h-5 w-5 ${isSaved ? 'fill-current' : ''}`} />
            <span>{isSaved ? t('details.btn_saved') : t('details.btn_save')}</span>
          </button>
          <button 
            onClick={() => navigate('/compare', { state: { drugA: searchName } })}
            className="btn-primary flex items-center space-x-2 rtl:space-x-reverse"
          >
            <Bookmark className="h-5 w-5" />
            <span>{t('details.btn_compare')}</span>
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          <div className="glass-panel p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center border-b border-gray-100 dark:border-gray-800 pb-3">
              <Info className="h-5 w-5 mr-2 rtl:ml-2 rtl:mr-0 text-primary-500" />
              {t('details.indications')}
            </h2>
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <p className="text-sm leading-relaxed">{purpose}</p>
            </div>
          </div>
          
          <div className="glass-panel p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center border-b border-gray-100 dark:border-gray-800 pb-3">
              <Activity className="h-5 w-5 mr-2 rtl:ml-2 rtl:mr-0 text-primary-500" />
              {t('details.dosage')}
            </h2>
            <div className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed max-h-48 overflow-y-auto pr-2">
              {dosage}
            </div>
          </div>

          <div className="glass-panel p-6 border-l-4 border-l-amber-500 rtl:border-r-4 rtl:border-r-amber-500 rtl:border-l-0">
            <h2 className="text-xl font-semibold mb-4 flex items-center text-amber-600 dark:text-amber-500">
              <ShieldAlert className="h-5 w-5 mr-2 rtl:ml-2 rtl:mr-0" />
              {t('details.warnings')}
            </h2>
            <div className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed max-h-48 overflow-y-auto pr-2">
              {warnings}
            </div>
          </div>
          
          <div className="glass-panel p-6 border-l-4 border-l-red-500 rtl:border-r-4 rtl:border-r-red-500 rtl:border-l-0 bg-red-50/50 dark:bg-red-900/10">
            <h2 className="text-xl font-semibold mb-4 flex items-center text-red-600 dark:text-red-500">
              <AlertOctagon className="h-5 w-5 mr-2 rtl:ml-2 rtl:mr-0" />
              {t('details.contraindications')}
            </h2>
            <div className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed max-h-48 overflow-y-auto pr-2">
              {contraindications}
            </div>
          </div>
          
          <div className="glass-panel p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center border-b border-gray-100 dark:border-gray-800 pb-3">
              <HeartPulse className="h-5 w-5 mr-2 rtl:ml-2 rtl:mr-0 text-rose-500" />
              {t('details.adverse')}
            </h2>
            <div className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed max-h-48 overflow-y-auto pr-2">
              {adverseReactions}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="glass-panel p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <Baby className="h-5 w-5 mr-2 rtl:ml-2 rtl:mr-0 text-blue-500" />
                {t('details.pediatric')}
              </h2>
              <div className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed max-h-32 overflow-y-auto pr-2">
                {pediatric}
              </div>
            </div>
            
            <div className="glass-panel p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <PersonStanding className="h-5 w-5 mr-2 rtl:ml-2 rtl:mr-0 text-emerald-500" />
                {t('details.geriatric')}
              </h2>
              <div className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed max-h-32 overflow-y-auto pr-2">
                {geriatric}
              </div>
            </div>
          </div>

        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="glass-panel p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">{t('details.quick_facts')}</h3>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
                <dt className="text-gray-500">{t('details.manufacturer')}</dt>
                <dd className="font-medium text-right rtl:text-left max-w-[60%]">{manufacturer}</dd>
              </div>
              <div className="flex justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
                <dt className="text-gray-500">{t('details.pregnancy')}</dt>
                <dd className="font-medium text-amber-500 truncate max-w-[50%]" title={pregnancy}>View Label</dd>
              </div>
              <div className="flex justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
                <dt className="text-gray-500">{t('details.rx_otc')}</dt>
                <dd className="font-medium">{drugData.original.openfda?.product_type?.[0] || 'Unknown'}</dd>
              </div>
            </dl>
          </div>

          {/* Alternatives Sidebar Card */}
          {alternativesData && alternativesData.alternatives && alternativesData.alternatives.length > 0 && (
            <div className="glass-panel p-6 border-t-4 border-t-primary-500">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1 flex items-center">
                <RefreshCw className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0 text-primary-500 animate-spin-slow" />
                {i18n.language.startsWith('ar') ? 'البدائل المتاحة (نفس المادة)' : 'Alternatives (Same Ingredient)'}
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-4 border-b border-gray-100 dark:border-gray-800 pb-2">
                {alternativesData.active_ingredient}
              </p>
              <div className="flex flex-col gap-2.5 max-h-72 overflow-y-auto pr-1">
                {alternativesData.alternatives.map((alt: any, idx: number) => (
                  <Link
                    key={idx}
                    to={`/drug/${encodeURIComponent(alt.brand_name)}`}
                    className="flex justify-between items-center p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-primary-50 dark:hover:bg-primary-900/10 text-xs transition-all group border border-gray-100 dark:border-gray-800"
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400">{alt.brand_name}</span>
                      <span className="text-[10px] text-gray-400 truncate max-w-[130px]">{alt.manufacturer}</span>
                    </div>
                    <span className="px-2 py-1 rounded-lg text-[9px] bg-primary-100/50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 font-bold">{alt.price_category}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Food Interactions Sidebar Card */}
          {foodData && (
            <div className="glass-panel p-6 border-t-4 border-t-emerald-500">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                <Utensils className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0 text-emerald-500" />
                {i18n.language.startsWith('ar') ? 'التفاعل مع الوجبات والأطعمة' : 'Food & Meal Interactions'}
              </h3>
              
              <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-xs font-semibold text-emerald-900 dark:text-emerald-200 mb-3 flex items-start gap-2">
                <Clock className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                <span>{i18n.language.startsWith('ar') ? (foodData.timing_ar || foodData.timing) : (foodData.timing_en || foodData.timing)}</span>
              </div>

              {foodData.interactions && foodData.interactions.length > 0 && (
                <div className="space-y-2 mb-3">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                    {i18n.language.startsWith('ar') ? 'أطعمة ومشروبات يُرجى الحذر منها:' : 'Foods to be cautious with:'}
                  </span>
                  {foodData.interactions.slice(0, 3).map((item: any, idx: number) => (
                    <div key={idx} className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800/40 text-[11px] border border-gray-100 dark:border-gray-800">
                      <span className="font-bold text-gray-900 dark:text-white block">
                        {i18n.language.startsWith('ar') ? item.food_ar : (item.food_en || item.food_ar)}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400 text-[10px]">
                        {i18n.language.startsWith('ar') ? item.recommendation_ar : (item.recommendation_en || item.recommendation_ar)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <Link
                to="/food-interactions"
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 mt-2"
              >
                <span>{i18n.language.startsWith('ar') ? 'عرض الفحص الغذائي الكامل ⟵' : 'View full food interaction check ⟶'}</span>
              </Link>
            </div>
          )}
          
          <div className="glass-panel p-6 bg-gradient-to-br from-primary-50 to-white dark:from-primary-900/10 dark:to-gray-800">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{t('details.check_interact_title')}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {t('details.check_interact_desc')}
            </p>
            <Link to="/interaction" className="btn-primary w-full text-center">
              {t('details.check_btn')}
            </Link>
          </div>

          <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-200 dark:border-blue-900/50 text-sm text-blue-800 dark:text-blue-300 text-center leading-relaxed">
            <ShieldAlert className="h-4 w-4 inline-block mb-1" />
            <br />
            <strong>{t('details.disclaimer')}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
