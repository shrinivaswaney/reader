import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { type, space, radius, ThemeColors } from '@/constants/theme';
import { useTheme, type ThemePreference } from '@/providers/theme-provider';
import { useReadingPreferences } from '@/providers/reading-preferences-provider';
import { libraryEntries } from '@/mocks/dummyLibrary';

const settingsRows: { label: string; hint?: string; route?: '/settings/reading' }[] = [
  { label: 'Account', hint: 'Not signed in' },
  { label: 'Notifications', hint: 'On' },
  { label: 'Reading preferences', route: '/settings/reading' },
  { label: 'About Blossom' },
];

const appearanceOptions: { value: ThemePreference; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

export default function ProfileScreen() {
  const { colors, preference, setPreference } = useTheme();
  const { prefs } = useReadingPreferences();
  const styles = makeStyles(colors);
  const router = useRouter();
  const totalTitles = libraryEntries.length;
  const reading = libraryEntries.filter((e) => e.status === 'reading').length;
  const completed = libraryEntries.filter((e) => e.status === 'completed').length;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: space.xxl }} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarInitial}>?</Text>
          </View>
          <Text style={styles.name}>Not signed in</Text>
          <Text style={styles.subtitle}>Sign in to sync your library across devices</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{totalTitles}</Text>
            <Text style={styles.statLabel}>Titles</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{reading}</Text>
            <Text style={styles.statLabel}>Reading</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{completed}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>

        <View style={styles.themeSection}>
          <Text style={styles.themeLabel}>APPEARANCE</Text>
          <View style={styles.segRow}>
            {appearanceOptions.map(({ value, label }) => {
              const active = preference === value;
              return (
                <Pressable
                  key={value}
                  style={[styles.segOption, active && styles.segOptionActive]}
                  onPress={() => setPreference(value)}
                >
                  <Text style={[styles.segText, active && styles.segTextActive]}>{label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.settingsList}>
          {settingsRows.map((row) => {
            const isReadingPrefs = row.label === 'Reading preferences';
            const hint = isReadingPrefs
              ? `${prefs.direction === 'rtl' ? 'Right-to-left' : 'Vertical'} · ${prefs.tapZones === 'left-handed' ? 'Left-handed zones' : 'Standard zones'}`
              : row.hint;
            return (
              <Pressable
                key={row.label}
                style={({ pressed }) => [styles.settingsRow, pressed && row.route && styles.settingsRowPressed]}
                onPress={row.route ? () => router.push(row.route!) : undefined}
              >
                <Text style={styles.settingsLabel}>{row.label}</Text>
                <View style={styles.settingsRight}>
                  {!!hint && <Text style={styles.settingsHint}>{hint}</Text>}
                  <Text style={styles.chevron}>›</Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    alignItems: 'center',
    paddingTop: space.xl,
    paddingBottom: space.lg,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceRaised,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.sm,
  },
  avatarInitial: {
    ...type.displayMd,
    color: colors.textFaint,
  },
  name: {
    ...type.displayMd,
    color: colors.text,
    marginBottom: space.xxs,
  },
  subtitle: {
    ...type.caption,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: space.xl,
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: space.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: space.md,
    marginBottom: space.xl,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    ...type.displayMd,
    color: colors.accent,
  },
  statLabel: {
    ...type.caption,
    color: colors.textMuted,
    marginTop: space.xxs,
  },
  themeSection: {
    marginHorizontal: space.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: space.md,
    marginBottom: space.xl,
  },
  themeLabel: {
    ...type.micro,
    color: colors.textFaint,
    marginBottom: space.sm,
  },
  segRow: {
    flexDirection: 'row',
    gap: space.xs,
  },
  segOption: {
    flex: 1,
    paddingVertical: space.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center',
  },
  segOptionActive: {
    backgroundColor: colors.accentSoft,
  },
  segText: {
    ...type.caption,
    color: colors.textMuted,
  },
  segTextActive: {
    ...type.caption,
    color: colors.accent,
    fontWeight: '600',
  },
  settingsList: {
    marginHorizontal: space.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.md,
    paddingVertical: space.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.hairline,
  },
  settingsRowPressed: {
    backgroundColor: colors.surfaceRaised,
  },
  settingsLabel: {
    ...type.body,
    color: colors.text,
  },
  settingsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
  },
  settingsHint: {
    ...type.caption,
    color: colors.textFaint,
  },
  chevron: {
    ...type.body,
    color: colors.textFaint,
  },
});
