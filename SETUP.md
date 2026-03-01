# MedScope – Setup Guide

## Prerequisites
- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (Mac) or Android Emulator, OR the **Expo Go** app on your phone

## Installation

```bash
cd medscope
npm install
npx expo start
```

Then scan the QR code with **Expo Go** (iOS/Android) or press `a` for Android emulator, `i` for iOS simulator.

---

## APIs Used

| Feature | API | Key Required |
|---------|-----|-------------|
| Drug Search | U.S. FDA OpenFDA | No (1000 req/day free) |
| Drug Recalls | U.S. FDA OpenFDA | No |
| Symptom Analysis | Local evidence-based database | No |
| Disease Encyclopedia | NIH MedlinePlus | No |

**All APIs are free and require no API key for basic usage.**

### Optional: Infermedica API (Cloud Symptom Analysis)
1. Register at https://infermedica.com/
2. Create `src/config/apiKeys.js`:
```js
export const INFERMEDICA_APP_ID = 'your-app-id';
export const INFERMEDICA_APP_KEY = 'your-app-key';
```
3. The symptomService.js is already structured to support Infermedica integration.

---

## Project Structure

```
medscope/
├── App.js                          # Entry point
├── src/
│   ├── navigation/
│   │   └── AppNavigator.js         # Bottom tabs + Stack navigators
│   ├── screens/
│   │   ├── drugs/
│   │   │   ├── DrugSearchScreen.js     # FDA drug search
│   │   │   ├── DrugDetailScreen.js     # Full drug info + recalls
│   │   │   └── SavedMedicationsScreen.js # My medications + compare
│   │   ├── symptoms/
│   │   │   ├── SymptomCheckerScreen.js  # Symptom selection
│   │   │   └── SymptomResultScreen.js  # Analysis results
│   │   └── diseases/
│   │       ├── DiseaseSearchScreen.js   # NIH disease search
│   │       └── DiseaseDetailScreen.js  # Disease detail
│   ├── services/
│   │   ├── openFDAService.js       # FDA API calls
│   │   ├── symptomService.js       # Symptom analysis engine + database
│   │   └── diseaseService.js       # MedlinePlus API + enrichment
│   ├── storage/
│   │   └── savedMedications.js     # AsyncStorage CRUD
│   ├── components/
│   │   ├── DisclaimerBanner.js     # Legal/safety disclaimer
│   │   ├── LoadingSpinner.js
│   │   ├── ErrorDisplay.js
│   │   └── SectionCard.js          # Collapsible section card
│   └── theme/
│       └── theme.js                # Colors, spacing, typography
```

---

## Legal Disclaimer

MedScope is built for **educational purposes only**.
- It does NOT provide medical advice, diagnosis, or treatment.
- Always consult a qualified healthcare professional.
- Call 911 for emergencies.
