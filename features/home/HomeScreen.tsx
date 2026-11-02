import React from 'react';
import { View, Text, ScrollView, FlatList, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { MangaCarousel } from './MangaCarousel';
import { ContinueReadingCard } from './ContinueReadingCard';
import { genreShelf } from '@/mocks/dummyManga';
import { usePopularManga, useRecentManga } from '@/api/mangadex/queries';
import { type, space, radius, ThemeColors } from '@/constants/theme';
import { useTheme } from '@/providers/theme-provider';
import { useReadingProgress } from '@/providers/reading-progress-provider';

export default function HomeScreen() {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const router = useRouter();
  const openManga = (externalId: string) => router.push(`/manga/${externalId}`);

  // Real reading history, persisted by the reader — newest first.
  const { entries: continueReading } = useReadingProgress();

  const trending = usePopularManga();
  const recent = useRecentManga();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Good evening</Text>
          <Text style={styles.headerTitle}>Blossom</Text>
        </View>

        {/* Genre shelf — horizontal pill scroller (not yet wired to filtering) */}
        <FlatList
          data={genreShelf}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(g) => g}
          contentContainerStyle={styles.genreRow}
          renderItem={({ item }) => (
            <Pressable style={styles.genrePill}>
              <Text style={styles.genrePillText}>{item}</Text>
            </Pressable>
          )}
        />

        {/* Continue Reading — real history persisted locally by the reader */}
        {continueReading.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title="Continue Reading" />
            <View style={{ paddingHorizontal: space.lg }}>
              {continueReading.slice(0, 8).map((item) => (
                <ContinueReadingCard
                  key={item.mangaId}
                  item={{
                    externalId: item.mangaId,
                    title: item.title,
                    coverUrl: item.coverUrl,
                    type: 'manga',
                    genres: [],
                    lastChapter: item.lastChapter,
                    lastPage: item.lastPage,
                    totalPagesInChapter: item.totalPagesInChapter,
                  }}
                  onPress={() => openManga(item.mangaId)}
                />
              ))}
            </View>
          </View>
        )}

        {/* Trending — live MangaDex data, sorted by follow count */}
        <View style={styles.section}>
          <SectionHeader title="Trending Now" />
          <MangaCarousel
            data={trending.data}
            isLoading={trending.isLoading}
            isError={trending.isError}
            onRetry={() => trending.refetch()}
            onPressManga={openManga}
          />
        </View>

        {/* New Releases — live MangaDex data, sorted by creation date */}
        <View style={styles.section}>
          <SectionHeader title="New Releases" />
          <MangaCarousel
            data={recent.data}
            isLoading={recent.isLoading}
            isError={recent.isError}
            onRetry={() => recent.refetch()}
            onPressManga={openManga}
          />
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
  scrollContent: {
    paddingBottom: space.xxl,
  },
  header: {
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    paddingBottom: space.lg,
  },
  greeting: {
    ...type.body,
    color: colors.textMuted,
    marginBottom: space.xxs,
  },
  headerTitle: {
    ...type.displayLg,
    color: colors.text,
  },
  genreRow: {
    paddingHorizontal: space.lg,
    gap: space.sm,
    marginBottom: space.xl,
  },
  genrePill: {
    paddingHorizontal: space.md,
    paddingVertical: space.sm - space.xxs,
    borderRadius: radius.pill,
    backgroundColor: colors.fill,
  },
  genrePillText: {
    ...type.caption,
    color: colors.textMuted,
  },
  section: {
    marginBottom: space.xl,
  },
});