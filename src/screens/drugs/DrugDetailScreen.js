import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  StatusBar, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getDrugRecalls } from '../../services/openFDAService';
import { saveMedication, removeMedication, isMedicationSaved } from '../../storage/savedMedications';
import SectionCard, { BodyText, BulletList } from '../../components/SectionCard';
import DisclaimerBanner from '../../components/DisclaimerBanner';
import { colors, spacing, radius, shadow, typography } from '../../theme/theme';

const TABS = ['Overview', 'Dosage', 'Warnings', 'Side Effects'];

export default function DrugDetailScreen({ route, navigation }) {
  const { drug } = route.params;
  const [activeTab, setActiveTab] = useState('Overview');
  const [saved, setSaved] = useState(false);
  const [recalls, setRecalls] = useState([]);

  const displayName = drug.brandName || drug.genericName || 'Unknown Drug';

  useEffect(() => {
    isMedicationSaved(drug).then(setSaved);
    getDrugRecalls(drug.brandName || drug.genericName).then(({ data }) =>
      setRecalls(data || [])
    );
  }, []);

  const handleSaveToggle = async () => {
    if (saved) {
      const id = drug.id || drug.brandName || drug.genericName;
      await removeMedication(id);
      setSaved(false);
    } else {
      await saveMedication(drug.raw || drug);
      setSaved(true);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Overview':
        return (
          <>
            {drug.purpose && (
              <SectionCard title="Purpose" icon="target" accentColor={colors.drug.primary}>
                <BodyText text={drug.purpose} />
              </SectionCard>
            )}
            {drug.uses && (
              <SectionCard title="Uses & Indications" icon="check-circle-outline" accentColor={colors.drug.primary}>
                <BodyText text={drug.uses} />
              </SectionCard>
            )}
            {drug.activeIngredients && (
              <SectionCard title="Active Ingredients" icon="flask-outline" accentColor={colors.drug.primary} defaultExpanded={false}>
                <BodyText text={drug.activeIngredients} />
              </SectionCard>
            )}
            {drug.contraindications && (
              <SectionCard title="Contraindications" icon="cancel" accentColor={colors.symptom.primary} defaultExpanded={false}>
                <BodyText text={drug.contraindications} />
              </SectionCard>
            )}
          </>
        );
      case 'Dosage':
        return (
          <>
            {drug.dosage ? (
              <SectionCard title="Dosage & Administration" icon="medical-bag" accentColor={colors.drug.primary}>
                <BodyText text={drug.dosage} />
              </SectionCard>
            ) : (
              <NoDataMessage message="Dosage information not available for this drug." />
            )}
            {drug.overdosage && (
              <SectionCard title="Overdosage Information" icon="alert-octagon-outline" accentColor={colors.symptom.primary} defaultExpanded={false}>
                <BodyText text={drug.overdosage} />
              </SectionCard>
            )}
            {drug.storageHandling && (
              <SectionCard title="Storage & Handling" icon="package-variant-closed" accentColor={colors.disease.primary} defaultExpanded={false}>
                <BodyText text={drug.storageHandling} />
              </SectionCard>
            )}
            {drug.keepOutOfReach && (
              <SectionCard title="Keep Out of Reach of Children" icon="baby-face-outline" accentColor={colors.symptom.primary} defaultExpanded={false}>
                <BodyText text={drug.keepOutOfReach} />
              </SectionCard>
            )}
          </>
        );
      case 'Warnings':
        return (
          <>
            {drug.warnings ? (
              <SectionCard title="Warnings" icon="alert-circle" accentColor={colors.symptom.primary}>
                <BodyText text={drug.warnings} />
              </SectionCard>
            ) : (
              <NoDataMessage message="Warnings not listed for this drug." />
            )}
            {drug.interactions && (
              <SectionCard title="Drug Interactions" icon="swap-horizontal-bold" accentColor="#E65100" defaultExpanded={false}>
                <BodyText text={drug.interactions} />
              </SectionCard>
            )}
            {recalls.length > 0 && (
              <SectionCard title={`Active Recalls (${recalls.length})`} icon="alert-decagram" accentColor="#B71C1C">
                {recalls.map((recall, i) => (
                  <View key={i} style={styles.recallItem}>
                    <Text style={styles.recallTitle}>{recall.product_description}</Text>
                    <Text style={styles.recallReason}>Reason: {recall.reason_for_recall}</Text>
                    <Text style={styles.recallStatus}>Status: {recall.status}</Text>
                    {recall.recall_initiation_date && (
                      <Text style={styles.recallDate}>Date: {recall.recall_initiation_date}</Text>
                    )}
                  </View>
                ))}
              </SectionCard>
            )}
          </>
        );
      case 'Side Effects':
        return (
          <>
            {drug.sideEffects ? (
              <SectionCard title="Adverse Reactions & Side Effects" icon="emoticon-sick-outline" accentColor={colors.symptom.primary}>
                <BodyText text={drug.sideEffects} />
              </SectionCard>
            ) : (
              <NoDataMessage message="Side effect data not available for this drug." />
            )}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.drug.dark} />

      {/* Header */}
      <LinearGradient colors={[colors.drug.dark, colors.drug.light]} style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={22} color="#FFFFFF" />
        </TouchableOpacity>

        {recalls.length > 0 && (
          <View style={styles.recallBadge}>
            <MaterialCommunityIcons name="alert-decagram" size={14} color="#FFFFFF" />
            <Text style={styles.recallBadgeText}>ACTIVE RECALL</Text>
          </View>
        )}

        <Text style={styles.drugName} numberOfLines={2}>{displayName}</Text>
        {drug.genericName && drug.brandName && (
          <Text style={styles.genericName}>{drug.genericName}</Text>
        )}

        {/* Meta pills */}
        <View style={styles.metaPills}>
          {drug.productType && (
            <View style={styles.metaPill}>
              <Text style={styles.metaPillText}>{drug.productType}</Text>
            </View>
          )}
          {drug.route && (
            <View style={styles.metaPill}>
              <MaterialCommunityIcons name="arrow-right-circle-outline" size={12} color="rgba(255,255,255,0.9)" />
              <Text style={styles.metaPillText}>{drug.route}</Text>
            </View>
          )}
          {drug.manufacturer && (
            <View style={styles.metaPill}>
              <MaterialCommunityIcons name="factory" size={12} color="rgba(255,255,255,0.9)" />
              <Text style={styles.metaPillText} numberOfLines={1}>{drug.manufacturer}</Text>
            </View>
          )}
        </View>

        {/* Action buttons */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionBtn} onPress={handleSaveToggle} activeOpacity={0.8}>
            <MaterialCommunityIcons
              name={saved ? 'bookmark' : 'bookmark-outline'}
              size={20}
              color={saved ? '#FFD700' : '#FFFFFF'}
            />
            <Text style={styles.actionBtnText}>{saved ? 'Saved' : 'Save'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate('SavedMedications')}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="scale-balance" size={20} color="#FFFFFF" />
            <Text style={styles.actionBtnText}>Compare</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <DisclaimerBanner variant="compact" style={{ marginBottom: spacing.md }} />
        {renderTabContent()}
        <View style={styles.sourceNote}>
          <MaterialCommunityIcons name="shield-check" size={14} color={colors.textMuted} />
          <Text style={styles.sourceText}>Data from U.S. FDA OpenFDA — For educational use only</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function NoDataMessage({ message }) {
  return (
    <View style={styles.noData}>
      <MaterialCommunityIcons name="information-outline" size={32} color={colors.textMuted} />
      <Text style={styles.noDataText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.drug.dark },
  header: { paddingTop: 8, paddingHorizontal: spacing.md, paddingBottom: spacing.lg },
  backBtn: {
    width: 36, height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  recallBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#B71C1C',
    alignSelf: 'flex-start',
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm, paddingVertical: 3,
    marginBottom: spacing.xs,
  },
  recallBadgeText: { fontSize: 10, fontWeight: '700', color: '#FFFFFF', letterSpacing: 0.6 },
  drugName: { ...typography.h2, color: '#FFFFFF' },
  genericName: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 2, fontStyle: 'italic' },
  metaPills: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.sm },
  metaPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm, paddingVertical: 3,
  },
  metaPillText: { fontSize: 11, color: 'rgba(255,255,255,0.95)', fontWeight: '600' },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  actionBtn: {
    flex: 1,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: radius.md, paddingVertical: spacing.sm + 2,
  },
  actionBtnText: { ...typography.label, color: '#FFFFFF', fontSize: 13 },

  // Tabs
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  tab: {
    flex: 1, paddingVertical: spacing.md,
    alignItems: 'center',
    borderBottomWidth: 2, borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: colors.drug.primary },
  tabText: { ...typography.label, color: colors.textMuted },
  tabTextActive: { color: colors.drug.primary },

  // Content
  scroll: { flex: 1 },
  content: { padding: spacing.md, paddingBottom: spacing.xxl },

  // Recall item
  recallItem: {
    backgroundColor: '#FFF5F5',
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderLeftWidth: 3, borderLeftColor: '#B71C1C',
  },
  recallTitle: { ...typography.h4, color: colors.textPrimary, marginBottom: 4 },
  recallReason: { ...typography.bodySmall, color: colors.textSecondary, lineHeight: 18 },
  recallStatus: { ...typography.caption, color: '#B71C1C', fontWeight: '700', marginTop: 4 },
  recallDate: { ...typography.caption, color: colors.textMuted, marginTop: 2 },

  // No data
  noData: {
    alignItems: 'center', gap: spacing.sm,
    paddingVertical: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: radius.lg, ...shadow.sm,
  },
  noDataText: { ...typography.bodySmall, color: colors.textMuted, textAlign: 'center' },

  // Source
  sourceNote: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    justifyContent: 'center', paddingTop: spacing.md,
  },
  sourceText: { ...typography.caption, color: colors.textMuted },
});
