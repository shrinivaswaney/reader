// src/components/TitleCard.tsx
import { Text } from '@/components/ui/Text';
import { COLORS } from '@/themes/theme';
import type { Manga } from '@/types/manga.types';
import { returnColourForMangaType } from '@/utils/utility';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

export function MangaCard({
  manga,
  onPress,
  progress,
}: {
  manga: Manga;
  onPress: () => void;
  progress: number;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.mangaCard, { opacity: pressed ? 0.85 : 1 }]}
      onPress={onPress}
    >
      <View>
        <Image style={styles.coverImage} source={{ uri: manga.coverUrl }} />
        <View style={styles.mangaTypePill}>
          <View style={[styles.dot, { backgroundColor: returnColourForMangaType(manga) }]} />
          <Text style={styles.mangaTypeText}>{manga.type.toUpperCase()}</Text>
        </View>
        <View style={styles.mangaCardFooter}>
          <View style={styles.mangaCardFooterTop}>
            <Text style={styles.mangaCardFooterText}>
              {manga.latestChapter != null ? `Ch.  ${manga.latestChapter}` : ''}
            </Text>
            <Text style={styles.mangaCardFooterText}>7h ago</Text>
          </View>
          <Text numberOfLines={2} style={styles.mangaCardFooterTitleText}>
            {manga.title}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  mangaCard: {
    width: '47%',
    marginBottom: 20,
  },
  coverImage: {
    width: '100%',
    aspectRatio: 2 / 3,
    borderRadius: 14,
    backgroundColor: COLORS.card,
  },
  mangaTypePill: {
    position: 'absolute',
    top: 6,
    left: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.bg,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 999,
  },
  mangaTypeText: {
    color: COLORS.textPrimary,
    fontSize: 8,
    fontWeight: 'bold',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    display: 'flex',
    alignItems: 'center',
  },
  mangaCardFooter: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    gap: 4,
    padding: 6,
  },
  mangaCardFooterTop: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    fontWeight: '500',
  },
  mangaCardFooterText: {
    color: COLORS.textMuted,
  },
  mangaCardFooterTitleText: {
    color: COLORS.textPrimary,
  },
});
