const pptxgen = require('pptxgenjs');
const path = require('path');

async function createPresentation() {
  const pptx = new pptxgen();

  pptx.layout = 'LAYOUT_16x9';
  pptx.author = 'Youssef Mohamed';
  pptx.company = 'Egyptian Chinese University (ECU)';
  pptx.subject = 'YoPharma Platform Overview';
  pptx.title = 'YoPharma - Clinical Pharmacy Intelligence Platform';

  // Palette definitions
  const TEAL_DARK = '0F766E';
  const TEAL_PRIMARY = '0D9488';
  const TEAL_LIGHT = 'F0FDFA';
  const SLATE_DARK = '0F172A';
  const SLATE_MUTED = '64748B';
  const SLATE_BG = 'F8FAFC';
  const WHITE = 'FFFFFF';
  const AMBER = 'D97706';
  const RED = 'DC2626';
  const BLUE = '2563EB';

  // Helper for slide headers
  function addHeader(slide, title, category = 'YoPharma | Clinical Pharmacy Suite') {
    slide.background = { color: SLATE_BG };
    
    // Top category badge
    slide.addText(category.toUpperCase(), {
      x: 0.8,
      y: 0.4,
      w: 10,
      h: 0.3,
      fontSize: 10,
      fontFace: 'Arial',
      color: TEAL_PRIMARY,
      bold: true,
    });

    // Main slide title
    slide.addText(title, {
      x: 0.8,
      y: 0.7,
      w: 11,
      h: 0.6,
      fontSize: 22,
      fontFace: 'Arial',
      color: SLATE_DARK,
      bold: true,
    });

    // Divider line
    slide.addShape(pptx.ShapeType.line, {
      x: 0.8,
      y: 1.35,
      w: 11.7,
      h: 0,
      line: { color: 'E2E8F0', width: 1.5 },
    });
  }

  // Helper for footer
  function addFooter(slide) {
    slide.addText('Egyptian Chinese University (ECU) • Faculty of Pharmacy | Developed by Youssef Mohamed', {
      x: 0.8,
      y: 7.0,
      w: 11.7,
      h: 0.3,
      fontSize: 9,
      fontFace: 'Arial',
      color: SLATE_MUTED,
      align: 'left',
    });
  }

  // -------------------------------------------------------------
  // SLIDE 1: Title Slide (Dark Theme)
  // -------------------------------------------------------------
  {
    const slide = pptx.addSlide();
    slide.background = { color: SLATE_DARK };

    // Badge
    slide.addText('ACADEMIC CLINICAL PHARMACY SUITE', {
      x: 1.0,
      y: 1.2,
      w: 10,
      h: 0.4,
      fontSize: 12,
      fontFace: 'Arial',
      color: '5EEAD4',
      bold: true,
      letterSpacing: 2,
    });

    // Main Title
    slide.addText('YoPharma', {
      x: 1.0,
      y: 1.7,
      w: 11,
      h: 1.1,
      fontSize: 46,
      fontFace: 'Arial',
      color: WHITE,
      bold: true,
    });

    // Subtitle
    slide.addText('Evidence-Based Decision Support & Medication Safety Platform\nالمرجع الصيدلاني السريري الذكي لفحص التداخلات وبدائل الأدوية في مصر', {
      x: 1.0,
      y: 2.8,
      w: 11,
      h: 1.2,
      fontSize: 18,
      fontFace: 'Arial',
      color: '94A3B8',
      lineSpacing: 24,
    });

    // Meta Box Card
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 1.0,
      y: 4.4,
      w: 11.3,
      h: 1.9,
      rectRadius: 0.15,
      fill: { color: '1E293B' },
      line: { color: '334155', width: 1 },
    });

    slide.addText([
      { text: 'Academic Affiliation: ', options: { bold: true, color: '5EEAD4' } },
      { text: 'Egyptian Chinese University (ECU) — Faculty of Pharmacy\n', options: { color: WHITE } },
      { text: 'Developed by: ', options: { bold: true, color: '5EEAD4' } },
      { text: 'Youssef Mohamed (Clinical Pharmacy Research Initiative)\n', options: { color: WHITE } },
      { text: 'Core Architecture: ', options: { bold: true, color: '5EEAD4' } },
      { text: 'Sub-millisecond Multi-Tier Cache + Dual AR/EN Realtime Engine', options: { color: WHITE } },
    ], {
      x: 1.3,
      y: 4.6,
      w: 10.7,
      h: 1.5,
      fontSize: 13,
      fontFace: 'Arial',
      lineSpacing: 22,
    });
  }

  // -------------------------------------------------------------
  // SLIDE 2: Executive Summary & Clinical Challenge
  // -------------------------------------------------------------
  {
    const slide = pptx.addSlide();
    addHeader(slide, '1. Executive Summary & Clinical Need');

    // Left Column: The Clinical Challenge
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.8,
      y: 1.6,
      w: 5.6,
      h: 5.1,
      rectRadius: 0.12,
      fill: { color: WHITE },
      line: { color: 'E2E8F0', width: 1 },
    });

    slide.addText('⚠️  The Clinical Challenge', {
      x: 1.1,
      y: 1.8,
      w: 5.0,
      h: 0.4,
      fontSize: 16,
      fontFace: 'Arial',
      bold: true,
      color: RED,
    });

    slide.addText([
      { text: '• Polypharmacy & Drug Interactions:\n', options: { bold: true } },
      { text: '  Patients taking 3+ drugs face high risk of adverse cross-reactions and toxicity.\n\n' },
      { text: '• Food & Meal Timing Errors:\n', options: { bold: true } },
      { text: '  Critical antibiotics & cardiac drugs lose up to 70% absorption if taken with improper meals or dairy.\n\n' },
      { text: '• Egyptian Generic Brand Confusion:\n', options: { bold: true } },
      { text: '  Over 15,000 trade names in Egypt; finding identical chemical equivalents with price tiers is difficult.\n\n' },
      { text: '• Comorbidity Risks:\n', options: { bold: true } },
      { text: '  Adjusting doses for renal (CKD), hepatic, and hypertensive patients requires fast reference.' }
    ], {
      x: 1.1,
      y: 2.3,
      w: 5.0,
      h: 4.2,
      fontSize: 11,
      fontFace: 'Arial',
      color: SLATE_DARK,
    });

    // Right Column: The YoPharma Solution
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 6.8,
      y: 1.6,
      w: 5.7,
      h: 5.1,
      rectRadius: 0.12,
      fill: { color: WHITE },
      line: { color: 'CCFBF1', width: 1.5 },
    });

    slide.addText('✨  The YoPharma Solution', {
      x: 7.1,
      y: 1.8,
      w: 5.1,
      h: 0.4,
      fontSize: 16,
      fontFace: 'Arial',
      bold: true,
      color: TEAL_DARK,
    });

    slide.addText([
      { text: '• Unified Multi-Drug Triage:\n', options: { bold: true } },
      { text: '  Analyze entire prescriptions in <2 seconds with solid high/moderate/minor risk stratification.\n\n' },
      { text: '• Food Schedule & Restrictions:\n', options: { bold: true } },
      { text: '  Automatic meal timing and prohibited beverage alerts per medication.\n\n' },
      { text: '• Comprehensive Egyptian Database:\n', options: { bold: true } },
      { text: '  Exact active ingredient matching across local brands with manufacturer & price tier.\n\n' },
      { text: '• 22 Biomarkers & Vitals Guide:\n', options: { bold: true } },
      { text: '  Interactive clinical calculator for lab tests (eGFR, INR, HbA1c, CrCl).' }
    ], {
      x: 7.1,
      y: 2.3,
      w: 5.1,
      h: 4.2,
      fontSize: 11,
      fontFace: 'Arial',
      color: SLATE_DARK,
    });

    addFooter(slide);
  }

  // -------------------------------------------------------------
  // SLIDE 3: System Architecture & Technical Highlights
  // -------------------------------------------------------------
  {
    const slide = pptx.addSlide();
    addHeader(slide, '2. Technical Architecture & Performance');

    const cards = [
      {
        title: '⚡ Multi-Tier RAM Cache',
        desc: 'Tier 1: Browser In-Memory (0ms)\nTier 2: Node.js Server RAM (<1ms)\nTier 3: PostgreSQL Supabase Cache\nDelivers instant repeated queries.',
        color: TEAL_DARK,
        bg: 'F0FDFA',
      },
      {
        title: '🤖 Multi-Model AI Failover',
        desc: 'Automatic rotation engine:\n• Primary: Gemini 3.5 Flash\n• Secondary: Gemini 3.5 Flash-Lite\n• Fallback: Gemini 3.6 Flash\nZero API downtime guarantee.',
        color: BLUE,
        bg: 'EFF6FF',
      },
      {
        title: '🌐 Dual-Language Engine',
        desc: 'Simultaneous bilingual storage:\nAll drug monographs, interactions, meal guides, and explanations stored in both Arabic & English without re-translation.',
        color: AMBER,
        bg: 'FFFBEB',
      },
      {
        title: '📱 Modern Frontend Stack',
        desc: 'Built on React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, and Framer Motion. 100% responsive for hospital desktop & mobile.',
        color: '059669',
        bg: 'ECFDF5',
      },
    ];

    cards.forEach((c, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const x = 0.8 + col * 6.0;
      const y = 1.6 + row * 2.6;

      slide.addShape(pptx.ShapeType.roundRect, {
        x,
        y,
        w: 5.7,
        h: 2.4,
        rectRadius: 0.12,
        fill: { color: c.bg },
        line: { color: 'CBD5E1', width: 1 },
      });

      slide.addText(c.title, {
        x: x + 0.3,
        y: y + 0.25,
        w: 5.1,
        h: 0.35,
        fontSize: 14,
        fontFace: 'Arial',
        bold: true,
        color: c.color,
      });

      slide.addText(c.desc, {
        x: x + 0.3,
        y: y + 0.7,
        w: 5.1,
        h: 1.5,
        fontSize: 11,
        fontFace: 'Arial',
        color: SLATE_DARK,
        lineSpacing: 18,
      });
    });

    addFooter(slide);
  }

  // -------------------------------------------------------------
  // SLIDE 4: Module 1 — Drug-Drug Interactions
  // -------------------------------------------------------------
  {
    const slide = pptx.addSlide();
    addHeader(slide, '3. Module 1 — Drug-Drug Interaction Checker');

    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.8,
      y: 1.6,
      w: 11.7,
      h: 5.1,
      rectRadius: 0.12,
      fill: { color: WHITE },
      line: { color: 'E2E8F0', width: 1 },
    });

    slide.addText('Core Capabilities & Clinical Flow:', {
      x: 1.1,
      y: 1.8,
      w: 11,
      h: 0.35,
      fontSize: 15,
      fontFace: 'Arial',
      bold: true,
      color: TEAL_DARK,
    });

    const features = [
      {
        num: '01',
        title: 'Multi-Medication Input',
        desc: 'Add 2 to 10+ medications into an active prescription tray using rapid keyboard navigation and autocomplete.',
      },
      {
        num: '02',
        title: 'Severity Stratification',
        desc: 'Color-coded triage:\n🔴 High / Contraindicated (Avoid)\n🟠 Moderate (Dose Adjust / Caution)\n🔵 Minor (Monitor Parameters)',
      },
      {
        num: '03',
        title: 'Pharmacological Mechanism',
        desc: 'Explains pharmacokinetic (CYP450 inhibition/induction) & pharmacodynamic (additive toxicity) pathways.',
      },
      {
        num: '04',
        title: 'Pharmacist Action Protocol',
        desc: 'Actionable clinical guidance: dosage spacing (e.g. 2 hours separation), lab monitoring, or safer therapeutic alternatives.',
      },
    ];

    features.forEach((f, idx) => {
      const x = 1.1 + idx * 2.8;
      const y = 2.4;

      slide.addShape(pptx.ShapeType.roundRect, {
        x,
        y,
        w: 2.6,
        h: 4.0,
        rectRadius: 0.1,
        fill: { color: 'F8FAFC' },
        line: { color: 'CBD5E1', width: 1 },
      });

      slide.addText(f.num, {
        x: x + 0.2,
        y: y + 0.2,
        w: 2.2,
        h: 0.3,
        fontSize: 18,
        fontFace: 'Arial',
        bold: true,
        color: TEAL_PRIMARY,
      });

      slide.addText(f.title, {
        x: x + 0.2,
        y: y + 0.6,
        w: 2.2,
        h: 0.5,
        fontSize: 12,
        fontFace: 'Arial',
        bold: true,
        color: SLATE_DARK,
      });

      slide.addText(f.desc, {
        x: x + 0.2,
        y: y + 1.2,
        w: 2.2,
        h: 2.6,
        fontSize: 10,
        fontFace: 'Arial',
        color: SLATE_MUTED,
        lineSpacing: 16,
      });
    });

    addFooter(slide);
  }

  // -------------------------------------------------------------
  // SLIDE 5: Module 2 — Food-Drug Interactions & Meal Timing
  // -------------------------------------------------------------
  {
    const slide = pptx.addSlide();
    addHeader(slide, '4. Module 2 — Food-Drug Interactions & Meal Timing');

    // Left card: Timing Schedules
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.8,
      y: 1.6,
      w: 5.6,
      h: 5.1,
      rectRadius: 0.12,
      fill: { color: WHITE },
      line: { color: 'E2E8F0', width: 1 },
    });

    slide.addText('⏰ Administration Timing Guidelines', {
      x: 1.1,
      y: 1.8,
      w: 5.0,
      h: 0.4,
      fontSize: 15,
      fontFace: 'Arial',
      bold: true,
      color: AMBER,
    });

    slide.addText([
      { text: '• Before Meals (On Empty Stomach):\n', options: { bold: true } },
      { text: '  1 hour before or 2 hours after meals (e.g. Proton Pump Inhibitors, Thyroid Hormones, Ciprofloxacin).\n\n' },
      { text: '• With or Immediately After Food:\n', options: { bold: true } },
      { text: '  To reduce gastric irritation or enhance absorption (e.g. NSAIDs, Metformin, Fat-soluble agents).\n\n' },
      { text: '• Specific Circadian Administration:\n', options: { bold: true } },
      { text: '  Bedtime dosing for Statins and sedatives; Morning dosing for Diuretics.' }
    ], {
      x: 1.1,
      y: 2.4,
      w: 5.0,
      h: 4.1,
      fontSize: 11,
      fontFace: 'Arial',
      color: SLATE_DARK,
      lineSpacing: 18,
    });

    // Right card: Dietary Contraindications
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 6.8,
      y: 1.6,
      w: 5.7,
      h: 5.1,
      rectRadius: 0.12,
      fill: { color: WHITE },
      line: { color: 'E2E8F0', width: 1 },
    });

    slide.addText('🚫 Prohibited Foods & Beverages', {
      x: 7.1,
      y: 1.8,
      w: 5.1,
      h: 0.4,
      fontSize: 15,
      fontFace: 'Arial',
      bold: true,
      color: RED,
    });

    slide.addText([
      { text: '• Dairy Products & Calcium:\n', options: { bold: true } },
      { text: '  Chelates fluoroquinolones (Cipro) & tetracyclines, reducing bio-availability by up to 80%.\n\n' },
      { text: '• Grapefruit Juice:\n', options: { bold: true } },
      { text: '  Potent CYP3A4 inhibitor causing dangerous serum accumulation of Statins and CCBs.\n\n' },
      { text: '• High-Potassium Foods & Bananas:\n', options: { bold: true } },
      { text: '  Severe hyperkalemia risk when combined with ACE inhibitors, ARBs, and Spironolactone.' }
    ], {
      x: 7.1,
      y: 2.4,
      w: 5.1,
      h: 4.1,
      fontSize: 11,
      fontFace: 'Arial',
      color: SLATE_DARK,
      lineSpacing: 18,
    });

    addFooter(slide);
  }

  // -------------------------------------------------------------
  // SLIDE 6: Module 3 — Vital Signs & 22 Biomarkers
  // -------------------------------------------------------------
  {
    const slide = pptx.addSlide();
    addHeader(slide, '5. Module 3 — Vital Signs & 22 Biomarkers Guide');

    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.8,
      y: 1.6,
      w: 11.7,
      h: 5.1,
      rectRadius: 0.12,
      fill: { color: WHITE },
      line: { color: 'E2E8F0', width: 1 },
    });

    slide.addText('Comprehensive Reference for 22 Laboratory Parameters & Interactive Evaluator:', {
      x: 1.1,
      y: 1.8,
      w: 11,
      h: 0.35,
      fontSize: 14,
      fontFace: 'Arial',
      bold: true,
      color: TEAL_DARK,
    });

    const categories = [
      {
        title: '🫀 Cardiovascular & Vitals',
        items: '• Blood Pressure (SBP/DBP)\n• Heart Rate / Pulse\n• Respiratory Rate\n• Body Temperature\n• Oxygen Saturation (SpO2)\n• BMI & Body Weight',
      },
      {
        title: '🩸 Metabolic & Glycemic',
        items: '• Fasting Blood Glucose (FBG)\n• Postprandial Glucose (PPG)\n• HbA1c (Glycated Hgb)\n• Total Cholesterol\n• Triglycerides & LDL/HDL\n• Serum Uric Acid',
      },
      {
        title: '🫘 Renal & Electrolytes',
        items: '• Serum Creatinine (sCr)\n• Blood Urea Nitrogen (BUN)\n• eGFR (Kidney Function)\n• Serum Potassium (K+)\n• Serum Sodium (Na+)\n• Urine Microalbumin',
      },
      {
        title: '🩺 Hepatic & Hematology',
        items: '• ALT (SGPT) & AST (SGOT)\n• Total Bilirubin\n• INR / Prothrombin Time\n• Hemoglobin (Hb)\n• White Blood Cells (WBC)\n• Platelet Count (PLT)',
      },
    ];

    categories.forEach((cat, idx) => {
      const x = 1.1 + idx * 2.8;
      const y = 2.4;

      slide.addShape(pptx.ShapeType.roundRect, {
        x,
        y,
        w: 2.6,
        h: 4.0,
        rectRadius: 0.1,
        fill: { color: 'F0FDFA' },
        line: { color: '99F6E4', width: 1 },
      });

      slide.addText(cat.title, {
        x: x + 0.15,
        y: y + 0.2,
        w: 2.3,
        h: 0.5,
        fontSize: 11,
        fontFace: 'Arial',
        bold: true,
        color: TEAL_DARK,
      });

      slide.addText(cat.items, {
        x: x + 0.15,
        y: y + 0.8,
        w: 2.3,
        h: 3.0,
        fontSize: 10,
        fontFace: 'Arial',
        color: SLATE_DARK,
        lineSpacing: 18,
      });
    });

    addFooter(slide);
  }

  // -------------------------------------------------------------
  // SLIDE 7: Module 4 — Egyptian Drug Alternatives
  // -------------------------------------------------------------
  {
    const slide = pptx.addSlide();
    addHeader(slide, '6. Module 4 — Egyptian Drug Alternatives & Pricing');

    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.8,
      y: 1.6,
      w: 11.7,
      h: 5.1,
      rectRadius: 0.12,
      fill: { color: WHITE },
      line: { color: 'E2E8F0', width: 1 },
    });

    slide.addText('Real-time Generic Equivalence in the Egyptian Pharmaceutical Market:', {
      x: 1.1,
      y: 1.8,
      w: 11,
      h: 0.35,
      fontSize: 14,
      fontFace: 'Arial',
      bold: true,
      color: TEAL_DARK,
    });

    // 3 pillars
    const altPillars = [
      {
        title: '🧪 Chemical Active Ingredient',
        desc: 'Maps brand trade names to international nonproprietary names (INN). E.g. Augmentin, Curam, Megamox, Hibiotic all resolve to Amoxicillin + Clavulanic Acid.',
      },
      {
        title: '🏭 Verified Manufacturers',
        desc: 'Identifies licensed Egyptian and multinational pharmaceutical companies (EIPICO, Amoun, GlaxoSmithKline, Novartis, Pfizer, EVA Pharma, Pharco).',
      },
      {
        title: '💰 3-Tier Price Categorization',
        desc: 'Categorizes available Egyptian market equivalents into Economy (رخيص), Moderate (متوسط), and Premium (مرتفع) to provide affordable patient options.',
      },
    ];

    altPillars.forEach((p, idx) => {
      const x = 1.1 + idx * 3.8;
      const y = 2.4;

      slide.addShape(pptx.ShapeType.roundRect, {
        x,
        y,
        w: 3.5,
        h: 4.0,
        rectRadius: 0.1,
        fill: { color: 'F8FAFC' },
        line: { color: 'CBD5E1', width: 1 },
      });

      slide.addText(p.title, {
        x: x + 0.25,
        y: y + 0.3,
        w: 3.0,
        h: 0.6,
        fontSize: 13,
        fontFace: 'Arial',
        bold: true,
        color: SLATE_DARK,
      });

      slide.addText(p.desc, {
        x: x + 0.25,
        y: y + 1.0,
        w: 3.0,
        h: 2.7,
        fontSize: 11,
        fontFace: 'Arial',
        color: SLATE_MUTED,
        lineSpacing: 18,
      });
    });

    addFooter(slide);
  }

  // -------------------------------------------------------------
  // SLIDE 8: Module 5 & 6 — Chronic Safety & Drug Comparison
  // -------------------------------------------------------------
  {
    const slide = pptx.addSlide();
    addHeader(slide, '7. Modules 5 & 6 — Chronic Safety & Comparison Matrix');

    // Left: Chronic Safety
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.8,
      y: 1.6,
      w: 5.6,
      h: 5.1,
      rectRadius: 0.12,
      fill: { color: WHITE },
      line: { color: 'E2E8F0', width: 1 },
    });

    slide.addText('🛡️ Chronic Disease Safety Evaluator', {
      x: 1.1,
      y: 1.8,
      w: 5.0,
      h: 0.4,
      fontSize: 14,
      fontFace: 'Arial',
      bold: true,
      color: 'BE123C',
    });

    slide.addText([
      { text: '• Patient Comorbidity Matching:\n', options: { bold: true } },
      { text: '  Checks medications against Hypertension, Type 2 Diabetes, Chronic Kidney Disease (CKD), Hepatic Impairment, Peptic Ulcers, and Asthma.\n\n' },
      { text: '• Contraindication Triage:\n', options: { bold: true } },
      { text: '  Classifies as Safe (آمن), Caution/Adjust (تحذير وتعديل جرعة), or Strictly Contraindicated (ممنوع تماماً).\n\n' },
      { text: '• Clinical Renal/Hepatic Notes:\n', options: { bold: true } },
      { text: '  Provides CrCl cutoffs and dose reduction formulas.' }
    ], {
      x: 1.1,
      y: 2.3,
      w: 5.0,
      h: 4.2,
      fontSize: 11,
      fontFace: 'Arial',
      color: SLATE_DARK,
      lineSpacing: 18,
    });

    // Right: Comparison Matrix
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 6.8,
      y: 1.6,
      w: 5.7,
      h: 5.1,
      rectRadius: 0.12,
      fill: { color: WHITE },
      line: { color: 'E2E8F0', width: 1 },
    });

    slide.addText('⚖️ Side-by-Side Comparison Matrix', {
      x: 7.1,
      y: 1.8,
      w: 5.1,
      h: 0.4,
      fontSize: 14,
      fontFace: 'Arial',
      bold: true,
      color: BLUE,
    });

    slide.addText([
      { text: '• Head-to-Head Evaluation:\n', options: { bold: true } },
      { text: '  Compare any two drugs (e.g. Concor vs Tenormin, Augmentin vs Cipro, Panadol vs Cataflam).\n\n' },
      { text: '• Structured Feature Matrix:\n', options: { bold: true } },
      { text: '  Direct side-by-side comparison of active ingredients, therapeutic class, standard dosage, side-effect profiles, and precautions.\n\n' },
      { text: '• Clinical Recommendation Verdict:\n', options: { bold: true } },
      { text: '  Provides evidence-based summary on when to favor one drug over the other.' }
    ], {
      x: 7.1,
      y: 2.3,
      w: 5.1,
      h: 4.2,
      fontSize: 11,
      fontFace: 'Arial',
      color: SLATE_DARK,
      lineSpacing: 18,
    });

    addFooter(slide);
  }

  // -------------------------------------------------------------
  // SLIDE 9: Academic Impact, Credentials & Summary
  // -------------------------------------------------------------
  {
    const slide = pptx.addSlide();
    slide.background = { color: SLATE_DARK };

    slide.addText('ACADEMIC IMPACT & SUMMARY', {
      x: 1.0,
      y: 0.8,
      w: 10,
      h: 0.35,
      fontSize: 12,
      fontFace: 'Arial',
      color: '5EEAD4',
      bold: true,
    });

    slide.addText('YoPharma — Empowering Egyptian Pharmacy Practice', {
      x: 1.0,
      y: 1.2,
      w: 11,
      h: 0.6,
      fontSize: 26,
      fontFace: 'Arial',
      color: WHITE,
      bold: true,
    });

    // 3 summary boxes
    const sumCards = [
      {
        title: '🎓 Faculty Educational Tool',
        desc: 'Designed for pharmacy students at ECU for clinical training, OSCE exam prep, and prescription audit practice.',
      },
      {
        title: '🏥 Dispensary Clinical Decision Support',
        desc: 'Enables hospital & community pharmacists to prevent medication errors, drug toxicities, and food-timing failures in real time.',
      },
      {
        title: '🚀 High-Speed Reliable Tech',
        desc: 'Sub-millisecond RAM caching, automated fallback AI rotation, bilingual data sync, and 100% responsive design.',
      },
    ];

    sumCards.forEach((sc, idx) => {
      const x = 1.0 + idx * 3.8;
      const y = 2.1;

      slide.addShape(pptx.ShapeType.roundRect, {
        x,
        y,
        w: 3.5,
        h: 3.2,
        rectRadius: 0.12,
        fill: { color: '1E293B' },
        line: { color: '334155', width: 1 },
      });

      slide.addText(sc.title, {
        x: x + 0.25,
        y: y + 0.3,
        w: 3.0,
        h: 0.6,
        fontSize: 13,
        fontFace: 'Arial',
        bold: true,
        color: '5EEAD4',
      });

      slide.addText(sc.desc, {
        x: x + 0.25,
        y: y + 1.0,
        w: 3.0,
        h: 1.9,
        fontSize: 11,
        fontFace: 'Arial',
        color: '94A3B8',
        lineSpacing: 18,
      });
    });

    // Contact bottom strip
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 1.0,
      y: 5.6,
      w: 11.3,
      h: 1.1,
      rectRadius: 0.1,
      fill: { color: '134E4A' },
      line: { color: '0D9488', width: 1 },
    });

    slide.addText([
      { text: 'Developed by: ', options: { bold: true, color: '5EEAD4' } },
      { text: 'Youssef Mohamed  |  ', options: { color: WHITE } },
      { text: 'Academic Institution: ', options: { bold: true, color: '5EEAD4' } },
      { text: 'Egyptian Chinese University (ECU)  |  ', options: { color: WHITE } },
      { text: 'WhatsApp Support: ', options: { bold: true, color: '5EEAD4' } },
      { text: 'wa.me/qr/2ZQYXCK7REOIC1', options: { color: WHITE } }
    ], {
      x: 1.3,
      y: 5.8,
      w: 10.7,
      h: 0.7,
      fontSize: 12,
      fontFace: 'Arial',
      align: 'center',
    });
  }

  // Save file to project root
  const outputPath = 'c:/Users/Lenovo/Downloads/Telegram Desktop/app/YoPharma_Clinical_Presentation.pptx';
  await pptx.writeFile({ fileName: outputPath });
  console.log(`Presentation created successfully at: ${outputPath}`);
}

createPresentation().catch(err => {
  console.error('Error generating presentation:', err);
  process.exit(1);
});
