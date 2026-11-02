import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Home, BookOpen, Settings, Flag } from 'lucide-react-native';
import { radius, space, ThemeColors } from '@/constants/theme';
import { useTheme } from '@/providers/theme-provider';

type Props = {
  onHome: () => void;
  onChapters: () => void;
  onSettings: () => void;
  onReport: () => void;
};

// Vertical action strip hugging the right edge, centered along the screen
// height — thumb-reach territory without ever covering the page's center.
export function ReaderMenuRail({ onHome, onChapters, onSettings, onReport }: Props) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const items = [
    { icon: Home, onPress: onHome, label: 'Go to home tab' },
    { icon: BookOpen, onPress: onChapters, label: 'Open chapter list' },
    { icon: Settings, onPress: onSettings, label: 'Open reader settings' },
    { icon: Flag, onPress: onReport, label: 'Report an issue with this chapter' },
  ];

  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      <View style={styles.rail}>
        {items.map(({ icon: Icon, onPress, label }, i) => (
          <Pressable
            key={i}
            onPress={onPress}
            style={styles.item}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel={label}
          >
            <Icon color={colors.text} size={20} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    wrapper: {
      position: 'absolute',
      right: space.sm,
      top: 0,
      bottom: 0,
      justifyContent: 'center',
    },
    rail: {
      backgroundColor: colors.overlayPanel,
      borderRadius: radius.pill,
      borderWidth: 1,
      borderColor: colors.overlayBorder,
      paddingVertical: space.sm,
      gap: space.md,
    },
    item: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
