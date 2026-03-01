/**
 * Disease Encyclopedia Service
 *
 * Primary source: NIH MedlinePlus Health Topics API
 * URL: https://wsearch.nlm.nih.gov/ws/query?db=healthTopics&term={query}
 * Returns XML — parsed with fast-xml-parser.
 *
 * DISCLAIMER: For educational purposes only. Not medical advice.
 */

import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';

const MEDLINEPLUS_URL = 'https://wsearch.nlm.nih.gov/ws/query';

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  isArray: (name) => ['document', 'content'].includes(name),
  allowBooleanAttributes: true,
});

// ─── Utility ──────────────────────────────────────────────────────────────────

const stripHtml = (html) => {
  if (!html || typeof html !== 'string') return '';
  return html
    .replace(/<ul[^>]*>/gi, '\n')
    .replace(/<\/ul>/gi, '')
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<\/li>/gi, '\n')
    .replace(/<p[^>]*>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

const getContentField = (contents, fieldName) => {
  if (!Array.isArray(contents)) return '';
  const item = contents.find((c) => c['@_name'] === fieldName);
  if (!item) return '';
  const val = item['#text'] || item;
  return typeof val === 'string' ? val : '';
};

// ─── API ──────────────────────────────────────────────────────────────────────

/**
 * Search MedlinePlus Health Topics by term.
 * @param {string} query
 * @returns {{ data: object[], error: string|null }}
 */
export const searchDiseases = async (query) => {
  if (!query?.trim()) return { data: [], error: null };

  try {
    const res = await axios.get(MEDLINEPLUS_URL, {
      params: {
        db: 'healthTopics',
        term: query.trim(),
        retmax: 20,
      },
      timeout: 12000,
    });

    const parsed = xmlParser.parse(res.data);
    const documents = parsed?.nlmSearchResult?.list?.document || [];

    const results = documents.map((doc) => {
      const contents = doc.content || [];
      const rawSummary = getContentField(contents, 'FullSummary');
      const snippet = getContentField(contents, 'snippet');

      return {
        id: doc['@_url'] || Math.random().toString(),
        title: getContentField(contents, 'title') || 'Unknown',
        url: doc['@_url'] || '',
        summary: stripHtml(rawSummary || snippet),
        snippet: stripHtml(snippet),
        organization: getContentField(contents, 'organizationName') || 'NIH MedlinePlus',
        rank: parseInt(doc['@_rank']) || 0,
      };
    }).filter((d) => d.title && d.title !== 'Unknown');

    return { data: results, error: null };
  } catch (err) {
    if (err.response?.status === 404) return { data: [], error: null };
    return {
      data: null,
      error: 'Unable to load diseases. Please check your connection.',
    };
  }
};

// ─── Local Disease Enrichment Database ───────────────────────────────────────
// Rich detail for the most common conditions, supplementing the API summary.

const DISEASE_DETAILS = {
  diabetes: {
    overview:
      'Diabetes is a chronic disease that occurs when the pancreas does not produce enough insulin, or when the body cannot effectively use the insulin it produces. Insulin is a hormone that regulates blood glucose. There are two main types: Type 1 (autoimmune) and Type 2 (lifestyle-related).',
    symptoms: ['Increased thirst', 'Frequent urination', 'Unexplained weight loss', 'Fatigue', 'Blurred vision', 'Slow-healing sores', 'Frequent infections'],
    causes: ['Genetics', 'Autoimmune destruction of pancreatic cells (Type 1)', 'Insulin resistance (Type 2)', 'Obesity', 'Physical inactivity', 'Poor diet'],
    riskFactors: ['Family history', 'Being overweight', 'Age over 45', 'Gestational diabetes history', 'Prediabetes', 'High blood pressure', 'High cholesterol'],
    treatments: ['Blood sugar monitoring', 'Insulin therapy', 'Oral medications (Metformin)', 'Healthy diet', 'Regular exercise', 'Weight management'],
    prevention: ['Maintain a healthy weight', 'Exercise regularly', 'Eat a balanced diet', 'Avoid smoking', 'Regular blood sugar screening'],
    relatedDrugs: ['Metformin', 'Insulin', 'Glipizide', 'Sitagliptin', 'Empagliflozin'],
  },
  hypertension: {
    overview:
      'Hypertension (high blood pressure) is a common condition where the long-term force of blood against artery walls is high enough to potentially cause health problems like heart disease. It is often called the "silent killer" because it typically has no symptoms.',
    symptoms: ['Usually no symptoms', 'Headaches (in severe cases)', 'Shortness of breath (severe cases)', 'Nosebleeds (severe cases)'],
    causes: ['Unknown (primary/essential hypertension)', 'Kidney disease', 'Thyroid problems', 'Sleep apnea', 'Certain medications'],
    riskFactors: ['Age', 'Family history', 'Obesity', 'Too little physical activity', 'Tobacco use', 'Too much sodium', 'Low potassium', 'Excessive alcohol', 'Stress'],
    treatments: ['Lifestyle changes', 'ACE inhibitors', 'Calcium channel blockers', 'Diuretics', 'Beta-blockers', 'ARBs'],
    prevention: ['Healthy diet (DASH diet)', 'Regular exercise', 'Limit alcohol', 'Quit smoking', 'Manage stress', 'Maintain healthy weight', 'Reduce sodium intake'],
    relatedDrugs: ['Lisinopril', 'Amlodipine', 'Hydrochlorothiazide', 'Metoprolol', 'Losartan'],
  },
  asthma: {
    overview:
      'Asthma is a condition in which your airways narrow and swell and may produce extra mucus. This can make breathing difficult and trigger coughing, a whistling sound (wheezing) when you breathe out and shortness of breath.',
    symptoms: ['Shortness of breath', 'Chest tightness or pain', 'Wheezing when exhaling', 'Trouble sleeping caused by breathing difficulty', 'Coughing attacks worsened by respiratory viruses'],
    causes: ['Airborne allergens (pollen, mold, dust mites)', 'Respiratory infections', 'Physical activity', 'Cold air', 'Air pollutants', 'Certain medications', 'Stress'],
    riskFactors: ['Having a blood relative with asthma', 'Allergic conditions', 'Being overweight', 'Smoking', 'Exposure to second-hand smoke', 'Exposure to exhaust fumes or chemicals'],
    treatments: ['Long-term control medications (inhaled corticosteroids)', 'Quick-relief inhalers (bronchodilators)', 'Allergy medications', 'Biologics for severe asthma', 'Asthma action plan'],
    prevention: ['Identify and avoid triggers', 'Monitor breathing', 'Follow your asthma action plan', 'Get vaccinated for influenza and pneumonia', 'Use air purifiers'],
    relatedDrugs: ['Albuterol', 'Fluticasone', 'Budesonide', 'Salmeterol', 'Montelukast'],
  },
  influenza: {
    overview:
      'Influenza (flu) is a contagious respiratory illness caused by influenza viruses that infect the nose, throat, and sometimes the lungs. It can cause mild to severe illness. Flu is different from a cold — symptoms come on suddenly.',
    symptoms: ['Fever or chills', 'Cough', 'Sore throat', 'Runny or stuffy nose', 'Muscle or body aches', 'Headaches', 'Fatigue', 'Vomiting and diarrhea (more common in children)'],
    causes: ['Influenza A, B, and C viruses', 'Spread through respiratory droplets', 'Touching contaminated surfaces'],
    riskFactors: ['Age over 65 or under 5', 'Pregnancy', 'Chronic medical conditions', 'Weakened immune system', 'Working in healthcare', 'Close contact with infected individuals'],
    treatments: ['Antiviral drugs (oseltamivir, zanamivir)', 'Rest', 'Fluids', 'Fever reducers', 'Cough suppressants'],
    prevention: ['Annual flu vaccine', 'Wash hands frequently', 'Avoid touching face', 'Avoid close contact with sick people', 'Cover coughs and sneezes'],
    relatedDrugs: ['Oseltamivir (Tamiflu)', 'Zanamivir (Relenza)', 'Baloxavir (Xofluza)', 'Acetaminophen', 'Ibuprofen'],
  },
  pneumonia: {
    overview:
      'Pneumonia is an infection that inflames the air sacs in one or both lungs. The air sacs may fill with fluid or pus, causing cough with phlegm or pus, fever, chills, and difficulty breathing.',
    symptoms: ['Chest pain when breathing or coughing', 'Confusion (in older adults)', 'Cough with phlegm', 'Fatigue', 'Fever, sweating and chills', 'Lower-than-normal body temperature (in older adults)', 'Nausea, vomiting, or diarrhea', 'Shortness of breath'],
    causes: ['Bacteria (Streptococcus pneumoniae)', 'Viruses (influenza, COVID-19)', 'Fungi', 'Hospital-acquired infections'],
    riskFactors: ['Being over 65', 'Young children under 2', 'Hospitalization', 'Chronic lung disease', 'Smoking', 'Weakened immune system'],
    treatments: ['Antibiotics (bacterial pneumonia)', 'Antiviral medications', 'Fever reducers', 'Cough medicine', 'Hospitalization for severe cases', 'Oxygen therapy'],
    prevention: ['Vaccines (pneumococcal vaccine, flu vaccine)', 'Good hygiene', 'Quit smoking', 'Stay healthy (exercise, balanced diet)'],
    relatedDrugs: ['Amoxicillin', 'Azithromycin', 'Levofloxacin', 'Clarithromycin'],
  },
  migraine: {
    overview:
      'A migraine is a powerful headache that often comes with nausea, vomiting, and extreme sensitivity to light and sound. Migraine attacks can last hours to days, and the pain can be severe enough to interfere with daily activities.',
    symptoms: ['Throbbing, pulsating pain on one side of the head', 'Nausea and vomiting', 'Sensitivity to light (photophobia)', 'Sensitivity to sound (phonophobia)', 'Aura (visual disturbances) — in some people', 'Worsening pain with physical activity'],
    causes: ['Hormonal changes (especially in women)', 'Certain foods and drinks', 'Stress', 'Changes in sleep patterns', 'Environmental changes', 'Bright lights or loud sounds', 'Medications'],
    riskFactors: ['Family history', 'Age (most common between 20–50)', 'Sex (women 3x more likely)', 'Hormonal changes'],
    treatments: ['Pain-relieving medications (triptans, NSAIDs)', 'Preventive medications (topiramate, propranolol)', 'Lifestyle adjustments', 'Avoiding triggers', 'CGRP monoclonal antibodies'],
    prevention: ['Keep a migraine diary to identify triggers', 'Maintain regular sleep schedule', 'Stay hydrated', 'Regular exercise', 'Stress management', 'Limit caffeine and alcohol'],
    relatedDrugs: ['Sumatriptan', 'Rizatriptan', 'Topiramate', 'Amitriptyline', 'Propranolol'],
  },
};

/**
 * Enrich a disease result with local detailed data (if available).
 * Matching is done by keyword in the disease title.
 */
export const enrichDiseaseData = (diseaseTitle) => {
  if (!diseaseTitle) return null;
  const title = diseaseTitle.toLowerCase();

  for (const [key, data] of Object.entries(DISEASE_DETAILS)) {
    if (title.includes(key)) return data;
  }
  return null;
};

/**
 * Browse categories for the disease encyclopedia home screen.
 */
export const DISEASE_CATEGORIES = [
  { id: 'heart', label: 'Heart & Circulation', icon: 'heart-pulse', query: 'heart disease' },
  { id: 'respiratory', label: 'Respiratory', icon: 'lungs', query: 'lung disease' },
  { id: 'diabetes', label: 'Diabetes & Metabolism', icon: 'diabetes', query: 'diabetes' },
  { id: 'mental', label: 'Mental Health', icon: 'brain', query: 'anxiety depression' },
  { id: 'infections', label: 'Infections', icon: 'virus', query: 'infectious disease' },
  { id: 'cancer', label: 'Cancer', icon: 'ribbon', query: 'cancer' },
  { id: 'digestive', label: 'Digestive', icon: 'stomach', query: 'digestive disorders' },
  { id: 'bones', label: 'Bones & Joints', icon: 'bone', query: 'arthritis bone' },
  { id: 'skin', label: 'Skin', icon: 'hand-back-left', query: 'skin conditions' },
  { id: 'kidney', label: 'Kidney & Urinary', icon: 'water', query: 'kidney disease' },
];
