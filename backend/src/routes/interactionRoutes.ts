import { Router } from 'express';
import { checkInteractionsAI, suggestDrugsAI, compareDrugsAI, getDrugDetailsAI, getDrugAlternativesAI, checkChronicSafetyAI, getFoodInteractionsAI } from '../services/aiService';

import fs from 'fs';
import path from 'path';

const router = Router();

// Load offline drugs database
let offlineDrugs: string[] = [];
const possiblePaths = [
  path.join(__dirname, '../data/egyptian_drugs.json'),
  path.join(__dirname, '../../src/data/egyptian_drugs.json'),
  path.join(process.cwd(), 'backend/src/data/egyptian_drugs.json'),
  path.join(process.cwd(), 'src/data/egyptian_drugs.json')
];

for (const p of possiblePaths) {
  try {
    if (fs.existsSync(p)) {
      offlineDrugs = JSON.parse(fs.readFileSync(p, 'utf-8'));
      break;
    }
  } catch (e) {
    // continue to next path
  }
}

router.post('/interactions', async (req, res) => {
  try {
    const { drugs } = req.body;
    
    if (!drugs || !Array.isArray(drugs) || drugs.length < 2) {
      return res.status(400).json({ error: 'Please provide at least 2 drugs' });
    }

    const data = await checkInteractionsAI(drugs);
    res.json(data);
  } catch (error: any) {
    console.error(error);
    if (error.message === 'API Key missing') {
      res.status(500).json({ error: 'Gemini API Key is missing. Please add it to the .env file.' });
    } else {
      res.status(500).json({ error: 'Failed to process AI interaction check.' });
    }
  }
});

router.get('/suggestions', (req, res) => {
  try {
    const q = (req.query.q as string)?.toLowerCase();
    if (!q || q.length < 2) {
      return res.status(400).json({ suggestions: [] });
    }
    
    // Offline fast search
    const matches = offlineDrugs
      .filter(drug => drug.toLowerCase().includes(q))
      .slice(0, 5); // Return top 5 matches
      
    res.json({ suggestions: matches });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ suggestions: [] });
  }
});

router.post('/compare', async (req, res) => {
  try {
    const { drugA, drugB } = req.body;
    if (!drugA || !drugB) {
      return res.status(400).json({ error: 'Please provide both drugA and drugB' });
    }
    const data = await compareDrugsAI(drugA, drugB);
    res.json(data);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: 'Failed to compare drugs' });
  }
});

router.post('/drug-details', async (req, res) => {
  try {
    const { drugName } = req.body;
    if (!drugName) {
      return res.status(400).json({ error: 'Please provide a drugName' });
    }
    const data = await getDrugDetailsAI(drugName);
    res.json(data);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch AI drug details' });
  }
});

router.post('/alternatives', async (req, res) => {
  try {
    const { drugName } = req.body;
    if (!drugName) {
      return res.status(400).json({ error: 'Please provide a drugName' });
    }
    const data = await getDrugAlternativesAI(drugName);
    res.json(data);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch drug alternatives' });
  }
});

router.post('/chronic-safety', async (req, res) => {
  try {
    const { drugName, diseaseName } = req.body;
    if (!drugName || !diseaseName) {
      return res.status(400).json({ error: 'Please provide both drugName and diseaseName' });
    }
    const data = await checkChronicSafetyAI(drugName, diseaseName);
    res.json(data);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: 'Failed to verify chronic disease safety' });
  }
});

router.post('/food-interactions', async (req, res) => {
  try {
    const { drugName } = req.body;
    if (!drugName) {
      return res.status(400).json({ error: 'Please provide a drugName' });
    }
    const data = await getFoodInteractionsAI(drugName);
    res.json(data);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch food interactions' });
  }
});

export default router;
