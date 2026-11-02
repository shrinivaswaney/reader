import { Link, Stack } from 'expo-router';
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { type, space, radius, ThemeColors } from '@/constants/theme';
import { useTheme } from '@/providers/theme-provider';

// Rendered for any URL that doesn't match a route (bad deep link, stale
// notification payload). Keeps navigation state valid instead of crashing.
export default function NotFoundScreen() {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  return (
    <>
      <Stack.Screen options={{ presentation: 'modal' }} />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.container}>
          <Text style={styles.title}>Page not found</Text>
          <Text style={styles.message}>
            The page you were looking for doesn&apos;t exist or has moved.
          </Text>
          <Link href="/(tabs)" asChild>
            <Pressable style={styles.homeButton}>
              <Text style={styles.homeText}>Go home</Text>
            </Pressable>
          </Link>
        </View>
      </SafeAreaView>
    </>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    paddingHorizontal: space.xl,
  },
  title: {
    ...type.displayMd,
    color: colors.text,
    textAlign: 'center',
  },
  message: {
    ...type.body,
    color: colors.textMuted,
    textAlign: 'center',
  },
  homeButton: {
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    paddingHorizontal: space.lg,
    paddingVertical: space.sm + space.xs,
    marginTop: space.sm,
  },
  homeText: {
    ...type.bodyLg,
    color: colors.bg,
    fontWeight: '600',
  },
});
