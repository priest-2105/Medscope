import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@medscope_saved_medications';

export const getSavedMedications = async () => {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    return json ? JSON.parse(json) : [];
  } catch {
    return [];
  }
};

export const saveMedication = async (drug) => {
  try {
    const existing = await getSavedMedications();
    const id = drug.id || drug.openfda?.brand_name?.[0] || drug.openfda?.generic_name?.[0] || Date.now().toString();
    const already = existing.find((d) => d.id === id);
    if (already) return existing;
    const entry = {
      id,
      brandName: drug.openfda?.brand_name?.[0] || 'Unknown',
      genericName: drug.openfda?.generic_name?.[0] || '',
      manufacturer: drug.openfda?.manufacturer_name?.[0] || '',
      productType: drug.openfda?.product_type?.[0] || '',
      route: drug.openfda?.route?.[0] || '',
      savedAt: new Date().toISOString(),
      rawData: drug,
    };
    const updated = [entry, ...existing];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
};

export const removeMedication = async (id) => {
  try {
    const existing = await getSavedMedications();
    const updated = existing.filter((d) => d.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
};

export const isMedicationSaved = async (drug) => {
  try {
    const existing = await getSavedMedications();
    const id = drug.id || drug.openfda?.brand_name?.[0] || drug.openfda?.generic_name?.[0];
    return existing.some((d) => d.id === id);
  } catch {
    return false;
  }
};

export const clearAllMedications = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
    return [];
  } catch {
    return [];
  }
};
