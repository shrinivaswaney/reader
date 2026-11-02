import { radius, space, ThemeColors } from '@/constants/theme';
import { useTheme } from '@/providers/theme-provider';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const glassAvailable = isLiquidGlassAvailable();

// Spring tuned for a "glide through" feel — soft enough to look seamless
// crossing multiple tabs, stiff enough to not feel laggy on adjacent hops.
const SLIDE_SPRING = { damping: 20, stiffness: 200, mass: 0.9 };

export function GlassTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrapper, { bottom: insets.bottom + space.md }]} pointerEvents="box-none">
      {glassAvailable ? (
        <GlassView style={styles.bar} glassEffectStyle="regular" tintColor={colors.surface}>
          <TabRow state={state} descriptors={descriptors} navigation={navigation} />
        </GlassView>
      ) : (
        <View style={[styles.bar, styles.fallbackBar]}>
          <TabRow state={state} descriptors={descriptors} navigation={navigation} />
        </View>
      )}
    </View>
  );
}

function TabRow({ state, descriptors, navigation }: Pick<BottomTabBarProps, 'state' | 'descriptors' | 'navigation'>) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const [rowWidth, setRowWidth] = useState(0);
  const count = state.routes.length;
  const segmentWidth = count > 0 ? rowWidth / count : 0;

  // One shared slider for the whole row — it physically travels between tab
  // positions instead of each tab fading its own highlight in/out.
  const slideX = useSharedValue(0);

  useEffect(() => {
    if (!segmentWidth) return;
    slideX.value = withSpring(state.index * segmentWidth, SLIDE_SPRING);
  }, [state.index, segmentWidth, slideX]);

  const sliderStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: slideX.value }],
  }));

  return (
    <View style={styles.row} onLayout={(e) => setRowWidth(e.nativeEvent.layout.width)}>
      {segmentWidth > 0 && (
        <Animated.View pointerEvents="none" style={[styles.sliderSegment, { width: segmentWidth }, sliderStyle]}>
          <View style={styles.sliderPill} />
        </Animated.View>
      )}
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        const Icon = options.tabBarIcon;

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TabButton key={route.key} onPress={onPress}>
            {Icon?.({ color: isFocused ? colors.accent : colors.textFaint, size: 22, focused: isFocused })}
          </TabButton>
        );
      })}
    </View>
  );
}

function TabButton({ onPress, children }: { onPress: () => void; children: React.ReactNode }) {
  const styles = makeStyles(useTheme().colors);
  return (
    <Pressable
      onPress={onPress}
      style={styles.tabButton}
      hitSlop={8}
      accessibilityRole="tab"
    >
      <View style={styles.iconWrap}>{children}</View>
    </Pressable>
  );
}

const BAR_HEIGHT = 52;

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: space.lg,
    right: space.lg,
    alignItems: 'center',
  },
  bar: {
    width: '100%',
    height: BAR_HEIGHT,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  fallbackBar: {
    // Flat tinted fallback for iOS <26 / Android — no native glass available there
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.hairline,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sliderSegment: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderPill: {
    width: 84,
    height: BAR_HEIGHT,
    borderRadius: radius.pill,
    backgroundColor: colors.accentSoft,
  },
  tabButton: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
