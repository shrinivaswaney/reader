import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { type, space, radius, ThemeColors } from '@/constants/theme';
import { useTheme } from '@/providers/theme-provider';
import { useReadingPreferences } from '@/providers/reading-preferences-provider';
import type {
  NotchBehavior,
  OrientationLockPref,
  ReadingDirection,
  TapZoneLayout,
} from '@/features/reader/reading-preferences';

// --- Small composable setting primitives -----------------------------------

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

function Row({
  label,
  caption,
  children,
}: {
  label: string;
  caption?: string;
  children?: React.ReactNode;
}) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  return (
    <View style={styles.row}>
      <View style={styles.rowText}>
        <Text style={styles.rowLabel}>{label}</Text>
        {!!caption && <Text style={styles.rowCaption}>{caption}</Text>}
      </View>
      {children}
    </View>
  );
}

function ToggleRow({
  label,
  caption,
  value,
  onChange,
  disabled,
}: {
  label: string;
  caption?: string;
  value: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <Row label={label} caption={caption}>
      <Switch
        value={value}
        onValueChange={onChange}
        disabled={disabled}
        trackColor={{ false: colors.hairline, true: colors.accentMuted }}
        thumbColor={value ? colors.accent : colors.textFaint}
      />
    </Row>
  );
}

function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  return (
    <View style={styles.segRow}>
      {options.map(({ value: v, label }) => {
        const active = v === value;
        return (
          <Pressable
            key={v}
            style={[styles.segOption, active && styles.segOptionActive]}
            onPress={() => onChange(v)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
          >
            <Text style={[styles.segLabel, active && styles.segLabelActive]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// --- The screen --------------------------------------------------------------

export function ReadingPreferencesScreen() {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const router = useRouter();
  const { prefs, update } = useReadingPreferences();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Back to profile"
        >
          <ChevronLeft color={colors.text} size={22} />
        </Pressable>
        <Text style={styles.headerTitle}>Reading Preferences</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: space.xxl }} showsVerticalScrollIndicator={false}>
        <SectionCard title="LAYOUT & READING DIRECTION">
          <Row
            label="Direction"
            caption={
              prefs.direction === 'vertical'
                ? 'Infinite vertical scroll — best for webtoons and one-handed reading.'
                : 'Paginated right-to-left — standard manga volumes, swipe like turning pages.'
            }
          />
          <View style={styles.indented}>
            <Segmented<ReadingDirection>
              options={[
                { value: 'vertical', label: 'Vertical' },
                { value: 'rtl', label: 'Right-to-Left' },
              ]}
              value={prefs.direction}
              onChange={(v) => update({ direction: v })}
            />
          </View>
          <ToggleRow
            label="Split double-page spreads"
            caption="Wide print spreads get sliced into two stacked pages so text stays readable."
            value={prefs.splitSpreads}
            onChange={(v) => update({ splitSpreads: v })}
          />
        </SectionCard>

        <SectionCard title="TOUCH & NAVIGATION">
          <Row
            label="Tap zones"
            caption={
              prefs.direction === 'rtl'
                ? 'Left edge goes forward, right edge goes back. Center opens the menu.'
                : 'Right edge scrolls forward, left edge scrolls back. Center opens the menu.'
            }
          />
          <View style={styles.indented}>
            <Segmented<TapZoneLayout>
              options={[
                { value: 'standard', label: 'Standard' },
                { value: 'left-handed', label: 'Left-handed' },
              ]}
              value={prefs.tapZones}
              onChange={(v) => update({ tapZones: v })}
            />
          </View>
          <ToggleRow
            label="Volume key navigation"
            caption="Turn pages with the physical volume buttons. Requires a custom build — not available yet."
            value={prefs.volumeKeyNavigation}
            onChange={() => {}}
            disabled
          />
          <Row
            label="Lock orientation"
            caption={
              prefs.orientationLock === 'system'
                ? 'Follows your system auto-rotate setting.'
                : `Forced ${prefs.orientationLock} while reading.`
            }
          />
          <View style={styles.indented}>
            <Segmented<OrientationLockPref>
              options={[
                { value: 'system', label: 'System' },
                { value: 'portrait', label: 'Portrait' },
                { value: 'landscape', label: 'Landscape' },
              ]}
              value={prefs.orientationLock}
              onChange={(v) => update({ orientationLock: v })}
            />
          </View>
        </SectionCard>

        <SectionCard title="SCREEN & DISPLAY">
          <ToggleRow
            label="True black (AMOLED)"
            caption="Pure black backgrounds in dark mode — pixels turn fully off on OLED screens."
            value={prefs.amoledMode}
            onChange={(v) => update({ amoledMode: v })}
          />
          <Row
            label="Camera cutout"
            caption={
              prefs.notchBehavior === 'cutout'
                ? 'Artwork starts below the notch.'
                : 'Artwork extends edge-to-edge beneath the notch.'
            }
          />
          <View style={styles.indented}>
            <Segmented<NotchBehavior>
              options={[
                { value: 'cutout', label: 'Cut off' },
                { value: 'extend', label: 'Extend artwork' },
              ]}
              value={prefs.notchBehavior}
              onChange={(v) => update({ notchBehavior: v })}
            />
          </View>
        </SectionCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: space.md,
      paddingVertical: space.sm,
      gap: space.sm,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surfaceRaised,
    },
    headerTitle: {
      ...type.displayMd,
      color: colors.text,
      flex: 1,
    },
    headerSpacer: {
      width: 40,
    },
    section: {
      marginHorizontal: space.lg,
      marginBottom: space.xl,
    },
    sectionTitle: {
      ...type.micro,
      color: colors.textFaint,
      marginBottom: space.xs,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      paddingHorizontal: space.md,
      paddingVertical: space.xs,
    },
    row: {
      paddingVertical: space.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.hairline,
      gap: space.xs,
    },
    rowText: {
      gap: space.xxs,
    },
    rowLabel: {
      ...type.body,
      color: colors.text,
    },
    rowCaption: {
      ...type.caption,
      color: colors.textFaint,
    },
    indented: {
      paddingBottom: space.md,
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
    segLabel: {
      ...type.caption,
      color: colors.textMuted,
    },
    segLabelActive: {
      ...type.caption,
      color: colors.accent,
      fontWeight: '600',
    },
  });
