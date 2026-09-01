import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { supabase, isSupabaseConfigured } from './supabaseClient';

dotenv.config();

// Helper to get active API keys from environment variables
const getApiKeys = (): string[] => {
  const keysStr = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || '';
  return keysStr.split(',').map(k => k.trim()).filter(Boolean);
};

// Safe JSON parser for LLM responses with or without markdown code fences
const cleanJson = (text: string): any => {
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  return JSON.parse(cleaned.trim());
};

// Retry mechanism cycling through Gemini API keys if one fails
const executeWithRotation = async <T>(fn: (genAI: GoogleGenerativeAI) => Promise<T>): Promise<T> => {
  const keys = getApiKeys();
  if (keys.length === 0) {
    throw new Error('API Key missing');
  }

  let lastError: any = null;
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    try {
      const genAI = new GoogleGenerativeAI(key);
      return await fn(genAI);
    } catch (error: any) {
      console.error(`[Key Rotation] API Key ${i + 1}/${keys.length} failed. Error:`, error.message || error);
      lastError = error;
    }
  }
  throw lastError || new Error('All Gemini API keys failed');
};

export const checkInteractionsAI = async (drugs: string[]): Promise<any> => {
  // Sort and hash drug list for consistent caching index
  const sortedDrugs = drugs.map(d => d.toLowerCase().trim()).sort();
  const drugsHash = sortedDrugs.join(',');

  // 1. Try Cache
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('cached_drug_interactions')
        .select('interactions_json')
        .eq('drugs_hash', drugsHash)
        .single();
      
      if (data && !error) {
        console.log(`[Cache Hit] Serving interactions for [${drugs.join(', ')}] from Supabase.`);
        return data.interactions_json;
      }
    } catch (e: any) {
      console.error("[Cache Read Error] Interactions:", e.message || e);
    }
  }

  // 2. Cache Miss -> Call AI with Key Rotation
  const resultData = await executeWithRotation(async (genAI) => {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3.5-flash",
      generationConfig: {
        responseMimeType: "application/json"
      }
    });
    
    const prompt = `
    You are an expert clinical pharmacist in Egypt. 
    The user is asking about the drug interactions between the following medications: ${drugs.join(', ')}.
    Some of these might be Egyptian brand names or generic names.

    Please provide a summary of their interactions in BOTH Arabic and English.
    Format your response EXACTLY as a valid JSON object matching this structure:
    {
      "interactions": [
        {
          "severity": "high" or "moderate" or "minor",
          "description": "Clear explanation of the interaction and clinical management in Arabic.",
          "description_ar": "Clear explanation of the interaction and clinical management in Arabic.",
          "description_en": "Clear explanation of the interaction and clinical management in English.",
          "drugs": ["Drug 1", "Drug 2"]
        }
      ]
    }
    If there are absolutely no known interactions, return:
    {
      "interactions": []
    }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log("Raw AI Response (Interactions):", text);
    
    return cleanJson(text);
  });

  // 3. Save to Cache
  if (isSupabaseConfigured && supabase && resultData) {
    try {
      await supabase
        .from('cached_drug_interactions')
        .upsert({ drugs_hash: drugsHash, interactions_json: resultData }, { onConflict: 'drugs_hash' });
      console.log(`[Cache Write] Saved interactions for [${drugs.join(', ')}] to Supabase.`);
    } catch (e: any) {
      console.error("[Cache Write Error] Interactions:", e.message || e);
    }
  }

  return resultData;
};

export const suggestDrugsAI = async (query: string): Promise<any> => {
  return await executeWithRotation(async (genAI) => {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
    You are an expert pharmacist.
    The user typed "${query}". 
    Provide a list of 5 real drug names. Include both Egyptian brand names and international/generic names that start with or match this query.

    Format EXACTLY as:
    {
      "suggestions": ["Drug 1", "Drug 2", "Drug 3", "Drug 4", "Drug 5"]
    }
    `;

    const result = await model.generateContent(prompt);
    const text = await result.response.text();
    return cleanJson(text);
  });
};

export const compareDrugsAI = async (drugA: string, drugB: string): Promise<any> => {
  // Sort keys for consistent caching index
  const sortedPair = [drugA.toLowerCase().trim(), drugB.toLowerCase().trim()].sort();
  const dA = sortedPair[0];
  const dB = sortedPair[1];

  // 1. Try Cache
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('cached_drug_comparisons')
        .select('comparison_json')
        .eq('drug_a', dA)
        .eq('drug_b', dB)
        .single();
      
      if (data && !error) {
        console.log(`[Cache Hit] Serving comparison for "${drugA}" vs "${drugB}" from Supabase.`);
        return data.comparison_json;
      }
    } catch (e: any) {
      console.error("[Cache Read Error] Comparison:", e.message || e);
    }
  }

  // 2. Cache Miss -> Call AI with Key Rotation
  const resultData = await executeWithRotation(async (genAI) => {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
    You are an expert Egyptian pharmacist.
    Compare these two drugs available in Egypt: "${drugA}" and "${drugB}".

    Provide a detailed clinical comparison in BOTH Arabic and English.
    Format EXACTLY as:
    {
      "comparison": [
        {
          "feature": "المادة الفعالة / Active Ingredient",
          "feature_ar": "المادة الفعالة",
          "feature_en": "Active Ingredient",
          "drugA": "Active ingredient in Arabic and English",
          "drugA_ar": "المادة الفعالة بالعربية",
          "drugA_en": "Active ingredient in English",
          "drugB": "Active ingredient in Arabic and English",
          "drugB_ar": "المادة الفعالة بالعربية",
          "drugB_en": "Active ingredient in English"
        },
        {
          "feature": "دواعي الاستعمال / Indications",
          "feature_ar": "دواعي الاستعمال",
          "feature_en": "Therapeutic Indications",
          "drugA": "Indications summary",
          "drugA_ar": "دواعي الاستعمال بالعربية",
          "drugA_en": "Therapeutic indications in English",
          "drugB": "Indications summary",
          "drugB_ar": "دواعي الاستعمال بالعربية",
          "drugB_en": "Therapeutic indications in English"
        },
        {
          "feature": "الآثار الجانبية الشائعة / Common Side Effects",
          "feature_ar": "الآثار الجانبية الشائعة",
          "feature_en": "Common Side Effects",
          "drugA": "Side effects summary",
          "drugA_ar": "الآثار الجانبية بالعربية",
          "drugA_en": "Common side effects in English",
          "drugB": "Side effects summary",
          "drugB_ar": "الآثار الجانبية بالعربية",
          "drugB_en": "Common side effects in English"
        },
        {
          "feature": "الفئة الدوائية للحمل / Pregnancy Category",
          "feature_ar": "الفئة الدوائية للحمل",
          "feature_en": "Pregnancy Category & Safety",
          "drugA": "Pregnancy category",
          "drugA_ar": "أمان الحمل بالعربية",
          "drugA_en": "Pregnancy safety in English",
          "drugB": "Pregnancy category",
          "drugB_ar": "أمان الحمل بالعربية",
          "drugB_en": "Pregnancy safety in English"
        },
        {
          "feature": "الجرعة المعتادة / Typical Dosage",
          "feature_ar": "الجرعة المعتادة",
          "feature_en": "Typical Dosage",
          "drugA": "Dosage summary",
          "drugA_ar": "الجرعة المعتادة بالعربية",
          "drugA_en": "Typical dosage in English",
          "drugB": "Dosage summary",
          "drugB_ar": "الجرعة المعتادة بالعربية",
          "drugB_en": "Typical dosage in English"
        }
      ]
    }
    `;

    const result = await model.generateContent(prompt);
    const text = await result.response.text();
    return cleanJson(text);
  });

  // 3. Save to Cache
  if (isSupabaseConfigured && supabase && resultData) {
    try {
      await supabase
        .from('cached_drug_comparisons')
        .upsert({ drug_a: dA, drug_b: dB, comparison_json: resultData }, { onConflict: 'drug_a,drug_b' });
      console.log(`[Cache Write] Saved comparison for "${drugA}" vs "${drugB}" to Supabase.`);
    } catch (e: any) {
      console.error("[Cache Write Error] Comparison:", e.message || e);
    }
  }

  return resultData;
};

export const getDrugDetailsAI = async (drugName: string): Promise<any> => {
  const normalizedName = drugName.toLowerCase().trim();

  // 1. Try Cache
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('cached_drug_details')
        .select('details_json')
        .eq('drug_name', normalizedName)
        .single();
      
      if (data && !error) {
        console.log(`[Cache Hit] Serving details for "${drugName}" from Supabase.`);
        return data.details_json;
      }
    } catch (e: any) {
      console.error("[Cache Read Error] Details:", e.message || e);
    }
  }

  // 2. Cache Miss -> Call AI with Key Rotation
  const resultData = await executeWithRotation(async (genAI) => {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
    You are an expert clinical pharmacist specializing in Egyptian and international pharmaceuticals.
    Provide detailed medical and clinical information for the drug: "${drugName}".
    If "${drugName}" is an Egyptian trade/brand name (e.g., Antinal, Congestal, Cetafen, Novaldol, Hibiotic, Brufen, etc.), accurately identify its primary active scientific ingredient, manufacturer, and medical facts.

    Provide all clinical text in BOTH Arabic and English.
    Format your response EXACTLY as a valid JSON object with this exact structure:
    {
      "openfda": {
        "generic_name": ["Active Ingredient / Scientific Name in English & Arabic"],
        "generic_name_ar": ["الاسم العلمي والمادة الفعالة بالعربية"],
        "generic_name_en": ["Active scientific ingredient in English"],
        "manufacturer_name": ["Manufacturer Name (e.g. Amoun Pharmaceutical)"],
        "product_type": ["Prescription / OTC"]
      },
      "purpose": ["Clear indication summary of what this drug is used for in Arabic."],
      "purpose_ar": ["ملخص دواعي الاستعمال بالعربية."],
      "purpose_en": ["Clear indication summary of what this drug is used for in English."],
      "indications_and_usage": ["Detailed indications & therapeutic uses in Arabic."],
      "indications_and_usage_ar": ["دواعي الاستعمال التفصيلية بالعربية."],
      "indications_and_usage_en": ["Detailed indications & therapeutic uses in English."],
      "dosage_and_administration": ["Recommended dosage and how to take it in Arabic."],
      "dosage_and_administration_ar": ["الجرعات وطريقة الاستخدام بالعربية."],
      "dosage_and_administration_en": ["Recommended dosage and administration instructions in English."],
      "warnings": ["Important precautions, warnings, and safety advice in Arabic."],
      "warnings_ar": ["التحذيرات والاحتياطات الهامة بالعربية."],
      "warnings_en": ["Important precautions, warnings, and safety advice in English."],
      "contraindications": ["Contraindications / conditions when this drug should NOT be used in Arabic."],
      "contraindications_ar": ["موانع الاستعمال بالعربية."],
      "contraindications_en": ["Contraindications / conditions when this drug should NOT be used in English."],
      "adverse_reactions": ["Common and possible side effects in Arabic."],
      "adverse_reactions_ar": ["الآثار الجانبية الشائعة بالعربية."],
      "adverse_reactions_en": ["Common and possible adverse reactions in English."],
      "pregnancy": ["Safety guidelines for pregnant and nursing mothers in Arabic."],
      "pregnancy_ar": ["إرشادات أمان الحمل والرضاعة بالعربية."],
      "pregnancy_en": ["Safety guidelines for pregnant and nursing mothers in English."],
      "pediatric_use": ["Child dosage safety & pediatric guidelines in Arabic."],
      "pediatric_use_ar": ["إرشادات واستخدامات الأطفال بالعربية."],
      "pediatric_use_en": ["Child dosage safety & pediatric guidelines in English."],
      "geriatric_use": ["Elderly patient safety guidelines in Arabic."],
      "geriatric_use_ar": ["إرشادات أمان كبار السن بالعربية."],
      "geriatric_use_en": ["Elderly patient safety guidelines in English."]
    }
    `;

    const result = await model.generateContent(prompt);
    const text = await result.response.text();
    return cleanJson(text);
  });

  // 3. Save to Cache
  if (isSupabaseConfigured && supabase && resultData) {
    try {
      await supabase
        .from('cached_drug_details')
        .upsert({ drug_name: normalizedName, details_json: resultData }, { onConflict: 'drug_name' });
      console.log(`[Cache Write] Saved details for "${drugName}" to Supabase.`);
    } catch (e: any) {
      console.error("[Cache Write Error] Details:", e.message || e);
    }
  }

  return resultData;
};

export const getDrugAlternativesAI = async (drugName: string): Promise<any> => {
  const normalizedName = drugName.toLowerCase().trim();

  // 1. Try Cache
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('cached_drug_alternatives')
        .select('alternatives_json')
        .eq('drug_name', normalizedName)
        .single();
      
      if (data && !error) {
        console.log(`[Cache Hit] Serving alternatives for "${drugName}" from Supabase.`);
        return data.alternatives_json;
      }
    } catch (e: any) {
      console.error("[Cache Read Error] Alternatives:", e.message || e);
    }
  }

  // 2. Cache Miss -> Call AI with Key Rotation
  const resultData = await executeWithRotation(async (genAI) => {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
    You are an expert Egyptian clinical pharmacist.
    The user is asking about the alternative brand name medications available in Egypt that contain the exact same active scientific ingredient as the drug "${drugName}".
    
    Please provide the scientific name (active ingredient) and a list of at least 5 equivalent trade/brand names available in the Egyptian market. If possible, include their manufacturer name and a relative price category in both Arabic and English.

    Format your response EXACTLY as a valid JSON object matching this structure:
    {
      "active_ingredient": "Scientific Name in English & Arabic (e.g. Diclofenac Sodium / ديكلوفيناك صوديوم)",
      "active_ingredient_ar": "الاسم العلمي بالعربية",
      "active_ingredient_en": "Scientific Name in English",
      "alternatives": [
        {
          "brand_name": "Brand Name 1 (e.g. Cataflam)",
          "manufacturer": "Manufacturer Name (e.g. Novartis)",
          "price_category": "Price Category in Arabic (رخيص / متوسط / مرتفع)",
          "price_category_ar": "رخيص / متوسط / مرتفع",
          "price_category_en": "Budget / Moderate / Premium"
        }
      ]
    }
    `;

    const result = await model.generateContent(prompt);
    const text = await result.response.text();
    return cleanJson(text);
  });

  // 3. Save to Cache
  if (isSupabaseConfigured && supabase && resultData) {
    try {
      await supabase
        .from('cached_drug_alternatives')
        .upsert({ drug_name: normalizedName, alternatives_json: resultData }, { onConflict: 'drug_name' });
      console.log(`[Cache Write] Saved alternatives for "${drugName}" to Supabase.`);
    } catch (e: any) {
      console.error("[Cache Write Error] Alternatives:", e.message || e);
    }
  }

  return resultData;
};

export const checkChronicSafetyAI = async (drugName: string, diseaseName: string): Promise<any> => {
  const normalizedDrug = drugName.toLowerCase().trim();
  const normalizedDisease = diseaseName.toLowerCase().trim();

  // 1. Try Cache
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('cached_disease_safety')
        .select('safety_json')
        .eq('drug_name', normalizedDrug)
        .eq('disease_name', normalizedDisease)
        .single();
      
      if (data && !error) {
        console.log(`[Cache Hit] Serving disease safety for "${drugName}" + "${diseaseName}" from Supabase.`);
        return data.safety_json;
      }
    } catch (e: any) {
      console.error("[Cache Read Error] Disease Safety:", e.message || e);
    }
  }

  // 2. Cache Miss -> Call AI with Key Rotation
  const resultData = await executeWithRotation(async (genAI) => {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
    You are an expert clinical pharmacist in Egypt.
    Analyze the safety and suitability of the drug "${drugName}" for a patient diagnosed with the chronic condition "${diseaseName}".
    Determine whether it is:
    1. "safe" (safe to use under normal instructions).
    2. "warning" (requires extreme caution, dose adjustment, or consulting a doctor).
    3. "contraindicated" (completely forbidden/dangerous for this condition).

    Provide a clear, patient-friendly medical explanation in BOTH Arabic and English.

    Format your response EXACTLY as a valid JSON object matching this structure:
    {
      "status": "safe" or "warning" or "contraindicated",
      "explanation": "Clear clinical guidelines and explanation in Arabic.",
      "explanation_ar": "إرشادات وتفسيرات سريرية واضحة للمريض بالعربية.",
      "explanation_en": "Clear patient-friendly clinical explanation and precautions in English."
    }
    `;

    const result = await model.generateContent(prompt);
    const text = await result.response.text();
    return cleanJson(text);
  });

  // 3. Save to Cache
  if (isSupabaseConfigured && supabase && resultData) {
    try {
      await supabase
        .from('cached_disease_safety')
        .upsert({ drug_name: normalizedDrug, disease_name: normalizedDisease, safety_json: resultData }, { onConflict: 'drug_name,disease_name' });
      console.log(`[Cache Write] Saved disease safety for "${drugName}" + "${diseaseName}" to Supabase.`);
    } catch (e: any) {
      console.error("[Cache Write Error] Disease Safety:", e.message || e);
    }
  }

  return resultData;
};

export const getFoodInteractionsAI = async (drugName: string): Promise<any> => {
  const normalizedName = drugName.toLowerCase().trim();

  // 1. Try Cache
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('cached_food_interactions')
        .select('food_interactions_json')
        .eq('drug_name', normalizedName)
        .single();
      
      if (data && !error) {
        console.log(`[Cache Hit] Serving food interactions for "${drugName}" from Supabase.`);
        return data.food_interactions_json;
      }
    } catch (e: any) {
      console.error("[Cache Read Error] Food Interactions:", e.message || e);
    }
  }

  // 2. Cache Miss -> Call AI with Key Rotation
  const resultData = await executeWithRotation(async (genAI) => {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
    You are an expert clinical pharmacist in Egypt.
    Provide comprehensive food and beverage interaction guidelines for the drug: "${drugName}".
    Identify any Egyptian brand names or generic active ingredients.
    
    Provide all information in BOTH Arabic and English.
    Format your response EXACTLY as a valid JSON object matching this structure:
    {
      "drug_name": "${drugName}",
      "timing": "Clear meal timing instruction in Arabic (e.g. يؤخذ قبل الأكل بساعة أو بعد الأكل بساعتين على معدة فارغة)",
      "timing_ar": "تعليمات توقيت تناول الجرعة بالنسبة للوجبات بالعربية",
      "timing_en": "Meal timing instructions in English (e.g. Take 1 hour before or 2 hours after meals on an empty stomach)",
      "instructions_ar": "إرشادات عامة هامة للمريض حول الهضم والامتصاص بالعربية",
      "instructions_en": "Important general patient instructions regarding absorption and meals in English",
      "interactions": [
        {
          "food_ar": "اسم الطعام أو الشراب بالعربية (مثال: عصير الجريب فروت / منتجات الألبان والكالسيوم / الموز والأطعمة الغنية بالبوتاسيوم / الكافيين)",
          "food_en": "Food or beverage name in English (e.g. Grapefruit Juice / Dairy & Calcium Products / High Potassium Foods / Caffeine)",
          "severity": "high" or "moderate" or "minor",
          "effect_ar": "تأثير التفاعل السريري بالعربية",
          "effect_en": "Clinical effect and mechanism in English",
          "recommendation_ar": "التوصية الصيدلانية السريرية الدقيقة بالعربية",
          "recommendation_en": "Precise clinical pharmaceutical recommendation in English"
        }
      ],
      "dietary_tips_ar": [
        "نصيحة غذائية سريرية 1",
        "نصيحة غذائية سريرية 2"
      ],
      "dietary_tips_en": [
        "Clinical dietary tip 1 in English",
        "Clinical dietary tip 2 in English"
      ]
    }
    `;

    const result = await model.generateContent(prompt);
    const text = await result.response.text();
    return cleanJson(text);
  });

  // 3. Save to Cache
  if (isSupabaseConfigured && supabase && resultData) {
    try {
      await supabase
        .from('cached_food_interactions')
        .upsert({ drug_name: normalizedName, food_interactions_json: resultData }, { onConflict: 'drug_name' });
      console.log(`[Cache Write] Saved food interactions for "${drugName}" to Supabase.`);
    } catch (e: any) {
      console.error("[Cache Write Error] Food Interactions (may need table creation in Supabase):", e.message || e);
    }
  }

  return resultData;
};
