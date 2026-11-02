import React from 'react';
import { View, Text, Pressable, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Chapter } from '@/types/manga.types';
import { type, space, radius, ThemeColors } from '@/constants/theme';
import { useTheme } from '@/providers/theme-provider';

type Props = {
  direction: 'previous' | 'next';
  chapter?: Chapter;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
};

// Used both in the reader's bottom overlay (compact) and the end-of-chapter
// prompt — same component, so the two contexts don't drift out of sync.
export function ChapterNavCard({ direction, chapter, onPress, style }: Props) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const disabled = !chapter;
  const isNext = direction === 'next';

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        isNext && styles.cardReversed,
        disabled && styles.cardDisabled,
        pressed && !disabled && styles.cardPressed,
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={chapter ? `Go to ${isNext ? 'next' : 'previous'} chapter, chapter ${chapter.number}` : `No ${isNext ? 'next' : 'previous'} chapter`}
      accessibilityState={{ disabled }}
    >
      <Text style={[styles.arrow, disabled && styles.textDisabled]}>{isNext ? '›' : '‹'}</Text>
      <View style={isNext ? styles.textWrapRight : styles.textWrapLeft}>
        <Text style={[styles.label, disabled && styles.textDisabled]}>
          {isNext ? 'Next' : 'Previous'}
        </Text>
        <Text style={[styles.chapterText, disabled && styles.textDisabled]} numberOfLines={1}>
          {chapter ? `Chapter ${chapter.number}` : 'None'}
        </Text>
      </View>
    </Pressable>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  card: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.hairline,
    paddingVertical: space.sm,
    paddingHorizontal: space.md,
    gap: space.xs,
  },
  cardPressed: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
  },
  cardReversed: {
    flexDirection: 'row-reverse',
  },
  cardDisabled: {
    opacity: 0.4,
  },
  arrow: {
    ...type.displayMd,
    color: colors.accent,
  },
  textWrapLeft: {
    alignItems: 'flex-start',
  },
  textWrapRight: {
    alignItems: 'flex-end',
    flex: 1,
  },
  label: {
    ...type.micro,
    color: colors.textFaint,
    textTransform: 'uppercase',
  },
  chapterText: {
    ...type.caption,
    color: colors.text,
    fontWeight: '600',
  },
  textDisabled: {
    color: colors.textFaint,
  },
});