import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../theme/theme';

export default function LoadingSpinner({ message = 'Loading...', color, size = 'large', style }) {
  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size={size} color={color || colors.drug.primary} />
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  message: {
    ...typography.bodySmall,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
