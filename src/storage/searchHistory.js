import AsyncStorage from '@react-native-async-storage/async-storage';

const DRUG_KEY = '@medscope_drug_history';
const DISEASE_KEY = '@medscope_disease_history';
const MAX = 8;

async function add(key, term) {
  try {
    const json = await AsyncStorage.getItem(key);
    const list = json ? JSON.parse(json) : [];
    const deduped = list.filter(t => t.toLowerCase() !== term.toLowerCase());
    const updated = [term, ...deduped].slice(0, MAX);
    await AsyncStorage.setItem(key, JSON.stringify(updated));
  } catch {}
}

async function get(key) {
  try {
    const json = await AsyncStorage.getItem(key);
    return json ? JSON.parse(json) : [];
  } catch { return []; }
}

async function clear(key) {
  try { await AsyncStorage.removeItem(key); } catch {}
}

export const addDrugHistory = (term) => add(DRUG_KEY, term);
export const getDrugHistory = () => get(DRUG_KEY);
export const clearDrugHistory = () => clear(DRUG_KEY);

export const addDiseaseHistory = (term) => add(DISEASE_KEY, term);
export const getDiseaseHistory = () => get(DISEASE_KEY);
export const clearDiseaseHistory = () => clear(DISEASE_KEY);
