import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@medscope_symptom_history';
const MAX = 20;

export const saveSymptomCheck = async ({ symptoms, topCondition, urgency, conditionCount }) => {
  try {
    const json = await AsyncStorage.getItem(KEY);
    const history = json ? JSON.parse(json) : [];
    const entry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      symptoms,
      topCondition,
      urgency,
      conditionCount,
    };
    const updated = [entry, ...history].slice(0, MAX);
    await AsyncStorage.setItem(KEY, JSON.stringify(updated));
    return updated;
  } catch { return []; }
};

export const getSymptomHistory = async () => {
  try {
    const json = await AsyncStorage.getItem(KEY);
    return json ? JSON.parse(json) : [];
  } catch { return []; }
};

export const clearSymptomHistory = async () => {
  try { await AsyncStorage.removeItem(KEY); } catch {}
};
