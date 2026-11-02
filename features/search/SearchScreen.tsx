import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Search as SearchIcon, XCircle, Clock, TrendingUp } from 'lucide-react-native';
import { MangaCard } from '@/components/manga/MangaCard';
import { useSearchManga, usePopularManga } from '@/api/mangadex/queries';
import { useRecentSearches } from './recent-searches';
import { type, space, radius, ThemeColors } from '@/constants/theme';
import { useTheme } from '@/providers/theme-provider';

// How long typing must pause before we hit the API.
const SEARCH_DEBOUNCE_MS = 400;

export default function SearchScreen() {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const { recents, add, remove, clearAll } = useRecentSearches();

  // Debounce the raw input; only trimmed, non-empty terms trigger searches.
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);

  const searching = debounced.length > 0;
  const results = useSearchManga(debounced);
  const trending = usePopularManga();

  const commitTerm = (term: string) => add(term);

  const openManga = (externalId: string, term: string | null) => {
    if (term) commitTerm(term);
    router.push(`/manga/${externalId}`);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Search</Text>
      </View>

      <View style={styles.searchBar}>
        <SearchIcon size={16} color={colors.textFaint} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={() => commitTerm(query)}
          placeholder="Search manga, manhwa, manhua"
          placeholderTextColor={colors.textFaint}
          style={styles.input}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
        {query.length > 0 && (
          <Pressable onPress={() => setQuery('')} hitSlop={8} accessibilityLabel="Clear search">
            <XCircle size={16} color={colors.textFaint} />
          </Pressable>
        )}
      </View>

      {searching ? (
        results.isError ? (
          <View style={styles.stateBlock}>
            <Text style={styles.emptyTitle}>Search failed</Text>
            <Text style={styles.emptyBody}>Check your connection and try again.</Text>
            <Pressable
              style={({ pressed }) => [styles.retryButton, pressed && styles.retryPressed]}
              onPress={() => results.refetch()}
              accessibilityRole="button"
              accessibilityLabel="Retry search"
            >
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View>
        ) : results.isLoading ? (
          <View style={styles.stateBlock}>
            <ActivityIndicator color={colors.accent} />
          </View>
        ) : (results.data?.length ?? 0) === 0 ? (
          <View style={styles.stateBlock}>
            <Text style={styles.emptyTitle}>No matches</Text>
            <Text style={styles.emptyBody}>Try a different spelling or a shorter title.</Text>
          </View>
        ) : (
          <FlatList
            data={results.data ?? []}
            keyExtractor={(m) => m.externalId}
            numColumns={3}
            columnWrapperStyle={{ gap: space.sm, paddingHorizontal: space.lg }}
            contentContainerStyle={{ gap: space.md, paddingBottom: space.xxl }}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <View style={{ flex: 1 / 3 }}>
                <MangaCard
                  manga={item}
                  width={null}
                  onPress={() => openManga(item.externalId, debounced)}
                />
              </View>
            )}
          />
        )
      ) : (
        <FlatList
          data={[]}
          keyExtractor={() => ''}
          renderItem={null}
          ListHeaderComponent={
            <View>
              {/* Recent searches */}
              {recents.length > 0 && (
                <View style={styles.recentSection}>
                  <View style={styles.recentHeader}>
                    <Clock size={16} color={colors.textFaint} />
                    <Text style={styles.sectionTitle}>Recent Searches</Text>
                    <Pressable
                      onPress={clearAll}
                      hitSlop={8}
                      accessibilityRole="button"
                      accessibilityLabel="Clear all recent searches"
                    >
                      <Text style={styles.clearAllText}>Clear All</Text>
                    </Pressable>
                  </View>
                  <View style={styles.recentList}>
                    {recents.map((term) => (
                      <View key={term} style={styles.recentRow}>
                        <Pressable
                          style={styles.recentRowMain}
                          onPress={() => setQuery(term)}
                          accessibilityRole="button"
                          accessibilityLabel={`Search for ${term}`}
                        >
                          <Text numberOfLines={1} style={styles.recentTerm}>
                            {term}
                          </Text>
                        </Pressable>
                        <Pressable
                          onPress={() => remove(term)}
                          hitSlop={8}
                          accessibilityRole="button"
                          accessibilityLabel={`Remove ${term} from recent searches`}
                        >
                          <XCircle size={16} color={colors.textFaint} />
                        </Pressable>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Live discovery while idle */}
              <View style={[styles.recentSection, recents.length === 0 && { marginTop: 0 }]}>
                <View style={styles.recentHeader}>
                  <TrendingUp size={16} color={colors.accent} />
                  <Text style={styles.sectionTitle}>Trending Now</Text>
                </View>
                {trending.isLoading ? (
                  <View style={styles.trendingState}>
                    <ActivityIndicator color={colors.accent} />
                  </View>
                ) : trending.isError ? (
                  <Pressable
                    style={({ pressed }) => [
                      styles.retryButton,
                      pressed && styles.retryPressed,
                      { alignSelf: 'flex-start' },
                    ]}
                    onPress={() => trending.refetch()}
                    accessibilityRole="button"
                    accessibilityLabel="Retry trending list"
                  >
                    <Text style={styles.retryText}>Retry</Text>
                  </Pressable>
                ) : (
                  <FlatList
                    data={trending.data ?? []}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(m) => m.externalId}
                    contentContainerStyle={{ gap: space.sm, paddingHorizontal: space.lg }}
                    renderItem={({ item }) => (
                      <MangaCard manga={item} onPress={() => openManga(item.externalId, null)} />
                    )}
                  />
                )}
              </View>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    paddingBottom: space.sm,
  },
  headerTitle: {
    ...type.title1,
    color: colors.text,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: space.lg,
    marginBottom: space.md,
    backgroundColor: colors.fill,
    borderRadius: radius.lg,
    paddingHorizontal: space.md,
    height: 40,
    gap: space.sm - space.xs,
  },
  input: {
    flex: 1,
    ...type.body,
    color: colors.text,
    paddingVertical: 0,
  },

  // Recent-searches / discovery sections shown when idle
  recentSection: {
    marginTop: space.md,
  },
  recentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm - space.xs,
    paddingHorizontal: space.lg,
    marginBottom: space.sm,
  },
  sectionTitle: {
    ...type.displayMd,
    color: colors.text,
    flex: 1,
  },
  clearAllText: {
    ...type.caption,
    color: colors.accent,
  },
  recentList: {
    marginHorizontal: space.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: space.md,
    height: 44,
  },
  recentRowMain: {
    flex: 1,
    justifyContent: 'center',
    height: '100%',
  },
  recentTerm: {
    ...type.body,
    color: colors.text,
  },
  trendingState: {
    alignItems: 'center',
    paddingVertical: space.xl,
  },

  // Loading / error / empty states
  stateBlock: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    paddingHorizontal: space.xl,
    paddingBottom: space.xxl,
  },
  emptyTitle: {
    ...type.displayMd,
    color: colors.text,
  },
  emptyBody: {
    ...type.body,
    color: colors.textMuted,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: colors.accentSoft,
    borderRadius: radius.pill,
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
    marginTop: space.xs,
  },
  retryPressed: {
    opacity: 0.7,
  },
  retryText: {
    ...type.headline,
    color: colors.accent,
  },
});
