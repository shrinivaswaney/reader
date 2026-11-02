'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from '@/providers/theme-provider';
import { ReadingPreferencesProvider } from '@/providers/reading-preferences-provider';
import { ReadingProgressProvider } from '@/providers/reading-progress-provider';
import { type, space, radius } from '@/constants/theme';

// Catches render errors in any route below the root layout so a single bad
// screen can never white-screen the whole app. Deliberately uses literal
// colors — it must render even if the provider/theme layer itself crashed.
export function ErrorBoundary({ error, retry }: { error: Error; retry: () => void }) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <Text style={styles.title}>Something went wrong</Text>
        <Text style={styles.message} numberOfLines={4}>
          {error.message}
        </Text>
        <Pressable style={styles.retryButton} onPress={retry}>
          <Text style={styles.retryText}>Try again</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function RootNavigator() {
  const { colors, scheme } = useTheme();

  return (
    <>
      {/* 'auto' would follow the OS; follow OUR resolved scheme instead so a
          manual override in Profile restyles the status bar too */}
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
        <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="settings/reading" options={{ presentation: 'card' }} />
        <Stack.Screen name="manga/[id]" options={{ presentation: 'card' }} />
        <Stack.Screen
          name="reader/[mangaId]/[chapterId]"
          options={{ presentation: 'fullScreenModal', animation: 'fade' }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 2,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <ReadingPreferencesProvider>
      <ReadingProgressProvider>
        <ThemeProvider>
          <QueryClientProvider client={queryClient}>
            <RootNavigator />
          </QueryClientProvider>
        </ThemeProvider>
      </ReadingProgressProvider>
    </ReadingPreferencesProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#04060B',
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
    color: '#DCE7FF',
    textAlign: 'center',
  },
  message: {
    ...type.body,
    color: '#F87171',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#4D8DFF',
    borderRadius: radius.pill,
    paddingHorizontal: space.lg,
    paddingVertical: space.sm + space.xs,
    marginTop: space.sm,
  },
  retryText: {
    ...type.bodyLg,
    color: '#04060B',
    fontWeight: '600',
  },
});
