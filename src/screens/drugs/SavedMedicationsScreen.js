import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  StatusBar, Alert, Modal, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  getSavedMedications, removeMedication, clearAllMedications,
} from '../../storage/savedMedications';
import { compareDrugs, normalizeDrug } from '../../services/openFDAService';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, radius, shadow, typography } from '../../theme/theme';

export default function SavedMedicationsScreen({ navigation }) {
  const [medications, setMedications] = useState([]);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState([]);
  const [compareResult, setCompareResult] = useState(null);
  const [compareModalVisible, setCompareModalVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      getSavedMedications().then(setMedications);
    }, [])
  );

  const handleRemove = (id, name) => {
    Alert.alert('Remove Medication', `Remove "${name}" from your saved list?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          const updated = await removeMedication(id);
          setMedications(updated);
        },
      },
    ]);
  };

  const handleClearAll = () => {
    Alert.alert('Clear All', 'Remove all saved medications?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear All',
        style: 'destructive',
        onPress: async () => {
          await clearAllMedications();
          setMedications([]);
        },
      },
    ]);
  };

  const toggleCompareSelect = (med) => {
    setSelectedForCompare((prev) => {
      if (prev.find((m) => m.id === med.id)) {
        return prev.filter((m) => m.id !== med.id);
      }
      if (prev.length >= 2) return prev; // max 2
      return [...prev, med];
    });
  };

  const handleCompare = () => {
    if (selectedForCompare.length !== 2) return;
    const [a, b] = selectedForCompare;
    const result = compareDrugs(a.rawData || {}, b.rawData || {});
    setCompareResult({ a, b, fields: result });
    setCompareModalVisible(true);
  };

  const renderMedCard = ({ item }) => {
    const isSelectedForCompare = selectedForCompare.find((m) => m.id === item.id);
    const canSelect = selectedForCompare.length < 2 || isSelectedForCompare;

    return (
      <TouchableOpacity
        style={[
          styles.medCard,
          compareMode && isSelectedForCompare && styles.medCardSelected,
          compareMode && !canSelect && styles.medCardDisabled,
        ]}
        onPress={() =>
          compareMode
            ? (canSelect ? toggleCompareSelect(item) : null)
            : navigation.navigate('DrugDetail', { drug: item.rawData ? normalizeDrug(item.rawData) : item })
        }
        activeOpacity={0.8}
      >
        <View style={styles.medIcon}>
          {compareMode && isSelectedForCompare && (
            <View style={styles.compareCheck}>
              <MaterialCommunityIcons name="check" size={14} color="#FFFFFF" />
            </View>
          )}
          <MaterialCommunityIcons name="pill" size={22} color={colors.drug.primary} />
        </View>
        <View style={styles.medBody}>
          <Text style={styles.medBrand}>{item.brandName || item.genericName}</Text>
          {item.genericName && item.brandName && (
            <Text style={styles.medGeneric}>{item.genericName}</Text>
          )}
          <View style={styles.medMeta}>
            {item.productType && (
              <View style={styles.medPill}>
                <Text style={styles.medPillText}>{item.productType}</Text>
              </View>
            )}
            {item.route && (
              <Text style={styles.medRoute}>{item.route}</Text>
            )}
          </View>
          {item.manufacturer && (
            <Text style={styles.medManufacturer} numberOfLines={1}>{item.manufacturer}</Text>
          )}
        </View>
        {!compareMode && (
          <TouchableOpacity
            onPress={() => handleRemove(item.id, item.brandName || item.genericName)}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
            <MaterialCommunityIcons name="trash-can-outline" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.drug.dark} />

      <LinearGradient colors={[colors.drug.dark, colors.drug.light]} style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>My Medications</Text>
            <Text style={styles.headerSub}>{medications.length} saved medication{medications.length !== 1 ? 's' : ''}</Text>
          </View>
          {medications.length >= 2 && (
            <TouchableOpacity
              style={[styles.compareToggle, compareMode && styles.compareToggleActive]}
              onPress={() => { setCompareMode(!compareMode); setSelectedForCompare([]); }}
            >
              <MaterialCommunityIcons name="scale-balance" size={16} color={compareMode ? '#FFFFFF' : 'rgba(255,255,255,0.8)'} />
              <Text style={styles.compareToggleText}>Compare</Text>
            </TouchableOpacity>
          )}
        </View>
        {compareMode && (
          <View style={styles.compareBar}>
            <Text style={styles.compareBarText}>
              Select 2 medications to compare ({selectedForCompare.length}/2)
            </Text>
            {selectedForCompare.length === 2 && (
              <TouchableOpacity style={styles.compareGoBtn} onPress={handleCompare}>
                <Text style={styles.compareGoBtnText}>Compare Now</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </LinearGradient>

      {medications.length === 0 ? (
        <View style={styles.empty}>
          <MaterialCommunityIcons name="bookmark-off-outline" size={60} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>No saved medications</Text>
          <Text style={styles.emptyBody}>
            Search for a drug and tap "Save" to add it to your medication list.
          </Text>
          <TouchableOpacity
            style={styles.searchBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="magnify" size={18} color="#FFFFFF" />
            <Text style={styles.searchBtnText}>Search Drugs</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={medications}
          keyExtractor={(item) => item.id}
          renderItem={renderMedCard}
          contentContainerStyle={styles.list}
          ListFooterComponent={
            medications.length > 0 ? (
              <TouchableOpacity style={styles.clearBtn} onPress={handleClearAll}>
                <MaterialCommunityIcons name="trash-can-outline" size={16} color={colors.error} />
                <Text style={styles.clearBtnText}>Clear All Medications</Text>
              </TouchableOpacity>
            ) : null
          }
        />
      )}

      {/* Compare Modal */}
      <Modal
        visible={compareModalVisible}
        animationType="slide"
        onRequestClose={() => setCompareModalVisible(false)}
      >
        <SafeAreaView style={styles.modalSafe}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Drug Comparison</Text>
            <TouchableOpacity onPress={() => setCompareModalVisible(false)}>
              <MaterialCommunityIcons name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
          {compareResult && (
            <ScrollView contentContainerStyle={styles.modalContent}>
              {/* Drug names header */}
              <View style={styles.compareNamesRow}>
                <View style={[styles.compareNameCard, { backgroundColor: colors.drug.surface }]}>
                  <MaterialCommunityIcons name="pill" size={18} color={colors.drug.primary} />
                  <Text style={styles.compareNameText} numberOfLines={2}>
                    {compareResult.a.brandName || compareResult.a.genericName}
                  </Text>
                </View>
                <View style={styles.vsCircle}>
                  <Text style={styles.vsText}>VS</Text>
                </View>
                <View style={[styles.compareNameCard, { backgroundColor: '#FFF3E0' }]}>
                  <MaterialCommunityIcons name="pill" size={18} color="#E65100" />
                  <Text style={[styles.compareNameText, { color: '#E65100' }]} numberOfLines={2}>
                    {compareResult.b.brandName || compareResult.b.genericName}
                  </Text>
                </View>
              </View>

              {compareResult.fields.map(({ label, a, b }) => (
                (a || b) ? (
                  <View key={label} style={styles.compareField}>
                    <Text style={styles.compareFieldLabel}>{label}</Text>
                    <View style={styles.compareFieldRow}>
                      <View style={[styles.compareCell, { borderLeftColor: colors.drug.primary }]}>
                        <Text style={styles.compareCellText}>
                          {a || '—'}
                        </Text>
                      </View>
                      <View style={[styles.compareCell, { borderLeftColor: '#E65100' }]}>
                        <Text style={styles.compareCellText}>
                          {b || '—'}
                        </Text>
                      </View>
                    </View>
                  </View>
                ) : null
              ))}

              <View style={styles.compareDisclaimer}>
                <Text style={styles.compareDisclaimerText}>
                  This comparison is for educational purposes only. Do not make medication decisions based on this information. Always consult your pharmacist or doctor about drug interactions.
                </Text>
              </View>
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.drug.dark },
  header: { paddingTop: 8, paddingHorizontal: spacing.md, paddingBottom: spacing.lg },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm,
  },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  headerTitle: { ...typography.h2, color: '#FFFFFF' },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  compareToggle: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
  },
  compareToggleActive: { backgroundColor: 'rgba(255,255,255,0.35)' },
  compareToggleText: { ...typography.label, color: '#FFFFFF' },
  compareBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    marginTop: spacing.sm,
  },
  compareBarText: { ...typography.bodySmall, color: '#FFFFFF' },
  compareGoBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: 4,
  },
  compareGoBtnText: { ...typography.label, color: colors.drug.primary },

  list: { padding: spacing.md, gap: spacing.sm, paddingBottom: spacing.xxl },

  // Med Card
  medCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg, padding: spacing.md, gap: spacing.md,
    ...shadow.sm,
  },
  medCardSelected: {
    borderWidth: 2, borderColor: colors.drug.primary,
    backgroundColor: colors.drug.surface,
  },
  medCardDisabled: { opacity: 0.4 },
  medIcon: {
    width: 46, height: 46, borderRadius: radius.md,
    backgroundColor: colors.drug.surface,
    alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  compareCheck: {
    position: 'absolute', top: -4, right: -4,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: colors.drug.primary,
    alignItems: 'center', justifyContent: 'center',
    zIndex: 1,
  },
  medBody: { flex: 1 },
  medBrand: { ...typography.h4, color: colors.textPrimary },
  medGeneric: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 1, fontStyle: 'italic' },
  medMeta: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.xs, alignItems: 'center' },
  medPill: {
    backgroundColor: colors.drug.surface, borderRadius: radius.full,
    paddingHorizontal: spacing.sm, paddingVertical: 2,
  },
  medPillText: { ...typography.caption, color: colors.drug.text, fontWeight: '600' },
  medRoute: { ...typography.caption, color: colors.textMuted },
  medManufacturer: { ...typography.caption, color: colors.textMuted, marginTop: 4 },

  // Empty
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.md },
  emptyTitle: { ...typography.h3, color: colors.textPrimary },
  emptyBody: { ...typography.body, color: colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  searchBtn: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    backgroundColor: colors.drug.primary,
    borderRadius: radius.full, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm + 2,
    marginTop: spacing.sm,
  },
  searchBtnText: { ...typography.label, color: '#FFFFFF', fontSize: 14 },

  clearBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs,
    paddingVertical: spacing.md,
  },
  clearBtnText: { ...typography.label, color: colors.error },

  // Modal
  modalSafe: { flex: 1, backgroundColor: colors.background },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  modalTitle: { ...typography.h3, color: colors.textPrimary },
  modalContent: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xxl },
  compareNamesRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  compareNameCard: {
    flex: 1, borderRadius: radius.lg, padding: spacing.md,
    alignItems: 'center', gap: spacing.xs,
  },
  compareNameText: { ...typography.h4, color: colors.drug.primary, textAlign: 'center' },
  vsCircle: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.textMuted,
    alignItems: 'center', justifyContent: 'center',
  },
  vsText: { fontSize: 11, fontWeight: '800', color: '#FFFFFF' },
  compareField: {
    backgroundColor: colors.surface, borderRadius: radius.lg, ...shadow.sm, overflow: 'hidden',
  },
  compareFieldLabel: {
    ...typography.label, color: colors.textMuted,
    paddingHorizontal: spacing.md, paddingTop: spacing.md, paddingBottom: spacing.xs,
    borderBottomWidth: 1, borderBottomColor: colors.divider,
  },
  compareFieldRow: { flexDirection: 'row' },
  compareCell: {
    flex: 1, padding: spacing.md,
    borderLeftWidth: 3,
  },
  compareCellText: { ...typography.bodySmall, color: colors.textSecondary, lineHeight: 20 },
  compareDisclaimer: {
    backgroundColor: '#FFF8E1', borderRadius: radius.md,
    padding: spacing.md, borderLeftWidth: 3, borderLeftColor: colors.warning,
  },
  compareDisclaimerText: { ...typography.caption, color: colors.textSecondary, lineHeight: 18 },
});
