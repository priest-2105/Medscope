export const colors = {
  // Brand
  drug: {
    primary: '#1565C0',
    light: '#1976D2',
    dark: '#0D47A1',
    surface: '#E3F2FD',
    text: '#1565C0',
  },
  symptom: {
    primary: '#C62828',
    light: '#E53935',
    dark: '#B71C1C',
    surface: '#FFEBEE',
    text: '#C62828',
  },
  disease: {
    primary: '#2E7D32',
    light: '#388E3C',
    dark: '#1B5E20',
    surface: '#E8F5E9',
    text: '#2E7D32',
  },

  // Urgency
  urgency: {
    low: '#2E7D32',
    medium: '#E65100',
    high: '#C62828',
    emergency: '#B71C1C',
  },
  urgencySurface: {
    low: '#E8F5E9',
    medium: '#FFF3E0',
    high: '#FFEBEE',
    emergency: '#FCE4EC',
  },

  // Neutral
  background: '#F5F7FF',
  surface: '#FFFFFF',
  surfaceVariant: '#F0F4FF',
  border: '#E0E8F8',
  divider: '#EEF2F8',

  // Text
  textPrimary: '#1A2040',
  textSecondary: '#5A6380',
  textMuted: '#9FA8C0',
  textInverse: '#FFFFFF',

  // Status
  warning: '#E65100',
  success: '#2E7D32',
  error: '#C62828',
  info: '#1565C0',

  // Misc
  shadow: 'rgba(26, 50, 130, 0.10)',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  full: 9999,
};

export const shadow = {
  sm: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const typography = {
  h1: { fontSize: 28, fontWeight: '700', lineHeight: 36, letterSpacing: -0.5 },
  h2: { fontSize: 22, fontWeight: '700', lineHeight: 30, letterSpacing: -0.3 },
  h3: { fontSize: 18, fontWeight: '600', lineHeight: 26 },
  h4: { fontSize: 16, fontWeight: '600', lineHeight: 24 },
  body: { fontSize: 15, fontWeight: '400', lineHeight: 22 },
  bodySmall: { fontSize: 13, fontWeight: '400', lineHeight: 20 },
  caption: { fontSize: 11, fontWeight: '500', lineHeight: 16 },
  label: { fontSize: 12, fontWeight: '600', lineHeight: 18, letterSpacing: 0.4 },
  overline: { fontSize: 10, fontWeight: '700', lineHeight: 14, letterSpacing: 1.2 },
};
