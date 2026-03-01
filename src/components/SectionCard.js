import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, radius, shadow, typography } from '../theme/theme';

/**
 * SectionCard – collapsible card for drug/disease detail sections.
 */
export default function SectionCard({
  title,
  icon,
  iconColor,
  children,
  defaultExpanded = true,
  accentColor,
  style,
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const accent = accentColor || colors.drug.primary;

  return (
    <View style={[styles.card, style]}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconBadge, { backgroundColor: accent + '18' }]}>
          <MaterialCommunityIcons name={icon || 'text'} size={18} color={accent} />
        </View>
        <Text style={[styles.title, { color: accent }]}>{title}</Text>
        <MaterialCommunityIcons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={colors.textMuted}
        />
      </TouchableOpacity>
      {expanded && <View style={styles.body}>{children}</View>}
    </View>
  );
}

export function InfoRow({ label, value, style }) {
  if (!value) return null;
  return (
    <View style={[styles.infoRow, style]}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

export function BulletList({ items, color }) {
  if (!items?.length) return null;
  return (
    <View style={styles.bulletList}>
      {items.map((item, i) => (
        <View key={i} style={styles.bulletRow}>
          <View style={[styles.bullet, { backgroundColor: color || colors.drug.primary }]} />
          <Text style={styles.bulletText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

export function BodyText({ text, style }) {
  if (!text?.trim()) return null;
  return <Text style={[styles.bodyText, style]}>{text.trim()}</Text>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
    ...shadow.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.sm,
  },
  iconBadge: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.h4,
    flex: 1,
  },
  body: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  // InfoRow
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: spacing.xs + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  infoLabel: {
    ...typography.label,
    color: colors.textMuted,
    flex: 1,
  },
  infoValue: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    flex: 2,
    textAlign: 'right',
  },
  // BulletList
  bulletList: {
    gap: spacing.xs,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingVertical: 2,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 7,
  },
  bulletText: {
    ...typography.body,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 22,
  },
  // BodyText
  bodyText: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 24,
  },
});
