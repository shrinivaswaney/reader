import React, { useMemo, useState } from 'react';
import { View, Text, FlatList, Pressable, Modal, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LayoutGrid, List, X } from 'lucide-react-native';
import { MangaCard } from '@/components/manga/MangaCard';
import {
  libraryEntries as seedEntries,
  statusLabels,
  LibraryEntry,
  LibraryStatus,
} from '@/mocks/dummyLibrary';
import { type, space, radius, ThemeColors, BADGE_FONT_SIZE, ICON_BUTTON } from '@/constants/theme';
import { useTheme } from '@/providers/theme-provider';

const filters: (LibraryStatus | 'all' | 'favorites')[] = [
  'all', 'reading', 'plan_to_read', 'on_hold', 'completed', 'dropped', 'favorites',
];

const filterLabels: Record<string, string> = {
  all: 'All',
  favorites: '★ Favorites',
  ...statusLabels,
};

type ContextTarget = { entry: LibraryEntry };

// iOS-style action sheet: grouped rounded rows over a dimmed backdrop with a
// separate cancel button — the UIAlertController pattern, RN-flavored.
function ContextSheet({
  target,
  onClose,
  onMarkRead,
  onMoveTo,
  onDelete,
}: {
  target: LibraryEntry | null;
  onClose: () => void;
  onMarkRead: () => void;
  onMoveTo: (s: LibraryStatus) => void;
  onDelete: () => void;
}) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const [moveOpen, setMoveOpen] = useState(false);

  return (
    <Modal transparent animationType="fade" visible={!!target} onRequestClose={onClose}>
      <Pressable style={styles.ctxBackdrop} onPress={onClose} />
      <View style={styles.ctxSheetWrap} pointerEvents="box-none">
        <View style={styles.ctxGroup}>
          <Text style={styles.ctxTitle} numberOfLines={1}>
            {target?.manga.title}
          </Text>

          {!moveOpen ? (
            <>
              <Pressable style={styles.ctxRow} onPress={() => { onMarkRead(); onClose(); }}>
                <Text style={styles.ctxRowText}>
                  {target?.newChapters ? 'Mark as Read' : 'Mark as Unread'}
                </Text>
              </Pressable>
              <Pressable style={styles.ctxRow} onPress={() => setMoveOpen(true)}>
                <Text style={styles.ctxRowText}>Move to Category…</Text>
              </Pressable>
              <Pressable style={styles.ctxRow} onPress={onClose}>
                <Text style={styles.ctxRowText}>Download Next Chapter</Text>
              </Pressable>
              <Pressable style={[styles.ctxRow, styles.ctxRowLast]} onPress={() => { onDelete(); onClose(); }}>
                <Text style={[styles.ctxRowText, styles.ctxDestructive]}>Delete Data</Text>
              </Pressable>
            </>
          ) : (
            (Object.keys(statusLabels) as LibraryStatus[]).map((s, i, arr) => (
              <Pressable
                key={s}
                style={[styles.ctxRow, i === arr.length - 1 && styles.ctxRowLast]}
                onPress={() => { onMoveTo(s); onClose(); }}
              >
                <Text style={[styles.ctxRowText, s === target?.status && styles.ctxActive]}>
                  {statusLabels[s]}{s === target?.status ? ' ✓' : ''}
                </Text>
              </Pressable>
            ))
          )}
        </View>

        <Pressable style={[styles.ctxGroup, styles.ctxCancel]} onPress={onClose}>
          <Text style={styles.ctxCancelText}>Cancel</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

export default function LibraryScreen() {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<string>('all');
  // Local mutable copy so context-menu actions have real, visible effects.
  const [entries, setEntries] = useState<LibraryEntry[]>(seedEntries);
  const [layoutMode, setLayoutMode] = useState<'grid' | 'list'>('grid');
  const [ctxTarget, setCtxTarget] = useState<ContextTarget | null>(null);

  const filtered = useMemo(() => {
    if (activeFilter === 'all') return entries;
    if (activeFilter === 'favorites') return entries.filter((e) => e.isFavorite);
    return entries.filter((e) => e.status === activeFilter);
  }, [activeFilter, entries]);

  const markReadToggle = (externalId: string) =>
    setEntries((prev) =>
      prev.map((e) =>
        e.manga.externalId === externalId
          ? { ...e, newChapters: e.newChapters ? 0 : 3 }
          : e
      )
    );

  const moveTo = (externalId: string, status: LibraryStatus) =>
    setEntries((prev) =>
      prev.map((e) => (e.manga.externalId === externalId ? { ...e, status } : e))
    );

  const deleteEntry = (externalId: string) =>
    setEntries((prev) => prev.filter((e) => e.manga.externalId !== externalId));

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Library</Text>
          <Text style={styles.subtitle}>{filtered.length} titles</Text>
        </View>
        {/* SF-Symbol-style layout switcher */}
        <View style={styles.layoutSwitch}>
          <Pressable
            onPress={() => setLayoutMode('grid')}
            style={[styles.layoutButton, layoutMode === 'grid' && styles.layoutButtonActive]}
            accessibilityRole="button"
            accessibilityState={{ selected: layoutMode === 'grid' }}
            accessibilityLabel="Grid view"
          >
            <LayoutGrid size={18} color={layoutMode === 'grid' ? colors.accent : colors.textFaint} />
          </Pressable>
          <Pressable
            onPress={() => setLayoutMode('list')}
            style={[styles.layoutButton, layoutMode === 'list' && styles.layoutButtonActive]}
            accessibilityRole="button"
            accessibilityState={{ selected: layoutMode === 'list' }}
            accessibilityLabel="List view"
          >
            <List size={18} color={layoutMode === 'list' ? colors.accent : colors.textFaint} />
          </Pressable>
        </View>
      </View>

      <FlatList
        data={filters}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(f) => f}
        contentContainerStyle={styles.filterRow}
        renderItem={({ item }) => {
          const active = activeFilter === item;
          return (
            <Pressable
              style={[styles.filterPill, active && styles.filterPillActive]}
              onPress={() => setActiveFilter(item)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={`Show ${filterLabels[item]}`}
            >
              <Text style={[styles.filterPillText, active && styles.filterPillTextActive]}>
                {filterLabels[item]}
              </Text>
            </Pressable>
          );
        }}
      />

      {filtered.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Nothing here yet</Text>
          <Text style={styles.emptyBody}>Titles you add with this status will show up here.</Text>
        </View>
      ) : layoutMode === 'grid' ? (
        <FlatList
          key="library-grid"
          data={filtered}
          keyExtractor={(e) => e.manga.externalId}
          numColumns={3}
          columnWrapperStyle={{ gap: space.sm, paddingHorizontal: space.lg }}
          contentContainerStyle={{ gap: space.md, paddingBottom: space.xxl }}
          renderItem={({ item }) => (
            <View style={styles.gridCell}>
              <MangaCard
                manga={item.manga}
                width={null}
                badgeCount={item.newChapters}
                onPress={() => router.push(`/manga/${item.manga.externalId}`)}
                onLongPress={() => setCtxTarget({ entry: item })}
              />
            </View>
          )}
        />
      ) : (
        <FlatList
          key="library-list"
          data={filtered}
          keyExtractor={(e) => e.manga.externalId}
          contentContainerStyle={{ paddingHorizontal: space.lg, paddingBottom: space.xxl, gap: space.sm }}
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [styles.listRow, pressed && styles.rowPressed]}
              onPress={() => router.push(`/manga/${item.manga.externalId}`)}
              onLongPress={() => setCtxTarget({ entry: item })}
              accessibilityRole="button"
              accessibilityLabel={`Open ${item.manga.title}`}
            >
              <View style={styles.listCoverWrap}>
                <MangaCard.ListCover uri={item.manga.coverUrl} />
                {!!item.newChapters && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadBadgeText}>{item.newChapters}</Text>
                  </View>
                )}
              </View>
              <View style={styles.listInfo}>
                <Text style={styles.listTitle} numberOfLines={1}>{item.manga.title}</Text>
                <Text style={styles.listMeta}>{filterLabels[item.status]}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          )}
        />
      )}

      <ContextSheet
        target={ctxTarget?.entry ?? null}
        onClose={() => setCtxTarget(null)}
        onMarkRead={() => ctxTarget && markReadToggle(ctxTarget.entry.manga.externalId)}
        onMoveTo={(s) => ctxTarget && moveTo(ctxTarget.entry.manga.externalId, s)}
        onDelete={() => ctxTarget && deleteEntry(ctxTarget.entry.manga.externalId)}
      />
    </SafeAreaView>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    paddingBottom: space.sm,
  },
  headerTitle: {
    ...type.title1,
    color: colors.text,
  },
  subtitle: {
    ...type.caption,
    color: colors.textFaint,
    marginTop: space.xxs,
  },
  layoutSwitch: {
    flexDirection: 'row',
    backgroundColor: colors.fill,
    borderRadius: radius.md,
    padding: space.xxs,
    gap: space.xxs,
  },
  layoutButton: {
    width: ICON_BUTTON,
    height: 28,
    borderRadius: radius.smMd,
    alignItems: 'center',
    justifyContent: 'center',
  },
  layoutButtonActive: {
    backgroundColor: colors.surfaceRaised,
  },
  filterRow: {
    paddingHorizontal: space.lg,
    gap: space.sm,
    marginVertical: space.md,
  },
  filterPill: {
    paddingHorizontal: space.md,
    paddingVertical: space.sm - space.xxs,
    borderRadius: radius.pill,
    backgroundColor: colors.fill,
  },
  filterPillActive: {
    backgroundColor: colors.accentSoft,
  },
  filterPillText: {
    ...type.caption,
    color: colors.textMuted,
  },
  filterPillTextActive: {
    color: colors.accent,
    fontWeight: '600',
  },
  gridCell: {
    flex: 1 / 3,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: space.sm,
    gap: space.md,
  },
  rowPressed: {
    backgroundColor: colors.surfaceRaised,
  },
  listCoverWrap: {
    position: 'relative',
  },
  unreadBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 5,
    borderRadius: radius.pill,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadBadgeText: {
    // Fixed white-on-danger pairing, same in both schemes.
    fontSize: BADGE_FONT_SIZE,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  listInfo: {
    flex: 1,
    gap: space.xxs,
  },
  listTitle: {
    ...type.headline,
    color: colors.text,
  },
  listMeta: {
    ...type.caption,
    color: colors.textFaint,
  },
  chevron: {
    ...type.displayMd,
    color: colors.textFaint,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.xl,
    paddingBottom: space.xxl,
  },
  emptyTitle: {
    ...type.displayMd,
    color: colors.text,
    marginBottom: space.xs,
  },
  emptyBody: {
    ...type.body,
    color: colors.textMuted,
    textAlign: 'center',
  },
  ctxBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.scrim,
  },
  ctxSheetWrap: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: space.sm,
    paddingBottom: space.md,
    gap: space.sm,
  },
  ctxGroup: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.xl,
    overflow: 'hidden',
  },
  ctxTitle: {
    ...type.micro,
    color: colors.textFaint,
    textAlign: 'center',
    paddingTop: space.md,
    paddingBottom: space.xs,
    paddingHorizontal: space.md,
    textTransform: 'uppercase',
  },
  ctxRow: {
    paddingVertical: space.md - space.xs,
    paddingHorizontal: space.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.hairline,
  },
  ctxRowLast: {
    borderBottomWidth: 0,
  },
  ctxRowText: {
    ...type.body,
    color: colors.text,
    textAlign: 'center',
  },
  ctxActive: {
    color: colors.accent,
    fontWeight: '600',
  },
  ctxDestructive: {
    color: colors.danger,
  },
  ctxCancel: {
    paddingVertical: space.md - space.xxs,
  },
  ctxCancelText: {
    ...type.headline,
    color: colors.accent,
    textAlign: 'center',
  },
});
