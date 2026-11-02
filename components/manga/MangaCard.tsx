import React from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { type, space, radius, ThemeColors, BADGE_FONT_SIZE } from '@/constants/theme';
import { useTheme } from '@/providers/theme-provider';
import { Manga } from '@/types/manga.types';

type Props = {
  manga: Manga;
  onPress?: () => void;
  onLongPress?: () => void;
  /**
   * Fixed card width. Omit (or pass null) when the card sits inside an
   * already-sized container (e.g. grid cells) — it will then stretch to
   * 100% of that container instead.
   */
  width?: number | null;
  /** Unread chapter count — renders the crimson iOS-style badge when > 0 */
  badgeCount?: number;
};

const typeLabel: Record<Manga['type'], string> = {
  manga: 'Manga',
  manhwa: 'Manhwa',
  manhua: 'Manhua',
};

export function MangaCard({ manga, onPress, onLongPress, width = 130, badgeCount = 0 }: Props) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      // Horizontal carousels and unbounded parents collapse percentage widths,
      // so only fall back to 100% when the caller guarantees a sized container.
      style={({ pressed }) => [
        { width: width ?? '100%', opacity: pressed ? 0.85 : 1 },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Open ${manga.title}${manga.latestChapter != null ? `, ${manga.latestChapter} chapters` : ''}`}
    >
      <View style={[styles.coverWrap, { width: '100%', aspectRatio: 2 / 3 }]}>
        <Image source={{ uri: manga.coverUrl }} style={styles.cover} />
        <View style={styles.typeBadge}>
          <Text style={styles.typeBadgeText}>{typeLabel[manga.type]}</Text>
        </View>
        {badgeCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badgeCount > 99 ? '99+' : badgeCount}</Text>
          </View>
        )}
      </View>
      <Text style={styles.title} numberOfLines={2}>{manga.title}</Text>
      {manga.latestChapter != null && (
        <Text style={styles.chapter}>Ch. {manga.latestChapter}</Text>
      )}
    </Pressable>
  );
}

// Small square-ish cover used by list rows — kept on MangaCard so cover
// treatment (radius, placeholder bg) stays consistent across layouts.
MangaCard.ListCover = function ListCover({ uri }: { uri: string }) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  return (
    <View style={styles.listCover}>
      <Image source={{ uri }} style={styles.cover} />
    </View>
  );
};

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  coverWrap: {
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.surfaceRaised,
  },
  cover: {
    width: '100%',
    height: '100%',
  },
  typeBadge: {
    position: 'absolute',
    bottom: space.xs,
    left: space.xs,
    backgroundColor: colors.overlayPanel,
    paddingHorizontal: space.sm - space.xs,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  typeBadgeText: {
    ...type.micro,
    color: colors.text,
    textTransform: 'uppercase',
  },
  badge: {
    position: 'absolute',
    top: space.xs,
    right: space.xs,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.bg,
  },
  badgeText: {
    // White on danger-red is a fixed contrast pairing (like iOS badges) —
    // intentionally identical in both schemes.
    fontSize: BADGE_FONT_SIZE,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  listCover: {
    width: 48,
    height: 72,
    borderRadius: radius.smMd,
    overflow: 'hidden',
    backgroundColor: colors.surfaceRaised,
  },
  title: {
    ...type.caption,
    color: colors.text,
    marginTop: space.sm - space.xs,
    marginBottom: space.xxs,
  },
  chapter: {
    ...type.micro,
    color: colors.textFaint,
  },
});
