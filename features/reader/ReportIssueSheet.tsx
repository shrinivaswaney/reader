import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Modal, StyleSheet } from 'react-native';
import { X } from 'lucide-react-native';
import { type, space, radius, ThemeColors } from '@/constants/theme';
import { useTheme } from '@/providers/theme-provider';

type Props = {
  visible: boolean;
  onClose: () => void;
  mangaTitle: string;
  chapterNumber: number;
  onSubmit: (details: string) => void;
};

export function ReportIssueSheet({ visible, onClose, mangaTitle, chapterNumber, onSubmit }: Props) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const [details, setDetails] = useState('');
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    onSubmit(details);
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setDetails('');
      onClose();
    }, 900);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Report chapter issue</Text>
            <Text numberOfLines={1} style={styles.subtitle}>Chapter {chapterNumber} · {mangaTitle}</Text>
          </View>
          <Pressable onPress={onClose} hitSlop={8}>
            <X color={colors.textFaint} size={20} />
          </Pressable>
        </View>

        <View style={styles.labelRow}>
          <Text style={styles.fieldLabel}>Details</Text>
          <Text style={styles.optional}>OPTIONAL</Text>
        </View>
        <TextInput
          value={details}
          onChangeText={setDetails}
          placeholder="What's wrong with this chapter?"
          placeholderTextColor={colors.textFaint}
          multiline
          numberOfLines={4}
          style={styles.textArea}
        />

        <Pressable style={styles.sendButton} onPress={handleSend}>
          <Text style={styles.sendButtonText}>{sent ? 'Sent ✓' : 'Send report'}</Text>
        </Pressable>
      </View>
    </Modal>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: space.lg,
  },
  title: {
    ...type.displayMd,
    color: colors.text,
  },
  subtitle: {
    ...type.caption,
    color: colors.textFaint,
    marginTop: space.xxs,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: space.xs,
  },
  fieldLabel: {
    ...type.body,
    color: colors.text,
    fontWeight: '600',
  },
  optional: {
    ...type.micro,
    color: colors.textFaint,
  },
  textArea: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
    padding: space.md,
    ...type.body,
    color: colors.text,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: space.lg,
  },
  sendButton: {
    backgroundColor: colors.accent,
    borderRadius: radius.lg,
    paddingVertical: space.sm,
    alignItems: 'center',
  },
  sendButtonText: {
    ...type.bodyLg,
    color: colors.bg,
    fontWeight: '600',
  },
});