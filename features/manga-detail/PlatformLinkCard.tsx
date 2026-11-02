import React from 'react';
import { View, Text, Pressable, Linking, StyleSheet } from 'react-native';
import { PlatformLink } from '@/types/manga.types';
import { type, space, radius, ThemeColors } from '@/constants/theme';
import { useTheme } from '@/providers/theme-provider';

type Props = {
  link: PlatformLink;
};

export function PlatformLinkCard({ link }: Props) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  return (
    <Pressable
      style={({ pressed }) => [styles.card, { opacity: pressed ? 0.8 : 1 }]}
      onPress={() => Linking.openURL(link.url)}
    >
      <View style={styles.iconCircle}>
        <Text style={styles.iconLetter}>{link.platformName.charAt(0)}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{link.platformName}</Text>
        <Text style={styles.meta}>
          {link.kind === 'read' ? 'Read' : 'Watch'}
          {link.isOfficial ? ' · Official' : ''}
        </Text>
      </View>
      <Text style={styles.chevron}>↗</Text>
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
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLetter: {
    ...type.bodyLg,
    color: colors.textMuted,
  },
  info: {
    flex: 1,
  },
  name: {
    ...type.body,
    color: colors.text,
  },
  meta: {
    ...type.caption,
    color: colors.textMuted,
  },
  chevron: {
    ...type.body,
    color: colors.textFaint,
  },
});