import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '../theme/theme';

/**
 * DisclaimerBanner
 * Prominent legal/safety disclaimer shown throughout the app.
 * variant: 'compact' | 'full' | 'emergency'
 */
export default function DisclaimerBanner({ variant = 'compact', style }) {
  const [expanded, setExpanded] = useState(false);

  if (variant === 'emergency') {
    return (
      <View style={[styles.emergencyBanner, style]}>
        <MaterialCommunityIcons name="phone-alert" size={20} color="#FFFFFF" />
        <View style={styles.emergencyText}>
          <Text style={styles.emergencyTitle}>EMERGENCY? CALL 911</Text>
          <Text style={styles.emergencyBody}>
            If you have severe symptoms, chest pain, difficulty breathing, or believe you have a life-threatening emergency, call emergency services immediately. Do not rely on this app.
          </Text>
        </View>
      </View>
    );
  }

  if (variant === 'full') {
    return (
      <View style={[styles.fullBanner, style]}>
        <View style={styles.fullHeader}>
          <MaterialCommunityIcons name="information" size={18} color={colors.info} />
          <Text style={styles.fullTitle}>Educational Use Only</Text>
        </View>
        <Text style={styles.fullBody}>
          MedScope provides general health information for educational purposes only. This app does NOT provide medical advice, diagnosis, or treatment recommendations.{'\n\n'}
          Always consult a qualified healthcare professional for medical advice, diagnosis, and treatment. Never disregard professional medical advice or delay seeking it because of information you read here.{'\n\n'}
          In case of a medical emergency, call 911 or your local emergency services immediately.
        </Text>
      </View>
    );
  }

  // compact (default)
  return (
    <TouchableOpacity
      style={[styles.compactBanner, style]}
      onPress={() => setExpanded(!expanded)}
      activeOpacity={0.8}
    >
      <View style={styles.compactRow}>
        <MaterialCommunityIcons name="shield-alert" size={15} color={colors.warning} />
        <Text style={styles.compactText}>
          For educational purposes only — not medical advice
        </Text>
        <MaterialCommunityIcons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={colors.textMuted}
        />
      </View>
      {expanded && (
        <Text style={styles.compactExpanded}>
          Always consult a qualified healthcare professional. Call 911 for emergencies.
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Emergency
  emergencyBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#C62828',
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  emergencyText: {
    flex: 1,
  },
  emergencyTitle: {
    ...typography.label,
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: 0.8,
  },
  emergencyBody: {
    ...typography.bodySmall,
    color: 'rgba(255,255,255,0.92)',
    lineHeight: 18,
  },

  // Full
  fullBanner: {
    backgroundColor: '#EEF3FF',
    borderRadius: radius.md,
    padding: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.info,
  },
  fullHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  fullTitle: {
    ...typography.label,
    color: colors.info,
    textTransform: 'uppercase',
  },
  fullBody: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
  },

  // Compact
  compactBanner: {
    backgroundColor: '#FFF8E1',
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.warning,
  },
  compactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  compactText: {
    ...typography.caption,
    color: colors.warning,
    flex: 1,
  },
  compactExpanded: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 6,
    lineHeight: 16,
  },
});
