import React from 'react';
import { View, Text, FlatList, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { Manga } from '@/types/manga.types';
import { MangaCard } from '@/components/manga/MangaCard';
import { type, space, ThemeColors } from '@/constants/theme';
import { useTheme } from '@/providers/theme-provider';

type Props = {
  data: Manga[] | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry?: () => void;
  onPressManga: (externalId: string) => void;
};

// Loading, error, empty, and loaded are visually distinct states — never
// collapse "still fetching" and "nothing found" into the same UI.
export function MangaCarousel({ data, isLoading, isError, onRetry, onPressManga }: Props) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  if (isLoading) {
    return (
      <View style={styles.centerRow}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centerRow}>
        <Text style={styles.errorText}>Couldn&apos;t load this — check your connection.</Text>
        {onRetry && (
          <Pressable onPress={onRetry} hitSlop={8}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        )}
      </View>
    );
  }

  if (!data || data.length === 0) {
    return (
      <View style={styles.centerRow}>
        <Text style={styles.emptyText}>Nothing here right now.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={data}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyExtractor={(m) => m.externalId}
      contentContainerStyle={{ paddingHorizontal: space.lg, gap: space.md }}
      renderItem={({ item }) => <MangaCard manga={item} onPress={() => onPressManga(item.externalId)} />}
    />
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  centerRow: {
    paddingHorizontal: space.lg,
    paddingVertical: space.lg,
    alignItems: 'center',
  },
  errorText: {
    ...type.caption,
    color: colors.textMuted,
    marginBottom: space.xs,
  },
  retryText: {
    ...type.caption,
    color: colors.accent,
    fontWeight: '600',
  },
  emptyText: {
    ...type.caption,
    color: colors.textFaint,
  },
});