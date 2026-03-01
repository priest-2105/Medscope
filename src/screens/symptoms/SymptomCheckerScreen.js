import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SYMPTOM_CATEGORIES, SYMPTOMS, getSymptomsByCategory } from '../../services/symptomService';
import DisclaimerBanner from '../../components/DisclaimerBanner';
import { colors, spacing, radius, shadow, typography } from '../../theme/theme';

export default function SymptomCheckerScreen({ navigation }) {
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [expandedCategory, setExpandedCategory] = useState('general');

  const toggleSymptom = (symptomId) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptomId)
        ? prev.filter((id) => id !== symptomId)
        : [...prev, symptomId]
    );
  };

  const isSelected = (id) => selectedSymptoms.includes(id);

  const handleAnalyze = () => {
    if (selectedSymptoms.length === 0) return;
    navigation.navigate('SymptomResult', { selectedSymptomIds: selectedSymptoms });
  };

  const clearAll = () => setSelectedSymptoms([]);

  const selectedNames = selectedSymptoms
    .map((id) => SYMPTOMS.find((s) => s.id === id)?.name)
    .filter(Boolean);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.symptom.dark} />

      {/* Header */}
      <LinearGradient colors={[colors.symptom.dark, colors.symptom.light]} style={styles.header}>
        <View style={styles.appNameRow}>
          <MaterialCommunityIcons name="stethoscope" size={14} color="rgba(255,255,255,0.7)" />
          <Text style={styles.appName}>MedScope</Text>
        </View>
        <Text style={styles.headerTitle}>Symptom Checker</Text>
        <Text style={styles.headerSub}>Select your symptoms for a possible condition overview</Text>
      </LinearGradient>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Emergency Banner */}
        <View style={styles.section}>
          <DisclaimerBanner variant="emergency" />
        </View>

        {/* Educational disclaimer */}
        <View style={styles.section}>
          <DisclaimerBanner variant="compact" />
        </View>

        {/* Category Accordion */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>SELECT SYMPTOMS BY BODY SYSTEM</Text>
          {SYMPTOM_CATEGORIES.map((cat) => {
            const categorySymptoms = getSymptomsByCategory(cat.id);
            const selectedInCategory = categorySymptoms.filter((s) => isSelected(s.id)).length;
            const isOpen = expandedCategory === cat.id;

            return (
              <View key={cat.id} style={styles.categoryCard}>
                <TouchableOpacity
                  style={styles.categoryHeader}
                  onPress={() => setExpandedCategory(isOpen ? null : cat.id)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.categoryIcon, { backgroundColor: cat.color + '18' }]}>
                    <MaterialCommunityIcons name={cat.icon} size={20} color={cat.color} />
                  </View>
                  <Text style={[styles.categoryLabel, { color: cat.color }]}>{cat.label}</Text>
                  {selectedInCategory > 0 && (
                    <View style={[styles.countBadge, { backgroundColor: cat.color }]}>
                      <Text style={styles.countBadgeText}>{selectedInCategory}</Text>
                    </View>
                  )}
                  <MaterialCommunityIcons
                    name={isOpen ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={colors.textMuted}
                  />
                </TouchableOpacity>

                {isOpen && (
                  <View style={styles.symptomGrid}>
                    {categorySymptoms.map((symptom) => {
                      const selected = isSelected(symptom.id);
                      return (
                        <TouchableOpacity
                          key={symptom.id}
                          style={[
                            styles.symptomChip,
                            selected && { backgroundColor: colors.symptom.primary, borderColor: colors.symptom.primary },
                          ]}
                          onPress={() => toggleSymptom(symptom.id)}
                          activeOpacity={0.8}
                        >
                          {selected && (
                            <MaterialCommunityIcons name="check" size={13} color="#FFFFFF" />
                          )}
                          <Text style={[styles.symptomChipText, selected && { color: '#FFFFFF' }]}>
                            {symptom.name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Selected Symptoms Summary */}
        {selectedSymptoms.length > 0 && (
          <View style={styles.section}>
            <View style={styles.selectedSummary}>
              <View style={styles.selectedHeader}>
                <Text style={styles.selectedTitle}>
                  {selectedSymptoms.length} symptom{selectedSymptoms.length !== 1 ? 's' : ''} selected
                </Text>
                <TouchableOpacity onPress={clearAll}>
                  <Text style={styles.clearText}>Clear all</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.selectedChips}>
                {selectedNames.map((name, i) => (
                  <View key={i} style={styles.selectedChip}>
                    <Text style={styles.selectedChipText}>{name}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Analyze Button */}
        <View style={[styles.section, { paddingBottom: spacing.xxl }]}>
          <TouchableOpacity
            style={[styles.analyzeBtn, selectedSymptoms.length === 0 && styles.analyzeBtnDisabled]}
            onPress={handleAnalyze}
            disabled={selectedSymptoms.length === 0}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={selectedSymptoms.length > 0
                ? [colors.symptom.dark, colors.symptom.light]
                : ['#CCCCCC', '#AAAAAA']}
              style={styles.analyzeBtnGradient}
            >
              <MaterialCommunityIcons name="magnify-scan" size={22} color="#FFFFFF" />
              <Text style={styles.analyzeBtnText}>
                {selectedSymptoms.length === 0
                  ? 'Select at least one symptom'
                  : `Analyze ${selectedSymptoms.length} Symptom${selectedSymptoms.length !== 1 ? 's' : ''}`}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
          <Text style={styles.analyzeNote}>
            Results are educational only. Not a substitute for professional diagnosis.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.symptom.dark },
  header: {
    paddingTop: 8,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
  },
  appNameRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 },
  appName: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.7)' },
  headerTitle: { ...typography.h2, color: '#FFFFFF' },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4, lineHeight: 18 },
  scroll: { flex: 1 },
  section: { paddingHorizontal: spacing.md, paddingTop: spacing.md },
  sectionLabel: { ...typography.overline, color: colors.textMuted, marginBottom: spacing.sm },

  // Category
  categoryCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    marginBottom: spacing.sm,
    overflow: 'hidden',
    ...shadow.sm,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.sm,
  },
  categoryIcon: {
    width: 36, height: 36,
    borderRadius: radius.sm,
    alignItems: 'center', justifyContent: 'center',
  },
  categoryLabel: { ...typography.h4, flex: 1 },
  countBadge: {
    minWidth: 22, height: 22,
    borderRadius: 11,
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 6,
  },
  countBadgeText: { fontSize: 11, fontWeight: '700', color: '#FFFFFF' },

  // Symptom Grid
  symptomGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  symptomChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderWidth: 1.5, borderColor: colors.border,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2,
    backgroundColor: colors.surface,
  },
  symptomChipText: { ...typography.bodySmall, color: colors.textSecondary, fontWeight: '500' },

  // Selected Summary
  selectedSummary: {
    backgroundColor: '#FFF5F5',
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1, borderColor: colors.symptom.primary + '30',
  },
  selectedHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: spacing.sm,
  },
  selectedTitle: { ...typography.h4, color: colors.symptom.primary },
  clearText: { ...typography.label, color: colors.textMuted },
  selectedChips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  selectedChip: {
    backgroundColor: colors.symptom.surface,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm, paddingVertical: 3,
  },
  selectedChipText: { ...typography.caption, color: colors.symptom.text, fontWeight: '600' },

  // Analyze Button
  analyzeBtn: { borderRadius: radius.xl, overflow: 'hidden', ...shadow.md },
  analyzeBtnDisabled: { opacity: 0.7 },
  analyzeBtnGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing.sm, paddingVertical: spacing.md + 2,
  },
  analyzeBtnText: { ...typography.h4, color: '#FFFFFF' },
  analyzeNote: {
    ...typography.caption, color: colors.textMuted,
    textAlign: 'center', marginTop: spacing.sm,
  },
});
