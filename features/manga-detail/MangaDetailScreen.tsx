import React, { useState } from 'react';
import { View, Text, Image, ScrollView, Pressable, FlatList, ActivityIndicator, TextInput, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Search as SearchIcon, XCircle, ArrowDownWideNarrow, ArrowUpNarrowWide } from 'lucide-react-native';
import { useMangaDetail } from '@/api/mangadex/queries';
import { PlatformLinkCard } from './PlatformLinkCard';
import { ChapterRow } from './ChapterRow';
import { CHAPTER_PREVIEW_COUNT, filterByChapterNumber, sortChapters, type SortDirection } from './chapter-list';
import { type, space, radius, ThemeColors } from '@/constants/theme';
import { useTheme } from '@/providers/theme-provider';

const typeLabel = { manga: 'Manga', manhwa: 'Manhwa', manhua: 'Manhua' } as const;
const statusLabel = { ongoing: 'Ongoing', completed: 'Completed', hiatus: 'On Hiatus' } as const;

type Props = { mangaId: string | undefined };

export default function MangaDetailScreen({ mangaId: id }: Props) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(false);
  const [inLibrary, setInLibrary] = useState(false);
  const [showAllChapters, setShowAllChapters] = useState(false);
  const [chapterQuery, setChapterQuery] = useState('');
  const [sortDir, setSortDir] = useState<SortDirection>('desc');

  const { data: manga, isLoading, isError, refetch } = useMangaDetail(id);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.notFound}>
          <ActivityIndicator color={colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  if (isError || !manga) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundTitle}>{isError ? "Couldn't load this title" : 'Title not found'}</Text>
          {isError && (
            <Pressable onPress={() => refetch()} style={{ marginBottom: space.sm }}>
              <Text style={styles.backLink}>Retry</Text>
            </Pressable>
          )}
          <Pressable onPress={() => router.back()}>
            <Text style={styles.backLink}>Go back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // Filter → sort → maybe slice. Search overrides the preview cap entirely.
  const searchingChapters = chapterQuery.trim().length > 0;
  const processedChapters = sortChapters(filterByChapterNumber(manga.chapters, chapterQuery), sortDir);
  const visibleChapters =
    searchingChapters || showAllChapters ? processedChapters : processedChapters.slice(0, CHAPTER_PREVIEW_COUNT);
  const needsChapterControls = manga.chapters.length > CHAPTER_PREVIEW_COUNT;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: space.xxl }}>
        {/* Back button */}
        <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={8}>
          <Text style={styles.backButtonText}>‹ Back</Text>
        </Pressable>

        {/* Cover + core info */}
        <View style={styles.heroRow}>
          <Image source={{ uri: manga.coverUrl }} style={styles.cover} />
          <View style={styles.heroInfo}>
            <Text style={styles.title} numberOfLines={3}>{manga.title}</Text>
            <View style={styles.badgeRow}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{typeLabel[manga.type]}</Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{statusLabel[manga.status]}</Text>
              </View>
            </View>
            {manga.rating != null && (
              <Text style={styles.rating}>★ {manga.rating.toFixed(1)}</Text>
            )}
          </View>
        </View>

        {/* Genres */}
        <View style={styles.genreRow}>
          {manga.genres.map((g) => (
            <View key={g} style={styles.genreChip}>
              <Text style={styles.genreChipText}>{g}</Text>
            </View>
          ))}
        </View>

        {/* Primary actions */}
        <View style={styles.actionRow}>
          <Pressable
            style={[styles.primaryButton, inLibrary && styles.primaryButtonActive]}
            onPress={() => setInLibrary((v) => !v)}
          >
            <Text style={styles.primaryButtonText}>
              {inLibrary ? '✓ In Library' : '+ Add to Library'}
            </Text>
          </Pressable>
          <Pressable
            style={styles.favoriteButton}
            onPress={() => setIsFavorite((v) => !v)}
            hitSlop={8}
          >
            <Text style={[styles.favoriteIcon, isFavorite && styles.favoriteIconActive]}>
              {isFavorite ? '★' : '☆'}
            </Text>
          </Pressable>
        </View>

        {/* Synopsis */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Synopsis</Text>
          <Text style={styles.synopsis}>{manga.synopsis}</Text>
        </View>

        {/* Available on — platform links */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available On</Text>
          {manga.platformLinks.length === 0 ? (
            <Text style={styles.emptyPlatforms}>No reading platforms found for this title yet.</Text>
          ) : (
            manga.platformLinks.map((link) => (
              <PlatformLinkCard key={link.platformName} link={link} />
            ))
          )}
        </View>

        {/* Chapters */}
        <View style={styles.section}>
          <View style={styles.chapterHeader}>
            <Text style={styles.sectionTitle}>Chapters</Text>
            <Text style={styles.chapterCount}>{manga.chapters.length} total</Text>
          </View>

          {needsChapterControls && (
            <View style={styles.chapterControls}>
              {/* Search by chapter number */}
              <View style={styles.chapterSearch}>
                <SearchIcon size={14} color={colors.textFaint} />
                <TextInput
                  value={chapterQuery}
                  onChangeText={setChapterQuery}
                  placeholder="Chapter #"
                  placeholderTextColor={colors.textFaint}
                  style={styles.chapterSearchInput}
                  keyboardType="decimal-pad"
                  autoCorrect={false}
                  returnKeyType="done"
                />
                {searchingChapters && (
                  <Pressable onPress={() => setChapterQuery('')} hitSlop={8} accessibilityLabel="Clear chapter search">
                    <XCircle size={14} color={colors.textFaint} />
                  </Pressable>
                )}
              </View>

              {/* Sort toggle: newest-first ↔ oldest-first */}
              <Pressable
                style={styles.sortButton}
                onPress={() => setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'))}
                accessibilityRole="button"
                accessibilityLabel={`Sort chapters ${sortDir === 'desc' ? 'oldest first' : 'newest first'}`}
              >
                {sortDir === 'desc' ? (
                  <ArrowDownWideNarrow size={14} color={colors.accent} />
                ) : (
                  <ArrowUpNarrowWide size={14} color={colors.accent} />
                )}
                <Text style={styles.sortButtonText}>{sortDir === 'desc' ? 'Newest' : 'Oldest'}</Text>
              </Pressable>
            </View>
          )}

          {visibleChapters.length === 0 && searchingChapters ? (
            <Text style={styles.noChapterMatch}>
              No chapters match “{chapterQuery.trim()}”.
            </Text>
          ) : (
            <FlatList
              data={visibleChapters}
              keyExtractor={(c) => c.id}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <ChapterRow
                  chapter={item}
                  onPress={() => router.push(`/reader/${manga.externalId}/${item.id}`)}
                />
              )}
            />
          )}

          {!searchingChapters && needsChapterControls && (
            <Pressable
              style={styles.seeAllButton}
              onPress={() => setShowAllChapters((v) => !v)}
              accessibilityRole="button"
              accessibilityLabel={showAllChapters ? 'Show fewer chapters' : `Show all ${manga.chapters.length} chapters`}
            >
              <Text style={styles.seeAllText}>
                {showAllChapters ? 'Show Less' : `See All (${manga.chapters.length})`}
              </Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.lg,
  },
  notFoundTitle: {
    ...type.displayMd,
    color: colors.text,
    marginBottom: space.md,
  },
  backLink: {
    ...type.body,
    color: colors.accent,
  },
  backButton: {
    paddingHorizontal: space.lg,
    paddingTop: space.sm,
    paddingBottom: space.md,
  },
  backButtonText: {
    ...type.body,
    color: colors.accent,
  },
  heroRow: {
    flexDirection: 'row',
    paddingHorizontal: space.lg,
    gap: space.md,
    marginBottom: space.md,
  },
  cover: {
    width: 120,
    height: 180,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  heroInfo: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  title: {
    ...type.displayMd,
    color: colors.text,
    marginBottom: space.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: space.xs,
    marginBottom: space.sm,
  },
  badge: {
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingHorizontal: space.sm,
    paddingVertical: 3,
  },
  badgeText: {
    ...type.micro,
    color: colors.textMuted,
  },
  rating: {
    ...type.body,
    color: colors.highlight,
  },
  genreRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.xs,
    paddingHorizontal: space.lg,
    marginBottom: space.lg,
  },
  genreChip: {
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: radius.pill,
    paddingHorizontal: space.sm,
    paddingVertical: 4,
  },
  genreChipText: {
    ...type.caption,
    color: colors.textMuted,
  },
  actionRow: {
    flexDirection: 'row',
    paddingHorizontal: space.lg,
    gap: space.sm,
    marginBottom: space.xl,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: colors.accent,
    borderRadius: radius.lg,
    paddingVertical: space.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonActive: {
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  primaryButtonText: {
    ...type.bodyLg,
    color: colors.bg,
    fontWeight: '600',
  },
  favoriteButton: {
    width: 46,
    height: 46,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteIcon: {
    fontSize: type.displayMd.fontSize,
    color: colors.textFaint,
  },
  favoriteIconActive: {
    color: colors.highlight,
  },
  section: {
    paddingHorizontal: space.lg,
    marginBottom: space.xl,
  },
  sectionTitle: {
    ...type.displayMd,
    color: colors.text,
    marginBottom: space.md,
  },
  synopsis: {
    ...type.body,
    color: colors.textMuted,
    lineHeight: space.md,
  },
  emptyPlatforms: {
    ...type.body,
    color: colors.textFaint,
  },
  chapterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  chapterCount: {
    ...type.caption,
    color: colors.textFaint,
  },
  chapterControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    marginBottom: space.sm,
  },
  chapterSearch: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm - 6,
    backgroundColor: colors.fill,
    borderRadius: radius.md,
    paddingHorizontal: space.sm,
    height: 34,
  },
  chapterSearchInput: {
    flex: 1,
    ...type.caption,
    color: colors.text,
    paddingVertical: 0,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    backgroundColor: colors.accentSoft,
    borderRadius: radius.pill,
    paddingHorizontal: space.sm,
    height: 34,
  },
  sortButtonText: {
    ...type.caption,
    color: colors.accent,
  },
  noChapterMatch: {
    ...type.body,
    color: colors.textFaint,
    paddingVertical: space.lg,
    textAlign: 'center',
  },
  seeAllButton: {
    alignSelf: 'center',
    paddingVertical: space.sm,
    paddingHorizontal: space.lg,
    marginTop: space.xs,
  },
  seeAllText: {
    ...type.headline,
    color: colors.accent,
  },
});