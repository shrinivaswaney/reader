import MangaList from '@/components/manga/MangaList';
import { continueReading } from '@/data/mockLibrary';
import { getGreeting, getProgress } from '@/utils/utility';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SectionHeader } from './SectionHeader';

export default function Home() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>{getGreeting().toUpperCase()}</Text>
          <Text style={styles.headerTitle}>Reader</Text>
        </View>

        {/* Continue Reading — real history persisted locally by the reader */}
        {continueReading.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title="Continue Reading" />
            <View style={{ paddingHorizontal: 24, display: 'flex', flexDirection: 'row' }}>
              <MangaList
              mangas={continueReading}
              onPress={() => console.log('Pressed')}
              progress={(i) => {return getProgress(continueReading[i])}}
               />
            </View>
          </View>
        )}

        {/* Trending — live MangaDex data, sorted by follow count */}
        <View style={styles.section}>
          <SectionHeader title="Trending" subtitle="Trending now" />
          {/* <MangaCarousel
            data={trending.data}
            isLoading={trending.isLoading}
            isError={trending.isError}
            onRetry={() => trending.refetch()}
            onPressManga={openManga}
          /> */}
        </View>

        {/* New Releases — live MangaDex data, sorted by creation date */}
        <View style={styles.section}>
          <SectionHeader title="Latest Updates" subtitle="Fresh Chapters" />
          {/* <MangaCarousel
            data={trending.data}
            isLoading={trending.isLoading}
            isError={trending.isError}
            onRetry={() => trending.refetch()}
            onPressManga={openManga}
          /> */}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollContent: {
    paddingBottom: 64,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
  },
  greeting: {
    color: '#FFF',
    letterSpacing: 2,
    marginTop: 7,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700' as const,
    letterSpacing: -0.6,
    color: '#5A5F6E',
  },
  section: {
    marginBottom: 40,
  },
});
