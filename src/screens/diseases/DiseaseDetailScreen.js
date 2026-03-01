import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  StatusBar, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { enrichDiseaseData } from '../../services/diseaseService';
import SectionCard, { BulletList, BodyText } from '../../components/SectionCard';
import DisclaimerBanner from '../../components/DisclaimerBanner';
import { colors, spacing, radius, shadow, typography } from '../../theme/theme';

export default function DiseaseDetailScreen({ route, navigation }) {
  const { disease } = route.params;
  const [enriched, setEnriched] = useState(null);

  useEffect(() => {
    const data = enrichDiseaseData(disease.title);
    setEnriched(data);
  }, [disease.title]);

  const openSource = () => {
    if (disease.url) Linking.openURL(disease.url);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.disease.dark} />

      {/* Header */}
      <LinearGradient colors={[colors.disease.dark, colors.disease.light]} style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerBadge}>
          <MaterialCommunityIcons name="book-open-variant" size={14} color={colors.disease.light} />
          <Text style={styles.headerBadgeText}>NIH MedlinePlus</Text>
        </View>
        <Text style={styles.diseaseTitle}>{disease.title}</Text>
        {disease.organization && (
          <Text style={styles.orgText}>{disease.organization}</Text>
        )}
      </LinearGradient>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        <DisclaimerBanner variant="compact" />

        {/* API Summary */}
        {disease.summary ? (
          <SectionCard title="Overview" icon="text-box-outline" accentColor={colors.disease.primary}>
            <BodyText text={disease.summary} />
          </SectionCard>
        ) : null}

        {/* Enriched local data */}
        {enriched && (
          <>
            {!disease.summary && enriched.overview && (
              <SectionCard title="Overview" icon="text-box-outline" accentColor={colors.disease.primary}>
                <BodyText text={enriched.overview} />
              </SectionCard>
            )}

            {enriched.symptoms?.length > 0 && (
              <SectionCard title="Common Symptoms" icon="thermometer" accentColor={colors.symptom.primary}>
                <BulletList items={enriched.symptoms} color={colors.symptom.primary} />
                <TouchableOpacity
                  style={styles.checkSymptomsBtn}
                  onPress={() => navigation.navigate('Symptoms', { screen: 'SymptomChecker' })}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons name="stethoscope" size={15} color={colors.symptom.primary} />
                  <Text style={styles.checkSymptomsText}>Check these symptoms</Text>
                </TouchableOpacity>
              </SectionCard>
            )}

            {enriched.causes?.length > 0 && (
              <SectionCard title="Causes" icon="magnify" accentColor={colors.disease.primary} defaultExpanded={false}>
                <BulletList items={enriched.causes} color={colors.disease.primary} />
              </SectionCard>
            )}

            {enriched.riskFactors?.length > 0 && (
              <SectionCard title="Risk Factors" icon="account-alert" accentColor="#E65100" defaultExpanded={false}>
                <BulletList items={enriched.riskFactors} color="#E65100" />
              </SectionCard>
            )}

            {enriched.treatments?.length > 0 && (
              <SectionCard title="Treatment Options" icon="medical-bag" accentColor={colors.drug.primary} defaultExpanded={false}>
                <Text style={styles.treatmentNote}>
                  For informational purposes only. Treatment should be prescribed by a healthcare professional.
                </Text>
                <BulletList items={enriched.treatments} color={colors.drug.primary} />
              </SectionCard>
            )}

            {enriched.prevention?.length > 0 && (
              <SectionCard title="Prevention" icon="shield-check" accentColor={colors.disease.primary} defaultExpanded={false}>
                <BulletList items={enriched.prevention} color={colors.disease.primary} />
              </SectionCard>
            )}

            {enriched.relatedDrugs?.length > 0 && (
              <SectionCard title="Commonly Used Medications" icon="pill" accentColor={colors.drug.primary} defaultExpanded={false}>
                <Text style={styles.drugNote}>
                  These are informational only. Never start, stop, or change medication without consulting your doctor.
                </Text>
                <View style={styles.drugChips}>
                  {enriched.relatedDrugs.map((drug, i) => (
                    <TouchableOpacity
                      key={i}
                      style={styles.drugChip}
                      onPress={() => navigation.navigate('Drugs', {
                        screen: 'DrugSearch',
                        params: { initialQuery: drug },
                      })}
                      activeOpacity={0.8}
                    >
                      <MaterialCommunityIcons name="pill" size={13} color={colors.drug.primary} />
                      <Text style={styles.drugChipText}>{drug}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </SectionCard>
            )}
          </>
        )}

        {/* No enriched data fallback */}
        {!enriched && !disease.summary && (
          <View style={styles.noEnriched}>
            <MaterialCommunityIcons name="information-outline" size={36} color={colors.textMuted} />
            <Text style={styles.noEnrichedTitle}>Limited data available</Text>
            <Text style={styles.noEnrichedBody}>
              Visit the NIH MedlinePlus page for comprehensive information.
            </Text>
          </View>
        )}

        {/* Source / External Link */}
        {disease.url && (
          <TouchableOpacity style={styles.sourceBtn} onPress={openSource} activeOpacity={0.8}>
            <MaterialCommunityIcons name="open-in-new" size={16} color={colors.disease.primary} />
            <Text style={styles.sourceBtnText}>View Full Article on NIH MedlinePlus</Text>
          </TouchableOpacity>
        )}

        {/* Full disclaimer */}
        <DisclaimerBanner variant="full" style={{ marginBottom: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.disease.dark },
  header: { paddingTop: 8, paddingHorizontal: spacing.md, paddingBottom: spacing.lg },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm,
  },
  headerBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignSelf: 'flex-start',
    borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 3,
    marginBottom: spacing.xs,
  },
  headerBadgeText: { fontSize: 11, fontWeight: '700', color: '#FFFFFF' },
  diseaseTitle: { ...typography.h2, color: '#FFFFFF', lineHeight: 32 },
  orgText: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 4 },

  scroll: { flex: 1 },
  content: { padding: spacing.md, gap: spacing.sm, paddingBottom: spacing.xxl },

  // Inline elements
  checkSymptomsBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: colors.symptom.surface,
    alignSelf: 'flex-start',
    borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: 6,
    marginTop: spacing.md,
  },
  checkSymptomsText: { ...typography.caption, color: colors.symptom.primary, fontWeight: '700' },
  treatmentNote: {
    ...typography.caption, color: '#E65100',
    backgroundColor: '#FFF3E0',
    borderRadius: radius.sm, padding: spacing.sm,
    marginBottom: spacing.sm, lineHeight: 16,
  },
  drugNote: {
    ...typography.caption, color: colors.textMuted,
    lineHeight: 16, marginBottom: spacing.sm,
  },
  drugChips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  drugChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: colors.drug.surface,
    borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: 6,
    borderWidth: 1, borderColor: colors.drug.primary + '30',
  },
  drugChipText: { ...typography.caption, color: colors.drug.primary, fontWeight: '700' },

  // No enriched
  noEnriched: {
    alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg, padding: spacing.xl,
    ...shadow.sm,
  },
  noEnrichedTitle: { ...typography.h4, color: colors.textPrimary },
  noEnrichedBody: { ...typography.bodySmall, color: colors.textSecondary, textAlign: 'center' },

  // Source button
  sourceBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    backgroundColor: colors.disease.surface,
    borderRadius: radius.lg, padding: spacing.md,
    borderWidth: 1, borderColor: colors.disease.primary + '30',
  },
  sourceBtnText: { ...typography.label, color: colors.disease.primary, fontSize: 14 },
});
