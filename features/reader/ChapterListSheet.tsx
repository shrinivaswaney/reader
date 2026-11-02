import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, Pressable, FlatList, Modal, StyleSheet } from 'react-native';
import { X } from 'lucide-react-native';
import { Chapter } from '@/types/manga.types';
import { type, space, radius, ThemeColors } from '@/constants/theme';
import { useTheme } from '@/providers/theme-provider';

type Props = {
  visible: boolean;
  onClose: () => void;
  chapters: Chapter[]; // newest-first, as stored
  currentChapterId: string;
  onSelect: (chapterId: string) => void;
};

export function ChapterListSheet({ visible, onClose, chapters, currentChapterId, onSelect }: Props) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const [query, setQuery] = useState('');
  const [sortNewestFirst, setSortNewestFirst] = useState(true);

  const filtered = useMemo(() => {
    const base = query
      ? chapters.filter((c) => `${c.number}`.includes(query))
      : chapters;
    return sortNewestFirst ? base : [...base].reverse();
  }, [chapters, query, sortNewestFirst]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.header}>
          <Text style={styles.title}>Chapters</Text>
          <Pressable onPress={onClose} hitSlop={8}>
            <X color={colors.textFaint} size={20} />
          </Pressable>
        </View>

        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search chapter number"
          placeholderTextColor={colors.textFaint}
          keyboardType="numeric"
          style={styles.searchInput}
        />

        <View style={styles.sortRow}>
          <Pressable
            style={[styles.sortTab, sortNewestFirst && styles.sortTabActive]}
            onPress={() => setSortNewestFirst(true)}
          >
            <Text style={[styles.sortTabText, sortNewestFirst && styles.sortTabTextActive]}>Newest first</Text>
          </Pressable>
          <Pressable
            style={[styles.sortTab, !sortNewestFirst && styles.sortTabActive]}
            onPress={() => setSortNewestFirst(false)}
          >
            <Text style={[styles.sortTabText, !sortNewestFirst && styles.sortTabTextActive]}>Oldest first</Text>
          </Pressable>
        </View>

        <FlatList
          data={filtered}
          keyExtractor={(c) => c.id}
          style={{ maxHeight: 400 }}
          renderItem={({ item }) => {
            const isCurrent = item.id === currentChapterId;
            return (
              <Pressable
                style={[styles.row, isCurrent && styles.rowActive]}
                onPress={() => {
                  onSelect(item.id);
                  onClose();
                }}
              >
                <Text style={[styles.rowText, isCurrent && styles.rowTextActive]}>
                  Chapter {item.number}
                </Text>
                <Text style={styles.rowDate}>
                  {new Date(item.releasedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </Text>
              </Pressable>
            );
          }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No chapters match &ldquo;{query}&rdquo;</Text>
          }
        />
      </View>
    </Modal>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.scrim,
  },
  sheet: {
    backgroundColor: colors.surfaceRaised,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingHorizontal: space.lg,
    paddingTop: space.lg,
    paddingBottom: space.xl,
    maxHeight: '75%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: space.md,
  },
  title: {
    ...type.displayMd,
    color: colors.text,
  },
  searchInput: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    ...type.body,
    color: colors.text,
    marginBottom: space.sm,
  },
  sortRow: {
    flexDirection: 'row',
    gap: space.xs,
    marginBottom: space.md,
  },
  sortTab: {
    flex: 1,
    paddingVertical: space.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  sortTabActive: {
    backgroundColor: colors.accentSoft,
  },
  sortTabText: {
    ...type.caption,
    color: colors.textMuted,
  },
  sortTabTextActive: {
    color: colors.accent,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: space.sm,
    paddingHorizontal: space.sm,
    borderRadius: radius.md,
  },
  rowActive: {
    backgroundColor: colors.accentSoft,
  },
  rowText: {
    ...type.body,
    color: colors.textMuted,
  },
  rowTextActive: {
    color: colors.accent,
    fontWeight: '600',
  },
  rowDate: {
    ...type.caption,
    color: colors.textFaint,
  },
  emptyText: {
    ...type.body,
    color: colors.textFaint,
    textAlign: 'center',
    paddingVertical: space.lg,
  },
});