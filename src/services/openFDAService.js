import axios from 'axios';

const FDA_BASE = 'https://api.fda.gov/drug';
const LIMIT = 15;

/**
 * Strip array of text blocks into a readable string.
 */
export const extractText = (field) => {
  if (!field) return '';
  if (Array.isArray(field)) return field.join('\n\n');
  return String(field);
};

/**
 * Get the display name for a drug result.
 */
export const getDrugDisplayName = (drug) => {
  return (
    drug.openfda?.brand_name?.[0] ||
    drug.openfda?.generic_name?.[0] ||
    'Unknown Drug'
  );
};

/**
 * Search drugs by brand or generic name.
 * Falls back through multiple query strategies for best coverage.
 */
export const searchDrugs = async (query) => {
  if (!query?.trim()) return { data: [], error: null };

  const q = query.trim();
  const strategies = [
    `openfda.brand_name:"${q}"`,
    `openfda.generic_name:"${q}"`,
    `openfda.substance_name:"${q}"`,
  ];

  for (const search of strategies) {
    try {
      const res = await axios.get(`${FDA_BASE}/label.json`, {
        params: { search, limit: LIMIT },
        timeout: 10000,
      });
      if (res.data?.results?.length > 0) {
        return { data: res.data.results, error: null };
      }
    } catch (err) {
      if (err.response?.status !== 404) {
        // Network error — report after all strategies fail
        if (strategies.indexOf(search) === strategies.length - 1) {
          return { data: null, error: 'Network error. Please check your connection.' };
        }
      }
    }
  }

  return { data: [], error: null };
};

/**
 * Get drug recall / enforcement actions by product description.
 */
export const getDrugRecalls = async (drugName) => {
  if (!drugName) return { data: [], error: null };
  try {
    const res = await axios.get(`${FDA_BASE}/enforcement.json`, {
      params: {
        search: `product_description:"${drugName}"`,
        limit: 5,
      },
      timeout: 10000,
    });
    return { data: res.data?.results || [], error: null };
  } catch (err) {
    if (err.response?.status === 404) return { data: [], error: null };
    return { data: [], error: null }; // Non-critical — suppress error
  }
};

/**
 * Fetch adverse event reports count for a drug (FAERS database).
 */
export const getAdverseEventCount = async (drugName) => {
  if (!drugName) return { count: null };
  try {
    const res = await axios.get(`${FDA_BASE}/event.json`, {
      params: {
        search: `patient.drug.medicinalproduct:"${drugName}"`,
        limit: 1,
      },
      timeout: 8000,
    });
    return { count: res.data?.meta?.results?.total || 0 };
  } catch {
    return { count: null };
  }
};

/**
 * Compare two drug label objects side by side.
 * Returns a structured comparison object.
 */
export const compareDrugs = (drugA, drugB) => {
  const fields = [
    { key: 'purpose', label: 'Purpose' },
    { key: 'indications_and_usage', label: 'Uses' },
    { key: 'dosage_and_administration', label: 'Dosage' },
    { key: 'warnings', label: 'Warnings' },
    { key: 'adverse_reactions', label: 'Side Effects' },
    { key: 'drug_interactions', label: 'Drug Interactions' },
    { key: 'contraindications', label: 'Contraindications' },
  ];

  return fields.map(({ key, label }) => ({
    label,
    a: extractText(drugA[key]),
    b: extractText(drugB[key]),
  }));
};

/**
 * Parse and normalize a raw OpenFDA label result into display-ready sections.
 */
export const normalizeDrug = (raw) => ({
  id: raw.openfda?.brand_name?.[0] || raw.openfda?.generic_name?.[0] || Math.random().toString(),
  brandName: raw.openfda?.brand_name?.[0] || '',
  genericName: raw.openfda?.generic_name?.[0] || '',
  manufacturer: raw.openfda?.manufacturer_name?.[0] || 'Unknown Manufacturer',
  productType: raw.openfda?.product_type?.[0] || '',
  route: (raw.openfda?.route || []).join(', '),
  substanceName: (raw.openfda?.substance_name || []).join(', '),
  purpose: extractText(raw.purpose),
  uses: extractText(raw.indications_and_usage),
  dosage: extractText(raw.dosage_and_administration),
  warnings: extractText(raw.warnings || raw.warnings_and_cautions),
  sideEffects: extractText(raw.adverse_reactions),
  interactions: extractText(raw.drug_interactions),
  contraindications: extractText(raw.contraindications),
  overdosage: extractText(raw.overdosage),
  activeIngredients: extractText(raw.active_ingredient),
  storageHandling: extractText(raw.storage_and_handling),
  keepOutOfReach: extractText(raw.keep_out_of_reach_of_children),
  raw,
});
