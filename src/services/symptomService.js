/**
 * Symptom Checker Service
 *
 * Primary: Local evidence-based symptom-condition database (CDC/NIH/WHO sources).
 * Optional: Infermedica API (configure INFERMEDICA_APP_ID and INFERMEDICA_APP_KEY
 *            in src/config/apiKeys.js to enable cloud analysis).
 *
 * DISCLAIMER: For educational purposes only. Not medical advice.
 */

// ─── Symptom Definitions ──────────────────────────────────────────────────────

export const SYMPTOM_CATEGORIES = [
  { id: 'general', label: 'General', icon: 'account-heart', color: '#5C6BC0' },
  { id: 'head', label: 'Head & Neuro', icon: 'brain', color: '#7B1FA2' },
  { id: 'respiratory', label: 'Respiratory', icon: 'lungs', color: '#1565C0' },
  { id: 'digestive', label: 'Digestive', icon: 'stomach', color: '#E65100' },
  { id: 'skin', label: 'Skin', icon: 'hand-back-left', color: '#AD1457' },
  { id: 'musculoskeletal', label: 'Musculo-skeletal', icon: 'bone', color: '#4E342E' },
  { id: 'urinary', label: 'Urinary', icon: 'water', color: '#00838F' },
  { id: 'cardiovascular', label: 'Cardiovascular', icon: 'heart-pulse', color: '#C62828' },
];

export const SYMPTOMS = [
  // General
  { id: 'g1', name: 'Fever', category: 'general' },
  { id: 'g2', name: 'Fatigue / Tiredness', category: 'general' },
  { id: 'g3', name: 'Weakness', category: 'general' },
  { id: 'g4', name: 'Unintentional Weight Loss', category: 'general' },
  { id: 'g5', name: 'Night Sweats', category: 'general' },
  { id: 'g6', name: 'Chills', category: 'general' },
  { id: 'g7', name: 'Loss of Appetite', category: 'general' },
  { id: 'g8', name: 'General Discomfort', category: 'general' },
  // Head & Neuro
  { id: 'h1', name: 'Headache', category: 'head' },
  { id: 'h2', name: 'Severe / Throbbing Headache', category: 'head' },
  { id: 'h3', name: 'Dizziness', category: 'head' },
  { id: 'h4', name: 'Confusion / Brain Fog', category: 'head' },
  { id: 'h5', name: 'Light Sensitivity', category: 'head' },
  { id: 'h6', name: 'Stiff Neck', category: 'head' },
  { id: 'h7', name: 'Memory Problems', category: 'head' },
  // Respiratory
  { id: 'r1', name: 'Dry Cough', category: 'respiratory' },
  { id: 'r2', name: 'Productive / Wet Cough', category: 'respiratory' },
  { id: 'r3', name: 'Shortness of Breath', category: 'respiratory' },
  { id: 'r4', name: 'Wheezing', category: 'respiratory' },
  { id: 'r5', name: 'Chest Tightness', category: 'respiratory' },
  { id: 'r6', name: 'Sore Throat', category: 'respiratory' },
  { id: 'r7', name: 'Runny Nose', category: 'respiratory' },
  { id: 'r8', name: 'Nasal Congestion', category: 'respiratory' },
  { id: 'r9', name: 'Loss of Smell / Taste', category: 'respiratory' },
  // Digestive
  { id: 'd1', name: 'Nausea', category: 'digestive' },
  { id: 'd2', name: 'Vomiting', category: 'digestive' },
  { id: 'd3', name: 'Diarrhea', category: 'digestive' },
  { id: 'd4', name: 'Constipation', category: 'digestive' },
  { id: 'd5', name: 'Abdominal Pain', category: 'digestive' },
  { id: 'd6', name: 'Lower Right Abdominal Pain', category: 'digestive' },
  { id: 'd7', name: 'Upper Abdominal Pain', category: 'digestive' },
  { id: 'd8', name: 'Bloating', category: 'digestive' },
  { id: 'd9', name: 'Heartburn / Acid Reflux', category: 'digestive' },
  // Skin
  { id: 'sk1', name: 'Rash', category: 'skin' },
  { id: 'sk2', name: 'Itching', category: 'skin' },
  { id: 'sk3', name: 'Jaundice (Yellow Skin/Eyes)', category: 'skin' },
  { id: 'sk4', name: 'Pale / Yellowish Skin', category: 'skin' },
  { id: 'sk5', name: 'Hives', category: 'skin' },
  { id: 'sk6', name: 'Easy Bruising', category: 'skin' },
  // Musculoskeletal
  { id: 'm1', name: 'Joint Pain', category: 'musculoskeletal' },
  { id: 'm2', name: 'Muscle Aches', category: 'musculoskeletal' },
  { id: 'm3', name: 'Back Pain', category: 'musculoskeletal' },
  { id: 'm4', name: 'Neck Pain', category: 'musculoskeletal' },
  { id: 'm5', name: 'Leg / Ankle Swelling', category: 'musculoskeletal' },
  { id: 'm6', name: 'Muscle Cramps', category: 'musculoskeletal' },
  // Urinary
  { id: 'u1', name: 'Frequent Urination', category: 'urinary' },
  { id: 'u2', name: 'Painful Urination', category: 'urinary' },
  { id: 'u3', name: 'Blood in Urine', category: 'urinary' },
  { id: 'u4', name: 'Dark / Cloudy Urine', category: 'urinary' },
  // Cardiovascular
  { id: 'c1', name: 'Chest Pain', category: 'cardiovascular' },
  { id: 'c2', name: 'Heart Palpitations', category: 'cardiovascular' },
  { id: 'c3', name: 'Rapid Heartbeat', category: 'cardiovascular' },
  { id: 'c4', name: 'Swollen Ankles / Feet', category: 'cardiovascular' },
];

// ─── Condition Definitions ────────────────────────────────────────────────────
// symptomWeights: symptomId → weight (higher = more indicative of this condition)
// urgency: 'low' | 'medium' | 'high' | 'emergency'

const CONDITIONS = [
  {
    id: 'common_cold',
    name: 'Common Cold',
    category: 'Respiratory',
    urgency: 'low',
    overview:
      'A mild viral infection of the upper respiratory tract. Usually resolves in 7–10 days without treatment.',
    whenToSeeDoctor:
      'If symptoms last more than 10 days, worsen after initial improvement, or include high fever (>103°F / 39.4°C).',
    emergencyWarnings: ['Difficulty breathing', 'High fever above 103°F (39.4°C)', 'Symptoms in infants under 3 months'],
    relatedDisease: 'Common Cold',
    relatedDrugs: ['Decongestant', 'Antihistamine', 'Acetaminophen', 'Ibuprofen'],
    symptomWeights: {
      r7: 3, r8: 3, r6: 2, r1: 2, g1: 1, g2: 1, h1: 1, d1: 1,
    },
  },
  {
    id: 'influenza',
    name: 'Influenza (Flu)',
    category: 'Respiratory / Systemic',
    urgency: 'medium',
    overview:
      'A contagious respiratory illness caused by influenza viruses. Flu can cause mild to severe illness and can lead to hospitalization.',
    whenToSeeDoctor:
      'If symptoms are severe, you are at high risk (elderly, pregnant, immunocompromised), or symptoms worsen rapidly.',
    emergencyWarnings: [
      'Difficulty breathing', 'Persistent chest pain', 'Confusion', 'Severe vomiting', 'Bluish lips or face',
    ],
    relatedDisease: 'Influenza',
    relatedDrugs: ['Oseltamivir (Tamiflu)', 'Ibuprofen', 'Acetaminophen'],
    symptomWeights: {
      g1: 3, m2: 3, g2: 2, g6: 2, h1: 2, r1: 2, g7: 1, r6: 1, g3: 1,
    },
  },
  {
    id: 'covid19',
    name: 'COVID-19',
    category: 'Respiratory / Systemic',
    urgency: 'medium',
    overview:
      'An infectious disease caused by SARS-CoV-2. Symptoms range from mild (cold-like) to severe respiratory illness.',
    whenToSeeDoctor:
      'Get tested if you have symptoms. Seek care promptly if symptoms are moderate or worsening.',
    emergencyWarnings: [
      'Difficulty breathing', 'Persistent chest pain or pressure', 'Confusion', 'Inability to stay awake', 'Bluish lips or face',
    ],
    relatedDisease: 'COVID-19',
    relatedDrugs: ['Paxlovid', 'Acetaminophen', 'Ibuprofen'],
    symptomWeights: {
      g1: 2, r1: 2, g2: 2, r9: 3, g3: 1, r3: 2, h1: 1, m2: 1, d1: 1, g6: 1,
    },
  },
  {
    id: 'strep_throat',
    name: 'Strep Throat',
    category: 'Throat / Bacterial',
    urgency: 'medium',
    overview:
      'A bacterial infection (Group A Streptococcus) causing throat pain and inflammation. Requires antibiotic treatment.',
    whenToSeeDoctor:
      'See a doctor within 24 hours. Strep throat requires antibiotics and can lead to complications if untreated.',
    emergencyWarnings: ['Difficulty swallowing or breathing', 'Drooling', 'Muffled voice', 'Rash (may indicate scarlet fever)'],
    relatedDisease: 'Strep Throat',
    relatedDrugs: ['Amoxicillin', 'Penicillin', 'Acetaminophen', 'Ibuprofen'],
    symptomWeights: {
      r6: 3, g1: 2, h1: 1, g6: 1, sk1: 1, d1: 1,
    },
  },
  {
    id: 'pneumonia',
    name: 'Pneumonia',
    category: 'Respiratory / Lung',
    urgency: 'high',
    overview:
      'An infection that inflames the air sacs in one or both lungs. Can be caused by bacteria, viruses, or fungi.',
    whenToSeeDoctor:
      'Seek medical attention promptly. Pneumonia can become life-threatening, especially in the elderly and young children.',
    emergencyWarnings: [
      'Severe difficulty breathing', 'Bluish lips or fingertips', 'Chest pain', 'High fever with chills', 'Confusion (in elderly)',
    ],
    relatedDisease: 'Pneumonia',
    relatedDrugs: ['Amoxicillin', 'Azithromycin', 'Levofloxacin'],
    symptomWeights: {
      g1: 3, r2: 3, r3: 3, c1: 2, g6: 2, g2: 2, g8: 2, r5: 1, h4: 1,
    },
  },
  {
    id: 'asthma',
    name: 'Asthma',
    category: 'Respiratory / Chronic',
    urgency: 'medium',
    overview:
      'A chronic condition causing airway inflammation and narrowing, leading to recurring episodes of wheezing, breathlessness, and chest tightness.',
    whenToSeeDoctor:
      'See a doctor for diagnosis. During an attack that doesn\'t respond to your inhaler, seek emergency care immediately.',
    emergencyWarnings: ['Severe shortness of breath', 'Inability to speak full sentences', 'Blue lips or fingernails', 'No improvement with rescue inhaler'],
    relatedDisease: 'Asthma',
    relatedDrugs: ['Albuterol', 'Fluticasone', 'Montelukast', 'Budesonide'],
    symptomWeights: {
      r4: 3, r3: 3, r5: 3, r1: 2, g2: 1, c1: 1,
    },
  },
  {
    id: 'migraine',
    name: 'Migraine',
    category: 'Neurological',
    urgency: 'medium',
    overview:
      'A neurological condition causing intense, throbbing headaches often accompanied by nausea, vomiting, and extreme sensitivity to light and sound.',
    whenToSeeDoctor:
      'See a doctor if migraines are frequent, severe, or not responding to OTC medications. Seek emergency care if "worst headache of your life."',
    emergencyWarnings: [
      '"Thunderclap" headache (sudden, worst of your life)', 'Headache with fever and stiff neck', 'Headache after head injury', 'Headache with vision loss',
    ],
    relatedDisease: 'Migraine',
    relatedDrugs: ['Sumatriptan', 'Ibuprofen', 'Acetaminophen', 'Topiramate'],
    symptomWeights: {
      h2: 3, d1: 2, h5: 2, d2: 2, h3: 1, g2: 1,
    },
  },
  {
    id: 'diabetes_t2',
    name: 'Type 2 Diabetes (Possible)',
    category: 'Metabolic / Endocrine',
    urgency: 'medium',
    overview:
      'A chronic condition affecting how the body processes blood sugar. Often develops gradually with subtle symptoms.',
    whenToSeeDoctor:
      'Schedule a doctor\'s appointment for blood sugar testing. Don\'t ignore these symptoms — early treatment prevents complications.',
    emergencyWarnings: ['Extremely high or low blood sugar', 'Confusion, fruity breath (diabetic ketoacidosis)', 'Loss of consciousness'],
    relatedDisease: 'Diabetes',
    relatedDrugs: ['Metformin', 'Insulin', 'Glipizide', 'Sitagliptin'],
    symptomWeights: {
      u1: 3, g2: 2, g4: 2, h3: 1, sk2: 1, h7: 1, g3: 1,
    },
  },
  {
    id: 'hypertension',
    name: 'Hypertension (High Blood Pressure)',
    category: 'Cardiovascular',
    urgency: 'medium',
    overview:
      'Often called the "silent killer" because it frequently has no symptoms. Long-term hypertension is a major risk factor for heart disease and stroke.',
    whenToSeeDoctor:
      'See a doctor for regular blood pressure monitoring. Don\'t rely on symptoms — get screened regularly.',
    emergencyWarnings: [
      'Severe headache', 'Chest pain', 'Difficulty breathing', 'Vision problems', 'Numbness (hypertensive crisis)',
    ],
    relatedDisease: 'High Blood Pressure',
    relatedDrugs: ['Lisinopril', 'Amlodipine', 'Metoprolol', 'Losartan'],
    symptomWeights: {
      h1: 2, h3: 2, c1: 2, c2: 1, h2: 1,
    },
  },
  {
    id: 'gastroenteritis',
    name: 'Gastroenteritis (Stomach Flu)',
    category: 'Digestive / Infectious',
    urgency: 'low',
    overview:
      'An intestinal infection marked by diarrhea, abdominal cramps, nausea, and vomiting. Usually resolves without medical treatment.',
    whenToSeeDoctor:
      'If symptoms last more than 3 days, you can\'t keep fluids down, or you show signs of dehydration.',
    emergencyWarnings: ['Bloody diarrhea', 'Signs of dehydration (extreme thirst, no urination)', 'Fever above 104°F', 'Severe abdominal pain'],
    relatedDisease: 'Gastroenteritis',
    relatedDrugs: ['Oral rehydration salts', 'Loperamide (Imodium)', 'Ondansetron'],
    symptomWeights: {
      d1: 3, d2: 3, d3: 3, d5: 2, g1: 2, g7: 1, g2: 1,
    },
  },
  {
    id: 'gerd',
    name: 'GERD / Acid Reflux',
    category: 'Digestive / Chronic',
    urgency: 'low',
    overview:
      'Gastroesophageal reflux disease occurs when stomach acid repeatedly flows back into the esophagus, causing irritation.',
    whenToSeeDoctor:
      'See a doctor if symptoms occur more than twice per week or don\'t respond to OTC antacids.',
    emergencyWarnings: ['Chest pain (distinguish from heart attack)', 'Difficulty swallowing', 'Unexplained weight loss', 'Vomiting blood'],
    relatedDisease: 'GERD',
    relatedDrugs: ['Omeprazole', 'Ranitidine', 'Antacids', 'Famotidine'],
    symptomWeights: {
      d9: 3, d1: 2, r6: 1, c1: 1, d8: 2, d5: 1,
    },
  },
  {
    id: 'appendicitis',
    name: 'Appendicitis',
    category: 'Digestive / Surgical Emergency',
    urgency: 'emergency',
    overview:
      'Inflammation of the appendix. A medical emergency requiring prompt surgical treatment.',
    whenToSeeDoctor:
      'Seek emergency medical care IMMEDIATELY if you suspect appendicitis. Do not eat, drink, or take pain medications — go to the ER.',
    emergencyWarnings: [
      'THIS IS A MEDICAL EMERGENCY', 'Sudden sharp abdominal pain, especially lower right', 'Fever with severe abdominal pain', 'Rigid abdomen (board-like)',
    ],
    relatedDisease: 'Appendicitis',
    relatedDrugs: [],
    symptomWeights: {
      d6: 3, g1: 2, d1: 2, d2: 1, g7: 1, g3: 1,
    },
  },
  {
    id: 'uti',
    name: 'Urinary Tract Infection (UTI)',
    category: 'Urinary / Bacterial',
    urgency: 'medium',
    overview:
      'A bacterial infection in the urinary system (bladder, urethra, kidneys). More common in women. Requires antibiotic treatment.',
    whenToSeeDoctor:
      'See a doctor within 1–2 days. UTIs require antibiotics and can spread to the kidneys if untreated.',
    emergencyWarnings: ['Fever with back/flank pain (may indicate kidney infection)', 'Vomiting', 'Shaking chills', 'Blood in urine'],
    relatedDisease: 'Urinary Tract Infection',
    relatedDrugs: ['Trimethoprim-Sulfamethoxazole', 'Nitrofurantoin', 'Ciprofloxacin'],
    symptomWeights: {
      u2: 3, u1: 3, u4: 2, u3: 2, g1: 1, m3: 1,
    },
  },
  {
    id: 'anemia',
    name: 'Iron Deficiency Anemia',
    category: 'Hematologic / Nutritional',
    urgency: 'medium',
    overview:
      'A condition where lack of healthy red blood cells prevents adequate oxygen delivery to tissues. The most common type of anemia.',
    whenToSeeDoctor:
      'See a doctor for a blood test. Anemia can indicate an underlying condition such as internal bleeding or poor iron absorption.',
    emergencyWarnings: ['Chest pain', 'Shortness of breath at rest', 'Rapid or irregular heartbeat', 'Fainting'],
    relatedDisease: 'Anemia',
    relatedDrugs: ['Ferrous sulfate (Iron supplement)', 'Vitamin C', 'Folic acid'],
    symptomWeights: {
      g2: 3, sk4: 3, h3: 2, r3: 2, c3: 1, h1: 1, g3: 2, g4: 1,
    },
  },
  {
    id: 'anxiety',
    name: 'Anxiety Disorder',
    category: 'Mental Health',
    urgency: 'low',
    overview:
      'A mental health condition characterized by persistent, excessive worry and physical symptoms. Very treatable with professional support.',
    whenToSeeDoctor:
      'See a doctor or mental health professional. Anxiety disorders are highly treatable. Don\'t hesitate to seek help.',
    emergencyWarnings: ['Chest pain (rule out heart attack)', 'Thoughts of self-harm', 'Severe panic attacks interfering with daily life'],
    relatedDisease: 'Anxiety',
    relatedDrugs: ['Sertraline', 'Escitalopram', 'Buspirone', 'Lorazepam'],
    symptomWeights: {
      c2: 3, c3: 2, c1: 1, r3: 1, h1: 1, g2: 1, h3: 1, m6: 1,
    },
  },
  {
    id: 'kidney_stones',
    name: 'Kidney Stones',
    category: 'Urinary / Structural',
    urgency: 'high',
    overview:
      'Hard deposits of minerals and salts inside the kidneys. Can cause severe pain as they pass through the urinary tract.',
    whenToSeeDoctor:
      'See a doctor promptly for severe pain. An ER visit is warranted for uncontrollable pain, fever, or inability to pass urine.',
    emergencyWarnings: ['Severe, sharp pain in side and back', 'Pain radiating to lower abdomen', 'Fever with back pain', 'Persistent vomiting'],
    relatedDisease: 'Kidney Stones',
    relatedDrugs: ['Ibuprofen', 'Ketorolac', 'Tamsulosin', 'Opioid analgesics (prescription)'],
    symptomWeights: {
      m3: 3, u3: 3, d1: 2, d2: 2, u2: 2, u4: 1, g1: 1,
    },
  },
  {
    id: 'allergic_reaction',
    name: 'Allergic Reaction',
    category: 'Immune / Hypersensitivity',
    urgency: 'high',
    overview:
      'An immune system response to a normally harmless substance. Ranges from mild (hives) to life-threatening (anaphylaxis).',
    whenToSeeDoctor:
      'Mild reactions: see a doctor within 24 hours. Any throat tightening, difficulty breathing, or swelling of face/tongue → CALL 911 IMMEDIATELY.',
    emergencyWarnings: [
      'Throat tightening or closing', 'Difficulty breathing', 'Dizziness or fainting', 'Rapid heartbeat', 'Swelling of face, lips, or tongue (anaphylaxis)',
    ],
    relatedDisease: 'Allergies',
    relatedDrugs: ['Epinephrine (EpiPen)', 'Diphenhydramine (Benadryl)', 'Cetirizine', 'Prednisone'],
    symptomWeights: {
      sk5: 3, sk1: 3, sk2: 2, r3: 2, c2: 1, d1: 1, h3: 1, r4: 2,
    },
  },
  {
    id: 'hypothyroidism',
    name: 'Hypothyroidism',
    category: 'Endocrine / Thyroid',
    urgency: 'low',
    overview:
      'An underactive thyroid gland that doesn\'t produce enough thyroid hormone, slowing down many body functions.',
    whenToSeeDoctor:
      'Schedule an appointment for a simple blood test (TSH). Hypothyroidism is easily managed with medication.',
    emergencyWarnings: ['Myxedema coma (very rare, severe): confusion, hypothermia, slow breathing'],
    relatedDisease: 'Thyroid Disorders',
    relatedDrugs: ['Levothyroxine (Synthroid)'],
    symptomWeights: {
      g2: 3, g4: 2, m6: 2, m1: 1, h7: 1, sk4: 1, g3: 2, d4: 1,
    },
  },
  {
    id: 'dehydration',
    name: 'Dehydration',
    category: 'Fluid / Electrolyte',
    urgency: 'medium',
    overview:
      'Occurs when your body loses more fluid than you take in. Can range from mild to severe and life-threatening.',
    whenToSeeDoctor:
      'Seek care for severe dehydration, especially in children, elderly, or if unable to keep fluids down.',
    emergencyWarnings: ['Extreme thirst', 'No urination for 8+ hours', 'Sunken eyes', 'Rapid heartbeat', 'Confusion (severe dehydration)'],
    relatedDisease: 'Dehydration',
    relatedDrugs: ['Oral rehydration salts', 'IV fluids (prescription)'],
    symptomWeights: {
      h3: 2, g2: 2, m6: 1, h1: 1, u5: 3, c3: 1, g3: 1, g8: 1,
    },
  },
];

// ─── Symptom Analysis Engine ──────────────────────────────────────────────────

/**
 * Analyze selected symptoms and return ranked possible conditions.
 * @param {string[]} selectedIds - Array of selected symptom IDs
 * @returns {{ conditions: object[], overallUrgency: string }}
 */
export const analyzeSymptoms = (selectedIds) => {
  if (!selectedIds?.length) return { conditions: [], overallUrgency: 'low' };

  const selectedSet = new Set(selectedIds);

  const scored = CONDITIONS.map((condition) => {
    const weights = condition.symptomWeights;
    let matchedScore = 0;
    let maxScore = 0;
    const matchedSymptoms = [];

    for (const [symptomId, weight] of Object.entries(weights)) {
      maxScore += weight;
      if (selectedSet.has(symptomId)) {
        matchedScore += weight;
        const symptom = SYMPTOMS.find((s) => s.id === symptomId);
        if (symptom) matchedSymptoms.push(symptom.name);
      }
    }

    if (matchedScore === 0) return null;

    // Normalize 0–100; penalize over-selection slightly
    const coverageRatio = matchedScore / maxScore;
    const selectivityBonus = matchedSymptoms.length >= 3 ? 0.05 : 0;
    const rawProbability = Math.min(1, coverageRatio + selectivityBonus);

    // Round to nearest 5%
    const probability = Math.round((rawProbability * 100) / 5) * 5;

    return {
      ...condition,
      probability: Math.max(5, Math.min(95, probability)),
      matchedSymptoms,
    };
  })
    .filter(Boolean)
    .filter((c) => c.probability >= 15)
    .sort((a, b) => {
      // Sort by probability, then urgency severity
      const urgencyOrder = { emergency: 4, high: 3, medium: 2, low: 1 };
      if (b.probability !== a.probability) return b.probability - a.probability;
      return (urgencyOrder[b.urgency] || 0) - (urgencyOrder[a.urgency] || 0);
    })
    .slice(0, 6);

  // Overall urgency = highest urgency among top results
  const urgencyOrder = { emergency: 4, high: 3, medium: 2, low: 1 };
  const overallUrgency = scored.reduce((max, c) => {
    return (urgencyOrder[c.urgency] || 0) > (urgencyOrder[max] || 0) ? c.urgency : max;
  }, 'low');

  return { conditions: scored, overallUrgency };
};

/**
 * Get symptom list filtered by category.
 */
export const getSymptomsByCategory = (categoryId) =>
  SYMPTOMS.filter((s) => s.category === categoryId);

/**
 * Get symptom by ID.
 */
export const getSymptomById = (id) => SYMPTOMS.find((s) => s.id === id);
