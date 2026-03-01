import React, { useState } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity,
  StyleSheet, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { searchDiseases, DISEASE_CATEGORIES } from '../../services/diseaseService';
import { addDiseaseHistory, getDiseaseHistory, clearDiseaseHistory } from '../../storage/searchHistory';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorDisplay from '../../components/ErrorDisplay';
import { colors, spacing, radius, shadow, typography } from '../../theme/theme';

const FEATURED = [
  'Diabetes', 'Hypertension', 'Asthma', 'Influenza',
  'Pneumonia', 'Migraine', 'Arthritis', 'Depression',
];

export default function DiseaseSearchScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);

  React.useEffect(() => {
    getDiseaseHistory().then(setRecentSearches);
  }, []);

  const handleSearch = async (searchQuery) => {
    const q = searchQuery ?? query;
    if (!q.trim()) return;
    setLoading(true);
    setError(null);
    setHasSearched(true);
    addDiseaseHistory(q.trim());
    const { data, error: err } = await searchDiseases(q.trim());
    setLoading(false);
    if (err) {
      setError(err);
    } else {
      setResults(data || []);
    }
  };

  const handleCategoryPress = (cat) => {
    setQuery(cat.query);
    handleSearch(cat.query);
  };

  const renderDiseaseCard = ({ item }) => (
    <TouchableOpacity
      style={styles.diseaseCard}
      onPress={() => navigation.navigate('DiseaseDetail', { disease: item })}
      activeOpacity={0.8}
    >
      <View style={styles.diseaseIconBg}>
        <MaterialCommunityIcons name="book-open-variant" size={22} color={colors.disease.primary} />
      </View>
      <View style={styles.diseaseBody}>
        <Text style={styles.diseaseTitle} numberOfLines={2}>{item.title}</Text>
        {item.snippet ? (
          <Text style={styles.diseaseSnippet} numberOfLines={3}>{item.snippet}</Text>
        ) : null}
        <View style={styles.diseaseFooter}>
          <MaterialCommunityIcons name="hospital-building" size={12} color={colors.textMuted} />
          <Text style={styles.diseaseOrg}>{item.organization || 'NIH MedlinePlus'}</Text>
        </View>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textMuted} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.disease.dark} />

      {/* Header */}
      <LinearGradient colors={[colors.disease.dark, colors.disease.light]} style={styles.header}>
        <View style={styles.appNameRow}>
          <MaterialCommunityIcons name="book-open-variant" size={14} color="rgba(255,255,255,0.7)" />
          <Text style={styles.appName}>MedScope</Text>
        </View>
        <Text style={styles.headerTitle}>Disease Encyclopedia</Text>
        <Text style={styles.headerSub}>Powered by NIH MedlinePlus</Text>

        <View style={styles.searchContainer}>
          <MaterialCommunityIcons name="magnify" size={20} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search a disease or condition"
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

      {loading ? (
        <LoadingSpinner message="Searching NIH MedlinePlus..." color={colors.disease.primary} />
      ) : error ? (
        <ErrorDisplay message={error} onRetry={() => handleSearch()} />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item, i) => `${item.id}-${i}`}
          renderItem={renderDiseaseCard}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            !hasSearched ? (
              <View style={{ gap: spacing.md }}>
                {recentSearches.length > 0 && (
                  <View>
                    <View style={styles.recentHeader}>
                      <Text style={styles.sectionLabel}>RECENT SEARCHES</Text>
                      <TouchableOpacity onPress={() => { clearDiseaseHistory(); setRecentSearches([]); }}>
                        <Text style={styles.clearHistory}>Clear</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={styles.featuredGrid}>
                      {recentSearches.map((term) => (
                        <TouchableOpacity
                          key={term}
                          style={styles.recentChip}
                          onPress={() => { setQuery(term); handleSearch(term); }}
                          activeOpacity={0.8}
                        >
                          <MaterialCommunityIcons name="history" size={13} color={colors.textSecondary} />
                          <Text style={styles.recentChipText}>{term}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}
                {/* Featured searches */}
                <View>
                  <Text style={styles.sectionLabel}>POPULAR CONDITIONS</Text>
                  <View style={styles.featuredGrid}>
                    {FEATURED.map((name) => (
                      <TouchableOpacity
                        key={name}
                        style={styles.featuredChip}
                        onPress={() => { setQuery(name); handleSearch(name); }}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.featuredText}>{name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Browse by category */}
                <View>
                  <Text style={styles.sectionLabel}>BROWSE BY CATEGORY</Text>
                  <View style={styles.categoryGrid}>
                    {DISEASE_CATEGORIES.map((cat) => (
                      <TouchableOpacity
                        key={cat.id}
                        style={styles.categoryCard}
                        onPress={() => handleCategoryPress(cat)}
                        activeOpacity={0.8}
                      >
                        <MaterialCommunityIcons name={cat.icon} size={26} color={colors.disease.primary} />
                        <Text style={styles.categoryLabel}>{cat.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* About card */}
                <View style={styles.aboutCard}>
                  <MaterialCommunityIcons name="information-outline" size={20} color={colors.disease.primary} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.aboutTitle}>About Disease Encyclopedia</Text>
                    <Text style={styles.aboutBody}>
                      Educational health information from the National Institutes of Health (NIH) and the National Library of Medicine (NLM). For informational purposes only.
                    </Text>
                  </View>
                </View>
              </View>
            ) : results.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="book-off-outline" size={52} color={colors.textMuted} />
                <Text style={styles.emptyTitle}>No results found</Text>
                <Text style={styles.emptyBody}>Try a different spelling or use a general term (e.g. "heart disease" instead of "coronary artery disease").</Text>
              </View>
            ) : (
              <Text style={styles.resultsLabel}>{results.length} article{results.length !== 1 ? 's' : ''} found</Text>
            )
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.disease.dark },
  header: {
    paddingTop: 8,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
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
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2, marginBottom: spacing.md },
  searchContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFFFFF', borderRadius: radius.xl,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2,
    gap: spacing.sm, ...shadow.md,
  },
  searchInput: { flex: 1, ...typography.body, color: colors.textPrimary, padding: 0 },

  list: { padding: spacing.md, flexGrow: 1, gap: spacing.sm },
  sectionLabel: { ...typography.overline, color: colors.textMuted, marginBottom: spacing.sm },

  // Disease card
  diseaseCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg, padding: spacing.md,
    marginBottom: spacing.sm, gap: spacing.md,
    ...shadow.sm,
  },
  diseaseIconBg: {
    width: 46, height: 46, borderRadius: radius.md,
    backgroundColor: colors.disease.surface,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  diseaseBody: { flex: 1 },
  diseaseTitle: { ...typography.h4, color: colors.textPrimary },
  diseaseSnippet: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 4, lineHeight: 18 },
  diseaseFooter: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  diseaseOrg: { ...typography.caption, color: colors.textMuted },

  // Featured
  featuredGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  featuredChip: {
    backgroundColor: colors.disease.surface,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2,
    borderWidth: 1, borderColor: colors.disease.primary + '30',
  },
  featuredText: { ...typography.bodySmall, color: colors.disease.primary, fontWeight: '600' },

  // Category grid
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  categoryCard: {
    width: '47%',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center', gap: spacing.sm,
    ...shadow.sm,
  },
  categoryLabel: { ...typography.bodySmall, color: colors.textPrimary, textAlign: 'center', fontWeight: '600' },

  // About
  aboutCard: {
    flexDirection: 'row', gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg, padding: spacing.md,
    ...shadow.sm,
  },
  aboutTitle: { ...typography.h4, color: colors.textPrimary, marginBottom: 4 },
  aboutBody: { ...typography.bodySmall, color: colors.textSecondary, lineHeight: 20 },

  // Empty
  emptyState: { alignItems: 'center', paddingTop: spacing.xxl, gap: spacing.md },
  emptyTitle: { ...typography.h3, color: colors.textPrimary },
  emptyBody: { ...typography.body, color: colors.textSecondary, textAlign: 'center', lineHeight: 22 },

  resultsLabel: { ...typography.label, color: colors.textMuted, marginBottom: spacing.sm },
});
