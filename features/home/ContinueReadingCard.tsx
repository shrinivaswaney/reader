import { ContinueReadingItem } from '@/types/manga.types';
import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { radius, space, type, ThemeColors } from '@/constants/theme';
import { useTheme } from '@/providers/theme-provider';
import { ProgressRing } from '@/components/ui/ProgressRing';

type Props = {
  item: ContinueReadingItem;
  onPress?: () => void;
};

export function ContinueReadingCard({ item, onPress }: Props) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const progress = item.totalPagesInChapter > 0 ? item.lastPage / item.totalPagesInChapter : 0;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, { opacity: pressed ? 0.85 : 1 }]}>
      <View style={styles.ringWrap}>
        <ProgressRing progress={progress} size={64} />
        <Image source={{ uri: item.coverUrl }} style={styles.cover} />
      </View>
      <View style={styles.textWrap}>
        <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.meta}>Chapter {item.lastChapter} · {Math.round(progress * 100)}% read</Text>
      </View>
    </Pressable>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: space.sm,
    marginBottom: space.sm,
    gap: space.md,
  },
  ringWrap: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cover: {
    position: 'absolute',
    width: 52,
    height: 52,
    borderRadius: radius.pill,
  },
  textWrap: {
    flex: 1,
  },
  title: {
    ...type.bodyLg,
    color: colors.text,
    marginBottom: space.xxs,
  },
  meta: {
    ...type.caption,
    color: colors.textMuted,
  },
});