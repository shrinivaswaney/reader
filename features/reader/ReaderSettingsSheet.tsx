import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, Modal, StyleSheet, Platform } from 'react-native';
import Slider from '@react-native-community/slider';
import * as Brightness from 'expo-brightness';
import { X, Smartphone, BookOpenText, GalleryVerticalEnd, Minus, Plus } from 'lucide-react-native';
import { type, space, radius, ThemeColors } from '@/constants/theme';
import { useTheme } from '@/providers/theme-provider';
import { ReaderSettings } from './reader-settings';

// App-level brightness override. Saves the system value when the sheet opens
// and restores it on dismiss/unmount — the OS setting is never left changed.
function useBrightnessOverride(visible: boolean) {
  const [percent, setPercent] = useState<number | null>(null);
  const systemValueRef = useRef<number | null>(null);
  const supported = Platform.OS === 'ios' || Platform.OS === 'android';

  useEffect(() => {
    if (!visible || !supported) return;
    let cancelled = false;
    Brightness.getBrightnessAsync()
      .then((v) => {
        if (cancelled) return;
        systemValueRef.current = v;
        setPercent(Math.round(v * 100));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [visible, supported]);

  useEffect(() => {
    if (visible || !supported) return;
    // Sheet just closed (or unmounted): hand control back to the system.
    if (systemValueRef.current != null) {
      Brightness.setBrightnessAsync(systemValueRef.current).catch(() => {});
      systemValueRef.current = null;
    }
    setPercent(null);
  }, [visible, supported]);

  const apply = (p: number) => {
    setPercent(p);
    if (supported) Brightness.setBrightnessAsync(Math.min(1, Math.max(0.1, p / 100))).catch(() => {});
  };

  return { percent, apply, supported };
}

type Props = {
  visible: boolean;
  onClose: () => void;
  settings: ReaderSettings;
  onChange: (patch: Partial<ReaderSettings>) => void;
};

type Tab = 'layout' | 'image';

export function ReaderSettingsSheet({ visible, onClose, settings, onChange }: Props) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const [tab, setTab] = useState<Tab>('layout');
  const brightness = useBrightnessOverride(visible);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.grabber} />
      <View style={styles.header}>
          <View style={styles.tabRow}>
            <Pressable onPress={() => setTab('layout')}>
              <Text style={[styles.tabText, tab === 'layout' && styles.tabTextActive]}>Layout</Text>
            </Pressable>
            <Pressable onPress={() => setTab('image')}>
              <Text style={[styles.tabText, tab === 'image' && styles.tabTextActive]}>Image</Text>
            </Pressable>
          </View>
          <Pressable onPress={onClose} hitSlop={8}>
            <X color={colors.textFaint} size={20} />
          </Pressable>
        </View>

        {tab === 'layout' ? (
          <LayoutTab settings={settings} onChange={onChange} />
        ) : (
          <ImageTab settings={settings} onChange={onChange} brightness={brightness} />
        )}
      </View>
    </Modal>
  );
}

function LayoutTab({ settings, onChange }: Pick<Props, 'settings' | 'onChange'>) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  return (
    <View>
      <Text style={styles.sectionLabel}>LAYOUT</Text>
      <View style={styles.layoutRow}>
        <LayoutOption icon={Smartphone} label="Single" disabled />
        <LayoutOption icon={BookOpenText} label="Double" disabled />
        <LayoutOption icon={GalleryVerticalEnd} label="Long strip" selected />
      </View>
      <Text style={styles.stubNote}>Single/Double page layouts are coming soon — Long strip is the only mode right now.</Text>

      <Text style={styles.sectionLabel}>MARGIN</Text>
      <View style={styles.stepperRow}>
        <Pressable
          style={styles.stepperButton}
          onPress={() => onChange({ margin: Math.max(0, settings.margin - 4) })}
        >
          <Minus color={colors.text} size={16} />
        </Pressable>
        <Text style={styles.stepperValue}>{settings.margin}</Text>
        <Pressable
          style={styles.stepperButton}
          onPress={() => onChange({ margin: Math.min(40, settings.margin + 4) })}
        >
          <Plus color={colors.text} size={16} />
        </Pressable>
        <Pressable style={styles.resetButton} onPress={() => onChange({ margin: 0 })}>
          <Text style={styles.resetButtonText}>Reset</Text>
        </Pressable>
      </View>

      <Text style={styles.sectionLabel}>PROGRESS BAR</Text>
      <View style={styles.toggleRow}>
        <Pressable
          style={[styles.pillOption, settings.showProgressBar && styles.pillOptionActive]}
          onPress={() => onChange({ showProgressBar: true })}
        >
          <Text style={[styles.pillOptionText, settings.showProgressBar && styles.pillOptionTextActive]}>Show</Text>
        </Pressable>
        <Pressable
          style={[styles.pillOption, !settings.showProgressBar && styles.pillOptionActive]}
          onPress={() => onChange({ showProgressBar: false })}
        >
          <Text style={[styles.pillOptionText, !settings.showProgressBar && styles.pillOptionTextActive]}>Hide</Text>
        </Pressable>
      </View>

      <Text style={styles.sectionLabel}>SHOW CONTROLS</Text>
      <View style={styles.toggleRow}>
        <Pressable
          style={[styles.pillOption, settings.tapMode === 'single' && styles.pillOptionActive]}
          onPress={() => onChange({ tapMode: 'single' })}
        >
          <Text style={[styles.pillOptionText, settings.tapMode === 'single' && styles.pillOptionTextActive]}>Single tap</Text>
        </Pressable>
        <Pressable
          style={[styles.pillOption, settings.tapMode === 'double' && styles.pillOptionActive]}
          onPress={() => onChange({ tapMode: 'double' })}
        >
          <Text style={[styles.pillOptionText, settings.tapMode === 'double' && styles.pillOptionTextActive]}>Double tap</Text>
        </Pressable>
      </View>
    </View>
  );
}

function ImageTab(
  {
    settings,
    onChange,
    brightness,
  }: Pick<Props, 'settings' | 'onChange'> & {
    brightness: { percent: number | null; apply: (p: number) => void; supported: boolean };
  }
) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  return (
    <View>
      <Text style={styles.sectionLabel}>IMAGE SIZING</Text>
      <CheckRow
        label="Fit width"
        checked={settings.fitMode === 'width'}
        onPress={() => onChange({ fitMode: 'width' })}
      />
      <CheckRow
        label="Fit height"
        checked={settings.fitMode === 'height'}
        onPress={() => onChange({ fitMode: 'height' })}
      />

      <Text style={styles.sectionLabel}>IMAGE COLORING</Text>
      <CheckRow
        label="Grayscale (visual not yet applied)"
        checked={settings.grayscale}
        onPress={() => onChange({ grayscale: !settings.grayscale })}
      />

      <Text style={styles.sectionLabel}>DIM SCREEN — {settings.dimPercent}%</Text>
      <View style={styles.dimRow}>
        <Pressable
          style={styles.stepperButton}
          onPress={() => onChange({ dimPercent: Math.max(0, settings.dimPercent - 10) })}
        >
          <Minus color={colors.text} size={16} />
        </Pressable>
        <View style={styles.dimTrack}>
          <View style={[styles.dimFill, { width: `${settings.dimPercent}%` }]} />
        </View>
        <Pressable
          style={styles.stepperButton}
          onPress={() => onChange({ dimPercent: Math.min(90, settings.dimPercent + 10) })}
        >
          <Plus color={colors.text} size={16} />
        </Pressable>
      </View>

      {brightness.supported && (
        <>
          <Text style={styles.sectionLabel}>
            APP BRIGHTNESS{brightness.percent != null ? ` — ${brightness.percent}%` : ''}
          </Text>
          {brightness.percent != null && (
            <Slider
              minimumValue={10}
              maximumValue={100}
              step={1}
              value={brightness.percent}
              onValueChange={brightness.apply}
              minimumTrackTintColor={colors.accent}
              maximumTrackTintColor={colors.hairline}
              thumbTintColor={colors.text}
              accessibilityLabel="App brightness"
            />
          )}
          <Text style={styles.stubNote}>System brightness is restored when this sheet closes.</Text>
        </>
      )}
    </View>
  );
}

function LayoutOption({ icon: Icon, label, selected, disabled }: { icon: any; label: string; selected?: boolean; disabled?: boolean }) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  return (
    <View style={[styles.layoutOption, selected && styles.layoutOptionActive, disabled && styles.layoutOptionDisabled]}>
      <Icon color={selected ? colors.accent : disabled ? colors.textFaint : colors.textMuted} size={22} />
      <Text style={[styles.layoutOptionText, selected && styles.layoutOptionTextActive, disabled && styles.layoutOptionTextDisabled]}>
        {label}
      </Text>
    </View>
  );
}

function CheckRow({ label, checked, onPress }: { label: string; checked: boolean; onPress: () => void }) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  return (
    <Pressable style={[styles.checkRow, checked && styles.checkRowActive]} onPress={onPress}>
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked && <Text style={styles.checkboxMark}>✓</Text>}
      </View>
      <Text style={[styles.checkLabel, checked && styles.checkLabelActive]}>{label}</Text>
    </Pressable>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: colors.scrim },
  sheet: {
    backgroundColor: colors.surfaceRaised,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingHorizontal: space.lg,
    paddingTop: space.lg,
    paddingBottom: space.xl,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: space.lg,
  },
  grabber: {
    alignSelf: 'center',
    width: 36,
    height: 5,
    borderRadius: radius.pill,
    backgroundColor: colors.hairline,
    marginTop: space.xs,
    marginBottom: space.md,
  },
  tabRow: {
    flexDirection: 'row',
    gap: space.lg,
  },
  tabText: {
    ...type.bodyLg,
    color: colors.textFaint,
  },
  tabTextActive: {
    color: colors.accent,
    fontWeight: '600',
  },
  sectionLabel: {
    ...type.micro,
    color: colors.textFaint,
    marginBottom: space.sm,
    marginTop: space.md,
  },
  layoutRow: {
    flexDirection: 'row',
    gap: space.sm,
  },
  layoutOption: {
    flex: 1,
    alignItems: 'center',
    gap: space.xs,
    paddingVertical: space.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  layoutOptionActive: {
    backgroundColor: colors.accentSoft,
  },
  layoutOptionDisabled: {
    opacity: 0.4,
  },
  layoutOptionText: {
    ...type.caption,
    color: colors.textMuted,
  },
  layoutOptionTextActive: {
    color: colors.accent,
    fontWeight: '600',
  },
  layoutOptionTextDisabled: {
    color: colors.textFaint,
  },
  stubNote: {
    ...type.micro,
    color: colors.textFaint,
    marginTop: space.xs,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
  stepperButton: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: {
    ...type.bodyLg,
    color: colors.text,
    minWidth: 24,
    textAlign: 'center',
  },
  resetButton: {
    marginLeft: 'auto',
    paddingHorizontal: space.md,
    paddingVertical: space.xs,
    borderRadius: radius.md,
    backgroundColor: colors.accentSoft,
  },
  resetButtonText: {
    ...type.caption,
    color: colors.accent,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: space.xs,
  },
  pillOption: {
    flex: 1,
    paddingVertical: space.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  pillOptionActive: {
    backgroundColor: colors.accentSoft,
  },
  pillOptionText: {
    ...type.caption,
    color: colors.textMuted,
  },
  pillOptionTextActive: {
    color: colors.accent,
    fontWeight: '600',
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingVertical: space.sm,
    paddingHorizontal: space.sm,
    borderRadius: radius.md,
    marginBottom: space.xs,
  },
  checkRowActive: {
    backgroundColor: colors.accentSoft,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  checkboxMark: {
    ...type.micro,
    color: colors.bg,
  },
  checkLabel: {
    ...type.body,
    color: colors.textMuted,
  },
  checkLabelActive: {
    color: colors.text,
  },
  dimRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
  dimTrack: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.hairline,
  },
  dimFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: colors.accent,
  },
});