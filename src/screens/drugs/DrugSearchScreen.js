import React, { useState, useCallback } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity,
  StyleSheet, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { searchDrugs, normalizeDrug } from '../../services/openFDAService';
import { getSavedMedications } from '../../storage/savedMedications';
import { addDrugHistory, getDrugHistory, clearDrugHistory } from '../../storage/searchHistory';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorDisplay from '../../components/ErrorDisplay';
import { colors, spacing, radius, shadow, typography } from '../../theme/theme';
import { useFocusEffect } from '@react-navigation/native';

const QUICK_SEARCHES = ['Ibuprofen', 'Aspirin', 'Amoxicillin', 'Metformin', 'Lisinopril', 'Atorvastatin'];

export default function DrugSearchScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  const [recentSearches, setRecentSearches] = useState([]);

  useFocusEffect(
    useCallback(() => {
      getSavedMedications().then((meds) => setSavedCount(meds.length));
      getDrugHistory().then(setRecentSearches);
    }, [])
  );

  const handleSearch = async (searchQuery) => {
    const q = searchQuery ?? query;
    if (!q.trim()) return;
    setLoading(true);
    setError(null);
    setHasSearched(true);
    addDrugHistory(q.trim());
    const { data, error: err } = await searchDrugs(q.trim());
    setLoading(false);
    if (err) {
      setError(err);
    } else {
      setResults((data || []).map(normalizeDrug));
    }
  };

  const handleQuickSearch = (term) => {
    setQuery(term);
    handleSearch(term);
  };

  const renderDrugCard = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('DrugDetail', { drug: item })}
      activeOpacity={0.8}
    >
      <View style={styles.cardLeft}>
        <View style={styles.drugIconBg}>
          <MaterialCommunityIcons name="pill" size={22} color={colors.drug.primary} />
        </View>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.brandName} numberOfLines={1}>
          {item.brandName || item.genericName || 'Unknown Drug'}
        </Text>
        {item.genericName && item.brandName && (
          <Text style={styles.genericName} numberOfLines={1}>{item.genericName}</Text>
        )}
        <View style={styles.pills}>
          {item.productType ? (
            <View style={[styles.pill, { backgroundColor: colors.drug.surface }]}>
              <Text style={[styles.pillText, { color: colors.drug.text }]}>{item.productType}</Text>
            </View>
          ) : null}
          {item.route ? (
            <View style={[styles.pill, { backgroundColor: colors.surfaceVariant }]}>
              <Text style={[styles.pillText, { color: colors.textSecondary }]}>{item.route}</Text>
            </View>
          ) : null}
        </View>
        {item.manufacturer ? (
          <Text style={styles.manufacturer} numberOfLines={1}>
            <MaterialCommunityIcons name="factory" size={11} color={colors.textMuted} />{' '}
            {item.manufacturer}
          </Text>
        ) : null}
      </View>
      <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textMuted} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.drug.dark} />
      {/* Header */}
      <LinearGradient colors={[colors.drug.dark, colors.drug.light]} style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <View style={styles.appNameRow}>
              <MaterialCommunityIcons name="pill" size={14} color="rgba(255,255,255,0.7)" />
              <Text style={styles.appName}>MedScope</Text>
            </View>
            <Text style={styles.headerTitle}>Drug Information</Text>
            <Text style={styles.headerSub}>Powered by U.S. FDA OpenFDA</Text>
          </View>
          <TouchableOpacity
            style={styles.savedBtn}
            onPress={() => navigation.navigate('SavedMedications')}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="bookmark-multiple" size={20} color="#FFFFFF" />
            {savedCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{savedCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <MaterialCommunityIcons name="magnify" size={20} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search drug name (e.g. Ibuprofen)"
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => handleSearch()}
            returnKeyType="search"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => { setQuery(''); setResults([]); setHasSearched(false); }}>
              <MaterialCommunityIcons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      {/* Body */}
      {loading ? (
        <LoadingSpinner message="Searching FDA database..." color={colors.drug.primary} />
      ) : error ? (
        <ErrorDisplay message={error} onRetry={() => handleSearch()} />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item, i) => `${item.id}-${i}`}
          renderItem={renderDrugCard}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            !hasSearched ? (
              <View style={styles.homeContent}>
                {recentSearches.length > 0 && (
                  <View>
                    <View style={styles.recentHeader}>
                      <Text style={styles.sectionLabel}>RECENT SEARCHES</Text>
                      <TouchableOpacity onPress={() => { clearDrugHistory(); setRecentSearches([]); }}>
                        <Text style={styles.clearHistory}>Clear</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={styles.quickGrid}>
                      {recentSearches.map((term) => (
                        <TouchableOpacity
                          key={term}
                          style={styles.recentChip}
                          onPress={() => handleQuickSearch(term)}
                          activeOpacity={0.8}
                        >
                          <MaterialCommunityIcons name="history" size={13} color={colors.textSecondary} />
                          <Text style={styles.recentChipText}>{term}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}
                <Text style={styles.sectionLabel}>QUICK SEARCH</Text>
                <View style={styles.quickGrid}>
                  {QUICK_SEARCHES.map((term) => (
                    <TouchableOpacity
                      key={term}
                      style={styles.quickChip}
                      onPress={() => handleQuickSearch(term)}
                      activeOpacity={0.8}
                    >
                      <MaterialCommunityIcons name="pill" size={14} color={colors.drug.primary} />
                      <Text style={styles.quickChipText}>{term}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={styles.infoCard}>
                  <MaterialCommunityIcons name="information-outline" size={20} color={colors.drug.primary} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.infoCardTitle}>About Drug Information</Text>
                    <Text style={styles.infoCardBody}>
                      Get FDA-approved drug labels including uses, dosage, warnings, side effects, and active recalls. Data sourced directly from the U.S. FDA OpenFDA database.
                    </Text>
                  </View>
                </View>
              </View>
            ) : results.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="pill-off" size={52} color={colors.textMuted} />
                <Text style={styles.emptyTitle}>No results found</Text>
                <Text style={styles.emptyBody}>
                  Try the generic name (e.g. "ibuprofen" instead of "Advil"), or check your spelling.
                </Text>
              </View>
            ) : (
              <Text style={styles.resultsLabel}>{results.length} result{results.length !== 1 ? 's' : ''} found</Text>
            )
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.drug.dark },
  header: {
    paddingTop: 8,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  appNameRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 },
  appName: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.7)' },
  recentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  clearHistory: { ...typography.caption, color: colors.textMuted },
  recentChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: colors.surfaceVariant,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderWidth: 1, borderColor: colors.border,
  },
  recentChipText: { ...typography.bodySmall, color: colors.textSecondary, fontWeight: '500' },
  headerTitle: { ...typography.h2, color: '#FFFFFF' },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  savedBtn: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: radius.md,
    padding: spacing.sm + 2,
    position: 'relative',
  },
  badge: {
    position: 'absolute', top: -4, right: -4,
    backgroundColor: '#FF5722',
    borderRadius: radius.full, width: 18, height: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  badgeText: { fontSize: 10, fontWeight: '700', color: '#FFFFFF' },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    gap: spacing.sm,
    ...shadow.md,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
    padding: 0,
  },
  list: { padding: spacing.md, gap: spacing.sm, flexGrow: 1 },
  // Drug Card
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
    ...shadow.sm,
  },
  cardLeft: {},
  drugIconBg: {
    width: 46, height: 46,
    borderRadius: radius.md,
    backgroundColor: colors.drug.surface,
    alignItems: 'center', justifyContent: 'center',
  },
  cardBody: { flex: 1 },
  brandName: { ...typography.h4, color: colors.textPrimary },
  genericName: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 1 },
  pills: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.xs, flexWrap: 'wrap' },
  pill: {
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  pillText: { ...typography.caption, fontWeight: '600' },
  manufacturer: { ...typography.caption, color: colors.textMuted, marginTop: 4 },
  // Home content
  homeContent: { gap: spacing.md },
  sectionLabel: { ...typography.overline, color: colors.textMuted },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  quickChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: colors.drug.surface,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderWidth: 1, borderColor: colors.drug.primary + '30',
  },
  quickChipText: { ...typography.bodySmall, color: colors.drug.primary, fontWeight: '600' },
  infoCard: {
    flexDirection: 'row', gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadow.sm,
  },
  infoCardTitle: { ...typography.h4, color: colors.textPrimary, marginBottom: 4 },
  infoCardBody: { ...typography.bodySmall, color: colors.textSecondary, lineHeight: 20 },
  // Empty / results
  emptyState: { alignItems: 'center', paddingTop: spacing.xxl, gap: spacing.md },
  emptyTitle: { ...typography.h3, color: colors.textPrimary },
  emptyBody: { ...typography.body, color: colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  resultsLabel: { ...typography.label, color: colors.textMuted, marginBottom: spacing.sm },
});
