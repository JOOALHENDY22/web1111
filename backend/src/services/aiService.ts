import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { supabase, isSupabaseConfigured } from './supabaseClient';

dotenv.config();

// Helper to get active API keys from environment variables
const getApiKeys = (): string[] => {
  const keysStr = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || '';
  return keysStr.split(',').map(k => k.trim()).filter(Boolean);
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
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json"
      }
    });
    
    const prompt = `
    You are an expert clinical pharmacist in Egypt. 
    The user is asking about the drug interactions between the following medications: ${drugs.join(', ')}.
    Some of these might be Egyptian brand names or generic names.

    Please provide a summary of their interactions.
    Format your response EXACTLY as a valid JSON object matching this structure:
    {
      "interactions": [
        {
          "severity": "high" or "moderate" or "minor",
          "description": "Clear explanation of the interaction and what to do in Arabic.",
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
    
    return JSON.parse(text);
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
      model: "gemini-1.5-flash",
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
    return JSON.parse(text);
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
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
    You are an expert Egyptian pharmacist.
    Compare these two drugs available in Egypt: "${drugA}" and "${drugB}".

    Provide a detailed clinical comparison in Arabic.
    Format EXACTLY as:
    {
      "comparison": [
        {
          "feature": "المادة الفعالة (Active Ingredient)",
          "drugA": "...",
          "drugB": "..."
        },
        {
          "feature": "دواعي الاستعمال (Indications)",
          "drugA": "...",
          "drugB": "..."
        },
        {
          "feature": "الآثار الجانبية الشائعة (Side Effects)",
          "drugA": "...",
          "drugB": "..."
        },
        {
          "feature": "الفئة الدوائية للحمل (Pregnancy Category)",
          "drugA": "...",
          "drugB": "..."
        },
        {
          "feature": "الجرعة المعتادة (Typical Dosage)",
          "drugA": "...",
          "drugB": "..."
        }
      ]
    }
    `;

    const result = await model.generateContent(prompt);
    const text = await result.response.text();
    return JSON.parse(text);
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
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
    You are an expert clinical pharmacist specializing in Egyptian and international pharmaceuticals.
    Provide detailed medical and clinical information for the drug: "${drugName}".
    If "${drugName}" is an Egyptian trade/brand name (e.g., Antinal, Congestal, Cetafen, Novaldol, Hibiotic, Brufen, etc.), accurately identify its primary active scientific ingredient, manufacturer, and medical facts.

    Format your response EXACTLY as a valid JSON object with this exact structure:
    {
      "openfda": {
        "generic_name": ["Active Ingredient / Scientific Name in English & Arabic"],
        "manufacturer_name": ["Manufacturer Name (e.g. Amoun Pharmaceutical)"],
        "product_type": ["Prescription / OTC"]
      },
      "purpose": ["Clear indication summary of what this drug is used for in Arabic."],
      "indications_and_usage": ["Detailed indications & therapeutic uses in Arabic."],
      "dosage_and_administration": ["Recommended dosage and how to take it in Arabic."],
      "warnings": ["Important precautions, warnings, and safety advice in Arabic."],
      "contraindications": ["Contraindications / conditions when this drug should NOT be used in Arabic."],
      "adverse_reactions": ["Common and possible side effects in Arabic."],
      "pregnancy": ["Safety guidelines for pregnant and nursing mothers in Arabic."],
      "pediatric_use": ["Child dosage safety & pediatric guidelines in Arabic."],
      "geriatric_use": ["Elderly patient safety guidelines in Arabic."]
    }
    `;

    const result = await model.generateContent(prompt);
    const text = await result.response.text();
    return JSON.parse(text);
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
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
    You are an expert Egyptian clinical pharmacist.
    The user is asking about the alternative brand name medications available in Egypt that contain the exact same active scientific ingredient as the drug "${drugName}".
    
    Please provide the scientific name (active ingredient) and a list of at least 5 equivalent trade/brand names available in the Egyptian market. If possible, include their manufacturer name and a relative price category (e.g. رخيص, متوسط, مرتفع).

    Format your response EXACTLY as a valid JSON object matching this structure:
    {
      "active_ingredient": "Scientific Name in English & Arabic (e.g. Diclofenac Sodium / ديكلوفيناك صوديوم)",
      "alternatives": [
        {
          "brand_name": "Brand Name 1 (e.g. Cataflam)",
          "manufacturer": "Manufacturer Name (e.g. Novartis)",
          "price_category": "Price Category in Arabic (رخيص / متوسط / مرتفع)"
        }
      ]
    }
    `;

    const result = await model.generateContent(prompt);
    const text = await result.response.text();
    return JSON.parse(text);
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
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
    You are an expert clinical pharmacist in Egypt.
    Analyze the safety and suitability of the drug "${drugName}" for a patient diagnosed with the chronic condition "${diseaseName}".
    Determine whether it is:
    1. "safe" (safe to use under normal instructions).
    2. "warning" (requires extreme caution, dose adjustment, or consulting a doctor).
    3. "contraindicated" (completely forbidden/dangerous for this condition).

    Provide a clear, patient-friendly medical explanation in Arabic explaining why and what guidelines to follow.

    Format your response EXACTLY as a valid JSON object matching this structure:
    {
      "status": "safe" or "warning" or "contraindicated",
      "explanation": "Clear clinical guidelines and explanation in Arabic."
    }
    `;

    const result = await model.generateContent(prompt);
    const text = await result.response.text();
    return JSON.parse(text);
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
