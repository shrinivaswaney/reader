import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Chapter } from '@/types/manga.types';
import { type, space, ThemeColors } from '@/constants/theme';
import { useTheme } from '@/providers/theme-provider';

type Props = {
  chapter: Chapter;
  onPress?: () => void;
};

export function ChapterRow({ chapter, onPress }: Props) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const date = new Date(chapter.releasedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, { opacity: pressed ? 0.7 : 1 }]}
    >
      <View style={[styles.dot, chapter.isRead ? styles.dotRead : styles.dotUnread]} />
      <Text style={[styles.title, !chapter.isRead && styles.titleUnread]}>
        Chapter {chapter.number}
      </Text>
      <Text style={styles.date}>{date}</Text>
    </Pressable>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: space.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.hairline,
    gap: space.sm,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotRead: {
    backgroundColor: 'transparent',
  },
  dotUnread: {
    backgroundColor: colors.accent,
  },
  title: {
    ...type.body,
    color: colors.textMuted,
    flex: 1,
  },
  titleUnread: {
    color: colors.text,
    fontWeight: '600',
  },
  date: {
    ...type.caption,
    color: colors.textFaint,
  },
});