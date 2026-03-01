import React, { useMemo, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  StatusBar, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { analyzeSymptoms, SYMPTOMS } from '../../services/symptomService';
import { saveSymptomCheck } from '../../storage/symptomHistory';
import DisclaimerBanner from '../../components/DisclaimerBanner';
import { colors, spacing, radius, shadow, typography } from '../../theme/theme';

const URGENCY_CONFIG = {
  low: {
    label: 'Low Urgency',
    icon: 'check-circle',
    color: colors.urgency.low,
    surface: colors.urgencySurface.low,
    description: 'Symptoms suggest a non-emergency condition. Monitor symptoms and see a doctor if they persist or worsen.',
  },
  medium: {
    label: 'Medium Urgency',
    icon: 'alert-circle',
    color: colors.urgency.medium,
    surface: colors.urgencySurface.medium,
    description: 'Consider scheduling a doctor\'s appointment soon. If symptoms worsen, seek care promptly.',
  },
  high: {
    label: 'High Urgency',
    icon: 'alert-octagon',
    color: colors.urgency.high,
    surface: colors.urgencySurface.high,
    description: 'Please seek medical attention today. Do not delay care if symptoms are severe.',
  },
  emergency: {
    label: 'POSSIBLE EMERGENCY',
    icon: 'ambulance',
    color: colors.urgency.emergency,
    surface: colors.urgencySurface.emergency,
    description: 'Based on your symptoms, seek emergency care immediately. Call 911 or go to the nearest emergency room.',
  },
};

export default function SymptomResultScreen({ route, navigation }) {
  const { selectedSymptomIds } = route.params;

  const { conditions, overallUrgency } = useMemo(
    () => analyzeSymptoms(selectedSymptomIds),
    [selectedSymptomIds]
  );

  const urgencyConfig = URGENCY_CONFIG[overallUrgency] || URGENCY_CONFIG.low;

  const selectedSymptomNames = selectedSymptomIds
    .map((id) => SYMPTOMS.find((s) => s.id === id)?.name)
    .filter(Boolean);

  useEffect(() => {
    saveSymptomCheck({
      symptoms: selectedSymptomNames,
      topCondition: conditions[0]?.name || null,
      urgency: overallUrgency,
      conditionCount: conditions.length,
    });
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.symptom.dark} />

      {/* Header */}
      <LinearGradient colors={[colors.symptom.dark, colors.symptom.light]} style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Symptom Analysis</Text>
        <Text style={styles.headerSub}>
          {selectedSymptomIds.length} symptom{selectedSymptomIds.length !== 1 ? 's' : ''} analyzed
        </Text>
      </LinearGradient>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Emergency Banner — always shown */}
        <DisclaimerBanner variant="emergency" />

        {/* Urgency Banner */}
        <View style={[styles.urgencyBanner, { backgroundColor: urgencyConfig.surface, borderColor: urgencyConfig.color + '40' }]}>
          <View style={[styles.urgencyIcon, { backgroundColor: urgencyConfig.color }]}>
            <MaterialCommunityIcons name={urgencyConfig.icon} size={24} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.urgencyLabel, { color: urgencyConfig.color }]}>{urgencyConfig.label}</Text>
            <Text style={styles.urgencyDesc}>{urgencyConfig.description}</Text>
          </View>
        </View>

        {/* Educational disclaimer */}
        <DisclaimerBanner variant="compact" />

        {/* Analyzed Symptoms */}
        <View style={styles.analyzedSection}>
          <Text style={styles.sectionLabel}>ANALYZED SYMPTOMS</Text>
          <View style={styles.chipRow}>
            {selectedSymptomNames.map((name, i) => (
              <View key={i} style={styles.symptomChip}>
                <Text style={styles.symptomChipText}>{name}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Possible Conditions */}
        <View>
          <Text style={styles.sectionLabel}>POSSIBLE CONDITIONS</Text>
          <Text style={styles.sectionNote}>
            Listed by likelihood based on your symptoms. "Possible" does not mean "diagnosed."
          </Text>

          {conditions.length === 0 ? (
            <View style={styles.noMatch}>
              <MaterialCommunityIcons name="magnify-close" size={40} color={colors.textMuted} />
              <Text style={styles.noMatchTitle}>No strong matches found</Text>
              <Text style={styles.noMatchBody}>
                Try selecting more symptoms for a better analysis, or consult a healthcare professional.
              </Text>
            </View>
          ) : (
            conditions.map((condition, i) => (
              <ConditionCard
                key={condition.id}
                condition={condition}
                rank={i + 1}
                onLearnMore={() =>
                  navigation.navigate('Diseases', {
                    screen: 'DiseaseSearch',
                    params: { initialQuery: condition.relatedDisease || condition.name },
                  })
                }
              />
            ))
          )}
        </View>

        {/* When to Seek Emergency Care */}
        <View style={styles.emergencySection}>
          <Text style={styles.sectionLabel}>EMERGENCY WARNING SIGNS</Text>
          <Text style={styles.emergencySubtitle}>
            Call 911 immediately if you experience any of these:
          </Text>
          {[
            'Difficulty breathing or shortness of breath',
            'Persistent chest pain or pressure',
            'Sudden confusion or altered consciousness',
            'Fainting or loss of consciousness',
            'Bluish lips or fingertips',
            'Severe or sudden severe headache',
            'Sudden weakness or numbness on one side of body',
          ].map((sign, i) => (
            <View key={i} style={styles.emergencyRow}>
              <MaterialCommunityIcons name="alert-circle" size={16} color="#C62828" />
              <Text style={styles.emergencySign}>{sign}</Text>
            </View>
          ))}
          <TouchableOpacity style={styles.call911Btn} activeOpacity={0.8} onPress={() => Linking.openURL('tel:911')}>
            <MaterialCommunityIcons name="phone" size={20} color="#FFFFFF" />
            <Text style={styles.call911Text}>Call 911 in an Emergency</Text>
          </TouchableOpacity>
        </View>

        {/* Footer disclaimer */}
        <DisclaimerBanner variant="full" style={{ marginBottom: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function ConditionCard({ condition, rank, onLearnMore }) {
  const urgencyConfig = URGENCY_CONFIG[condition.urgency] || URGENCY_CONFIG.low;

  return (
    <View style={styles.conditionCard}>
      {/* Probability bar */}
      <View style={styles.conditionHeader}>
        <View style={styles.rankBadge}>
          <Text style={styles.rankText}>#{rank}</Text>
        </View>
        <Text style={styles.conditionName}>{condition.name}</Text>
        <Text style={[styles.probabilityText, { color: urgencyConfig.color }]}>
          ~{condition.probability}%
        </Text>
      </View>

      {/* Probability Bar */}
      <View style={styles.progressBg}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${condition.probability}%`,
              backgroundColor: urgencyConfig.color,
            },
          ]}
        />
      </View>

      <View style={styles.conditionMeta}>
        <View style={[styles.urgencyTag, { backgroundColor: urgencyConfig.surface }]}>
          <MaterialCommunityIcons name={urgencyConfig.icon} size={12} color={urgencyConfig.color} />
          <Text style={[styles.urgencyTagText, { color: urgencyConfig.color }]}>
            {condition.urgency.charAt(0).toUpperCase() + condition.urgency.slice(1)} urgency
          </Text>
        </View>
        <Text style={styles.categoryTag}>{condition.category}</Text>
      </View>

      {/* Overview */}
      <Text style={styles.conditionOverview} numberOfLines={3}>
        {condition.overview}
      </Text>

      {/* Matched symptoms */}
      {condition.matchedSymptoms?.length > 0 && (
        <View style={styles.matchedSection}>
          <Text style={styles.matchedLabel}>Matching symptoms:</Text>
          <Text style={styles.matchedSymptoms}>
            {condition.matchedSymptoms.join(' · ')}
          </Text>
        </View>
      )}

      {/* When to see doctor */}
      <View style={styles.doctorBox}>
        <MaterialCommunityIcons name="doctor" size={15} color={colors.textSecondary} />
        <Text style={styles.doctorText}>{condition.whenToSeeDoctor}</Text>
      </View>

      {/* Emergency warnings for this condition */}
      {condition.emergencyWarnings?.length > 0 && (
        <View style={styles.conditionWarnings}>
          <Text style={styles.conditionWarningLabel}>Emergency signs:</Text>
          {condition.emergencyWarnings.map((w, i) => (
            <View key={i} style={styles.conditionWarningRow}>
              <MaterialCommunityIcons name="alert" size={13} color="#C62828" />
              <Text style={styles.conditionWarning}>{w}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Actions */}
      <View style={styles.conditionActions}>
        <TouchableOpacity style={styles.learnMoreBtn} onPress={onLearnMore} activeOpacity={0.8}>
          <MaterialCommunityIcons name="book-open-outline" size={15} color={colors.disease.primary} />
          <Text style={styles.learnMoreText}>Learn More</Text>
        </TouchableOpacity>
        {condition.relatedDrugs?.length > 0 && (
          <View style={styles.relatedDrugsRow}>
            <MaterialCommunityIcons name="pill" size={13} color={colors.textMuted} />
            <Text style={styles.relatedDrugsText} numberOfLines={1}>
              {condition.relatedDrugs.slice(0, 3).join(', ')}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.symptom.dark },
  header: { paddingTop: 8, paddingHorizontal: spacing.md, paddingBottom: spacing.lg },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm,
  },
  headerTitle: { ...typography.h2, color: '#FFFFFF' },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 },

  scroll: { flex: 1 },
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xxl },

  // Urgency Banner
  urgencyBanner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md,
    borderRadius: radius.lg, padding: spacing.md,
    borderWidth: 1.5,
  },
  urgencyIcon: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  urgencyLabel: { ...typography.h4, marginBottom: 4 },
  urgencyDesc: { ...typography.bodySmall, color: colors.textSecondary, lineHeight: 20 },

  sectionLabel: { ...typography.overline, color: colors.textMuted, marginBottom: spacing.xs },
  sectionNote: { ...typography.caption, color: colors.textMuted, marginBottom: spacing.md, lineHeight: 16 },

  // Analyzed symptoms
  analyzedSection: { gap: spacing.xs },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  symptomChip: {
    backgroundColor: colors.symptom.surface,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm, paddingVertical: 3,
  },
  symptomChipText: { ...typography.caption, color: colors.symptom.text, fontWeight: '600' },

  // Condition Card
  conditionCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadow.sm,
  },
  conditionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm,
  },
  rankBadge: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: colors.surfaceVariant,
    alignItems: 'center', justifyContent: 'center',
  },
  rankText: { ...typography.caption, fontWeight: '700', color: colors.textSecondary },
  conditionName: { ...typography.h4, color: colors.textPrimary, flex: 1 },
  probabilityText: { ...typography.h4 },
  progressBg: {
    height: 6, backgroundColor: colors.border,
    borderRadius: 3, overflow: 'hidden', marginBottom: spacing.sm,
  },
  progressFill: { height: '100%', borderRadius: 3 },
  conditionMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  urgencyTag: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 2,
  },
  urgencyTagText: { ...typography.caption, fontWeight: '700' },
  categoryTag: { ...typography.caption, color: colors.textMuted },
  conditionOverview: { ...typography.bodySmall, color: colors.textSecondary, lineHeight: 20, marginBottom: spacing.sm },
  matchedSection: { marginBottom: spacing.sm },
  matchedLabel: { ...typography.caption, color: colors.textMuted, fontWeight: '700' },
  matchedSymptoms: { ...typography.caption, color: colors.textSecondary, lineHeight: 18, marginTop: 2 },
  doctorBox: {
    flexDirection: 'row', gap: spacing.xs, alignItems: 'flex-start',
    backgroundColor: colors.surfaceVariant,
    borderRadius: radius.md, padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  doctorText: { ...typography.caption, color: colors.textSecondary, flex: 1, lineHeight: 18 },
  conditionWarnings: { marginBottom: spacing.sm },
  conditionWarningLabel: { ...typography.caption, color: '#C62828', fontWeight: '700', marginBottom: 4 },
  conditionWarningRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 5, marginBottom: 2 },
  conditionWarning: { ...typography.caption, color: colors.textSecondary, lineHeight: 18, flex: 1 },
  conditionActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  learnMoreBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.disease.surface,
    borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: 6,
  },
  learnMoreText: { ...typography.caption, color: colors.disease.primary, fontWeight: '700' },
  relatedDrugsRow: { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1, marginLeft: spacing.sm },
  relatedDrugsText: { ...typography.caption, color: colors.textMuted, flex: 1 },

  // Emergency Section
  emergencySection: {
    backgroundColor: '#FFF5F5',
    borderRadius: radius.lg, padding: spacing.md,
    borderWidth: 1.5, borderColor: '#FFCDD2',
    gap: spacing.sm,
  },
  emergencySubtitle: { ...typography.bodySmall, color: colors.textSecondary },
  emergencyRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  emergencySign: { ...typography.bodySmall, color: colors.textPrimary, flex: 1, lineHeight: 20 },
  call911Btn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    backgroundColor: '#C62828',
    borderRadius: radius.md, paddingVertical: spacing.md,
    marginTop: spacing.xs,
  },
  call911Text: { ...typography.h4, color: '#FFFFFF' },

  // No match
  noMatch: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xl },
  noMatchTitle: { ...typography.h3, color: colors.textPrimary },
  noMatchBody: { ...typography.body, color: colors.textSecondary, textAlign: 'center', lineHeight: 22 },
});
