import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  Dimensions,
  ActivityIndicator,
  StyleSheet,
  Platform,
  GestureResponderEvent,
  LayoutChangeEvent,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import * as Haptics from 'expo-haptics';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useMangaDetail, useChapterImages } from '@/api/mangadex/queries';
import { ChapterNavCard } from './ChapterNavCard';
import { ReaderPageImage } from './ReaderPageImage';
import { ReaderMenuRail } from './ReaderMenuRail';
import { ChapterListSheet } from './ChapterListSheet';
import { ReaderSettingsSheet } from './ReaderSettingsSheet';
import { ReportIssueSheet } from './ReportIssueSheet';
import { useReaderSettings } from './reader-settings';
import { clamp01, filledPartitions, progressFromScroll, PROGRESS_PARTITIONS } from './scroll-progress';
import { offsetForPage, pageFromOffset, pageForFraction } from './rtl-pagination';
import type { ReadingPreferences } from './reading-preferences';
import { type, space, radius, ThemeColors } from '@/constants/theme';
import { useTheme } from '@/providers/theme-provider';
import { useReadingPreferences } from '@/providers/reading-preferences-provider';
import { useReadingProgress } from '@/providers/reading-progress-provider';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const DOUBLE_TAP_MS = 280;
const RAIL_ACCESSIBILITY_STEP = 0.1; // each increment/decrement action = 10%
// Fraction of the viewport covered by one side-zone flick in vertical mode.
const VERTICAL_PAGE_FLIP = 0.85;
// Preload buffer: keep the next few pages warm so flips are instant even
// before ProMotion-grade scrolling ever starts.
const PRELOAD_AHEAD = 3;

type TapZone = 'left' | 'center' | 'right';

// HIG tap-zone map on a 9:16 canvas: left/right thirds carry 35% each and act
// as page turns; the center 30% toggles the HUD. Lives INSIDE the scrollable
// so scrolling still works — an overlay above it would swallow every pan.
function TapZoneOverlay({ onTap }: { onTap: (zone: TapZone) => void }) {
  return (
    <View style={tapZoneStyles.fill}>
      <Pressable style={tapZoneStyles.side} onPress={() => onTap('left')} accessibilityLabel="Left tap zone" />
      <Pressable style={tapZoneStyles.center} onPress={() => onTap('center')} accessibilityLabel="Center tap zone" />
      <Pressable style={tapZoneStyles.side} onPress={() => onTap('right')} accessibilityLabel="Right tap zone" />
    </View>
  );
}

const tapZoneStyles = StyleSheet.create({
  fill: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
  },
  side: {
    flex: 35,
  },
  center: {
    flex: 30,
  },
});

// System-video-scrubber-style reading timeline: thin track, round thumb,
// explicit current/total labels. Only rendered while the HUD is up, so
// continuous-scroll reading never flashes bars.
function TimelineScrubber({
  fraction,
  currentLabel,
  totalLabel,
  onSeek,
}: {
  fraction: number;
  currentLabel: string;
  totalLabel: string | null;
  onSeek: (fraction: number) => void;
}) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const widthRef = useRef(0);
  const p = clamp01(fraction);

  const seek = useCallback(
    (e: GestureResponderEvent) => {
      if (!widthRef.current) return;
      onSeek(clamp01(e.nativeEvent.locationX / widthRef.current));
    },
    [onSeek]
  );

  return (
    <View style={styles.scrubberWrap} pointerEvents="box-none">
      <View style={styles.scrubberLabels}>
        <Text style={styles.scrubberCurrent}>{currentLabel}</Text>
        {!!totalLabel && <Text style={styles.scrubberTotal}>{totalLabel}</Text>}
      </View>
      <View
        style={styles.scrubberHit}
        onLayout={(e) => {
          widthRef.current = e.nativeEvent.layout.width;
        }}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={seek}
        onResponderMove={seek}
        accessibilityRole="adjustable"
        accessibilityLabel="Reading timeline"
        accessibilityValue={{ text: currentLabel, min: 0, max: 100, now: Math.round(p * 100) }}
        onAccessibilityAction={(e) => {
          const step =
            e.nativeEvent.actionName === 'increment' ? RAIL_ACCESSIBILITY_STEP : -RAIL_ACCESSIBILITY_STEP;
          onSeek(p + step);
        }}
      >
        <View pointerEvents="none" style={styles.scrubberTrack}>
          <View style={[styles.scrubberFill, { width: `${p * 100}%` }]} />
          <View style={[styles.scrubberThumb, { left: `${p * 100}%` }]} />
        </View>
      </View>
    </View>
  );
}

export default function ReaderScreen() {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const { prefs }: { prefs: ReadingPreferences } = useReadingPreferences();
  const { upsert } = useReadingProgress();
  const insets = useSafeAreaInsets();
  const { mangaId, chapterId } = useLocalSearchParams<{ mangaId: string; chapterId: string }>();
  const router = useRouter();
  const [controlsVisible, setControlsVisible] = useState(true);
  const [filledCount, setFilledCount] = useState(0);
  const [chaptersOpen, setChaptersOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  // Right-to-left paginated mode state: which logical page (0-indexed) is shown.
  const [rtlPage, setRtlPage] = useState(0);

  const scrollRef = useRef<ScrollView>(null);
  const rtlScrollRef = useRef<ScrollView>(null);
  const lastTapRef = useRef(0);
  // Track scroll geometry — onContentSizeChange/onLayout give us these at
  // mount, before any scrolling has happened.
  const scrollMetricsRef = useRef({ contentHeight: 0, viewportHeight: 0, scrollY: 0 });
  const rtlMetricsRef = useRef({ viewportWidth: 0 });
  // The RTL pager starts at the far-right end of its content; snap there once
  // the content size is known instead of animating from offset 0.
  const rtlNeedsInitialSnapRef = useRef(true);

  const { settings, updateSettings } = useReaderSettings();
  const { data: manga, isLoading: mangaLoading } = useMangaDetail(mangaId);
  const {
    data: pages,
    isLoading: pagesLoading,
    isError: pagesError,
    refetch: refetchPages,
  } = useChapterImages(chapterId);

  const chapters = manga?.chapters ?? [];
  const currentIndex = chapters.findIndex((c) => c.id === chapterId);
  const currentChapter = chapters[currentIndex];

  // Chapters are stored newest-first, so "next" (higher number, forward
  // in the story) is the previous array index, and "previous" is the next index.
  const nextChapter = currentIndex > 0 ? chapters[currentIndex - 1] : undefined;
  const prevChapter = currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : undefined;

  const isRtl = prefs.direction === 'rtl';
  const pageList = pages ?? [];
  // In RTL mode the end-of-chapter block rides along as the final "cell".
  const rtlTotalItems = pageList.length + 1;

  // --- Orientation lock -------------------------------------------------
  useEffect(() => {
    if (Platform.OS === 'web') return;
    const apply = async () => {
      try {
        if (prefs.orientationLock === 'portrait') {
          await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
        } else if (prefs.orientationLock === 'landscape') {
          await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
        } else {
          await ScreenOrientation.unlockAsync();
        }
      } catch {
        // Locking can fail (e.g. unsupported on iPad split-view); fall back to
        // system behavior rather than crashing the reader.
      }
    };
    apply();
    return () => {
      ScreenOrientation.unlockAsync().catch(() => {});
    };
  }, [prefs.orientationLock]);

  // --- Reset position when the chapter changes ---------------------------
  useEffect(() => {
    setRtlPage(0);
    rtlNeedsInitialSnapRef.current = true;
    scrollMetricsRef.current.scrollY = 0;
    setFilledCount(0);
  }, [chapterId]);

  // --- Vertical continuous scrolling ------------------------------------
  const handleScroll = useCallback((e: { nativeEvent: { contentOffset: { y: number }; contentSize: { height: number }; layoutMeasurement: { height: number } } }) => {
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
    scrollMetricsRef.current.scrollY = contentOffset.y;
    const progress = progressFromScroll(contentOffset.y, contentSize.height, layoutMeasurement.height);
    // Bail out on unchanged integers so the 100-segment rail doesn't
    // re-render on every scroll frame — only when a partition flips.
    const next = filledPartitions(progress);
    setFilledCount((prev) => (prev === next ? prev : next));
  }, []);

  const goToChapter = useCallback(
    (nextChapterId: string) => {
      // Stay on the mounted reader and swap the chapter param instead of
      // replace()ing the route — replace pops this modal mid-transition,
      // flashing the manga details screen that sits underneath it.
      router.setParams({ chapterId: nextChapterId });
      scrollRef.current?.scrollTo({ y: 0, animated: false });
      rtlNeedsInitialSnapRef.current = true;
      setFilledCount(0);
    },
    [router]
  );

  // --- Tap zone routing ---------------------------------------------------
  // Mirrors the configured layout onto an action. RTL reads right-to-left, so
  // its forward/back zones are the mirror image of vertical/LTR conventions;
  // left-handed mode flips the sides again.
  const resolveTapZone = useCallback(
    (zone: TapZone): 'forward' | 'back' | 'menu' => {
      const flipped = prefs.tapZones === 'left-handed';
      const mapped = flipped ? (zone === 'left' ? 'right' : zone === 'right' ? 'left' : 'center') : zone;
      if (mapped === 'center') return 'menu';
      if (isRtl) return mapped === 'left' ? 'forward' : 'back';
      return mapped === 'right' ? 'forward' : 'back';
    },
    [prefs.tapZones, isRtl]
  );

  const scrollVerticallyBy = useCallback((delta: number) => {
    const { scrollY, contentHeight, viewportHeight } = scrollMetricsRef.current;
    const maxScroll = Math.max(0, contentHeight - viewportHeight);
    const targetY = Math.min(Math.max(scrollY + delta, 0), maxScroll);
    scrollRef.current?.scrollTo({ y: targetY, animated: true });
  }, []);

  const flipRtlPage = useCallback(
    (delta: 1 | -1) => {
      if (!rtlMetricsRef.current.viewportWidth) return;
      const target = Math.min(Math.max(rtlPage + delta, 0), rtlTotalItems - 1);
      if (target !== rtlPage) {
        // Subtle physical feedback on every successful page turn.
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      }
      rtlScrollRef.current?.scrollTo({
        x: offsetForPage(target, rtlMetricsRef.current.viewportWidth, rtlTotalItems),
        animated: true,
      });
    },
    [rtlPage, rtlTotalItems]
  );

  const toggleControls = useCallback(() => {
    if (settings.tapMode === 'single') {
      setControlsVisible((v) => !v);
      return;
    }
    const now = Date.now();
    if (now - lastTapRef.current < DOUBLE_TAP_MS) {
      setControlsVisible((v) => !v);
    }
    lastTapRef.current = now;
  }, [settings.tapMode]);

  const handleZoneTap = useCallback(
    (zone: TapZone) => {
      const action = resolveTapZone(zone);
      if (action === 'menu') {
        toggleControls();
        return;
      }
      // Side zones honor the double-tap gate too — otherwise a stray tap in
      // double-tap mode would silently flip pages.
      if (settings.tapMode === 'single') {
        if (isRtl) flipRtlPage(action === 'forward' ? 1 : -1);
        else scrollVerticallyBy(action === 'forward' ? SCREEN_HEIGHT * VERTICAL_PAGE_FLIP : -SCREEN_HEIGHT * VERTICAL_PAGE_FLIP);
        return;
      }
      const now = Date.now();
      if (now - lastTapRef.current < DOUBLE_TAP_MS) {
        if (isRtl) flipRtlPage(action === 'forward' ? 1 : -1);
        else scrollVerticallyBy(action === 'forward' ? SCREEN_HEIGHT * VERTICAL_PAGE_FLIP : -SCREEN_HEIGHT * VERTICAL_PAGE_FLIP);
        setControlsVisible((v) => !v);
      }
      lastTapRef.current = now;
    },
    [resolveTapZone, toggleControls, settings.tapMode, isRtl, flipRtlPage, scrollVerticallyBy]
  );

  // --- RTL pager scroll tracking ------------------------------------------
  const handleRtlScroll = useCallback(
    (e: { nativeEvent: { contentOffset: { x: number }; layoutMeasurement: { width: number } } }) => {
      const width = e.nativeEvent.layoutMeasurement.width;
      if (!width) return;
      rtlMetricsRef.current.viewportWidth = width;
      const page = pageFromOffset(e.nativeEvent.contentOffset.x, width, rtlTotalItems);
      setRtlPage((prev) => (prev === page ? prev : page));
      const fraction = Math.min(page / Math.max(pageList.length, 1), 1);
      const next = filledPartitions(fraction);
      setFilledCount((prev) => (prev === next ? prev : next));
    },
    [rtlTotalItems, pageList.length]
  );

  // Snap to the first page (far right end) once content lays out.
  const handleRtlContentSize = useCallback(
    (contentW: number, _h: number) => {
      const viewportWidth =
        rtlMetricsRef.current.viewportWidth || contentW / Math.max(rtlTotalItems, 1);
      if (!rtlNeedsInitialSnapRef.current || !viewportWidth) return;
      rtlNeedsInitialSnapRef.current = false;
      rtlScrollRef.current?.scrollTo({
        x: offsetForPage(0, viewportWidth, rtlTotalItems),
        animated: false,
      });
    },
    [rtlTotalItems]
  );

  // --- Preload buffer: keep the next few pages in memory ------------------
  useEffect(() => {
    if (pagesLoading || pagesError) return;
    (isRtl ? pageList.slice(rtlPage + 1, rtlPage + 1 + PRELOAD_AHEAD) : pageList.slice(0, PRELOAD_AHEAD))
      .forEach((p) => Image.prefetch(p.uri).catch(() => {}));
  }, [isRtl, rtlPage, pageList, pagesLoading, pagesError]);

  // --- Reading history persistence -----------------------------------------
  // Debounced so scrubbing the timeline doesn't spam AsyncStorage; ref keeps
  // upsert out of deps so our own writes can't re-trigger the effect.
  const upsertRef = useRef(upsert);
  upsertRef.current = upsert;
  useEffect(() => {
    if (!manga || !currentChapter || pagesLoading || pagesError || pageList.length === 0) return;
    const timer = setTimeout(() => {
      upsertRef.current({
        mangaId: mangaId,
        title: manga.title,
        coverUrl: manga.coverUrl,
        chapterId: currentChapter.id,
        lastChapter: currentChapter.number,
        lastPage: isRtl
          ? Math.min(rtlPage, pageList.length - 1)
          : Math.min(
              Math.max(Math.round((filledCount / PROGRESS_PARTITIONS) * (pageList.length - 1)), 0),
              pageList.length - 1
            ),
        totalPagesInChapter: pageList.length,
        updatedAt: new Date().toISOString(),
      });
    }, 800);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRtl, rtlPage, filledCount, currentChapter?.id, pageList.length, pagesLoading, pagesError]);

  // --- Progress timeline seeking ------------------------------------------
  const seekToFraction = useCallback(
    (fraction: number) => {
      const clamped = clamp01(fraction);
      if (isRtl) {
        const viewportWidth = rtlMetricsRef.current.viewportWidth;
        if (!viewportWidth) return;
        const target = pageForFraction(clamped, Math.max(pageList.length, 1));
        rtlScrollRef.current?.scrollTo({
          x: offsetForPage(target, viewportWidth, rtlTotalItems),
          animated: false,
        });
        return;
      }
      const { contentHeight, viewportHeight } = scrollMetricsRef.current;
      const maxScroll = contentHeight - viewportHeight;
      if (maxScroll <= 0) return;
      scrollRef.current?.scrollTo({ y: clamped * maxScroll, animated: false });
    },
    [isRtl, pageList.length, rtlTotalItems]
  );

  // Artwork either respects the camera cutout (padded) or extends beneath it.
  const topInsetPadding = prefs.notchBehavior === 'cutout' ? insets.top : 0;

  if (mangaLoading) {
    return (
      <View style={[styles.container, styles.centerFill]}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (!manga || !currentChapter) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundTitle}>Chapter not found</Text>
          <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Go back">
            <Text style={styles.backLink}>Go back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const loadingOrErrorCell = (
    <View style={[styles.centerFill, { width: SCREEN_WIDTH, height: SCREEN_HEIGHT * 0.6 }]}>
      {pagesLoading ? (
        <ActivityIndicator color={colors.accent} />
      ) : (
        <>
          <Text style={styles.notFoundTitle}>Couldn&apos;t load this chapter</Text>
          <Pressable
            onPress={() => refetchPages()}
            accessibilityRole="button"
            accessibilityLabel="Retry loading this chapter"
          >
            <Text style={styles.backLink}>Retry</Text>
          </Pressable>
        </>
      )}
    </View>
  );

  const verticalPages = pageList.map((page) => (
    <ReaderPageImage
      key={page.id}
      uri={page.uri}
      margin={settings.margin}
      fitHeight={settings.fitMode === 'height'}
      splitSpreads={prefs.splitSpreads}
    />
  ));

  const endOfChapterBlock = !pagesLoading && !pagesError && (
    <View style={[styles.endOfChapter, isRtl && styles.endOfChapterCell]}>
      {!nextChapter ? (
        <>
          <Text style={styles.endOfChapterTitle}>You&apos;re All Caught Up</Text>
          <Text style={styles.endOfChapterBody}>This is the latest available chapter.</Text>
        </>
      ) : !prevChapter ? (
        <>
          <Text style={styles.endOfChapterTitle}>Chapter Complete</Text>
          <Text style={styles.endOfChapterBody}>Chapter {nextChapter.number} is ready.</Text>
        </>
      ) : null}

      <View style={styles.endOfChapterNavRow}>
        {prevChapter && (
          <ChapterNavCard direction="previous" chapter={prevChapter} onPress={() => goToChapter(prevChapter.id)} />
        )}
        <ChapterNavCard
          direction="next"
          chapter={nextChapter}
          onPress={() => nextChapter && goToChapter(nextChapter.id)}
        />
      </View>
    </View>
  );

  // RTL cells are laid out so the END of the story sits at the far LEFT and
  // page 1 at the far RIGHT: [end-of-chapter, …page3, page2, page1].
  // Combined with opening scrolled to the right end, flipping forward drags
  // content rightward — exactly like turning a physical volume's page.
  const rtlCells = [
    <View key="end-of-chapter" style={styles.rtlCell}>
      {endOfChapterBlock}
      <TapZoneOverlay onTap={handleZoneTap} />
    </View>,
    ...[...pageList]
      .map((page, logicalIndex) => ({ page, logicalIndex }))
      .reverse()
      .map(({ page }) => (
        <View key={page.id} style={styles.rtlCell}>
          <ReaderPageImage uri={page.uri} margin={0} fitHeight splitSpreads={prefs.splitSpreads} />
          <TapZoneOverlay onTap={handleZoneTap} />
        </View>
      )),
  ];

  return (
    <View style={[styles.container, { paddingTop: topInsetPadding }]}>
      {isRtl ? (
        /* Right-to-left paginated mode — see rtlCells for layout rationale. */
        <ScrollView
          ref={rtlScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={SCREEN_WIDTH}
          decelerationRate="fast"
          onScroll={handleRtlScroll}
          scrollEventThrottle={32}
          onLayout={(e) => {
            rtlMetricsRef.current.viewportWidth = e.nativeEvent.layout.width;
          }}
          onContentSizeChange={handleRtlContentSize}
        >
          {(pagesLoading || pagesError) && loadingOrErrorCell}
          {!pagesLoading && !pagesError && rtlCells}
        </ScrollView>
      ) : (
        <ScrollView
          ref={scrollRef}
          onScroll={handleScroll}
          scrollEventThrottle={32}
          showsVerticalScrollIndicator={false}
          onLayout={(e) => {
            scrollMetricsRef.current.viewportHeight = e.nativeEvent.layout.height;
          }}
          onContentSizeChange={(_w, h) => {
            scrollMetricsRef.current.contentHeight = h;
          }}
        >
          {(pagesLoading || pagesError) && loadingOrErrorCell}
          {!pagesLoading && !pagesError && (
            <View>
              {verticalPages}
              <TapZoneOverlay onTap={handleZoneTap} />
            </View>
          )}
          {endOfChapterBlock}
        </ScrollView>
      )}

      {settings.dimPercent > 0 && (
        <View
          pointerEvents="none"
          style={[styles.dimOverlay, { opacity: (settings.dimPercent / 100) * 0.85 }]}
        />
      )}

      {/* Reading timeline — mimics the system video scrubber. HUD-only so
          continuous reading never flashes scroll bars. */}
      {settings.showProgressBar && !pagesLoading && !pagesError && (
        <View
          style={[styles.scrubberOverlay, { paddingBottom: insets.bottom + space.sm }]}
          pointerEvents={controlsVisible ? 'box-none' : 'none'}
        >
          {controlsVisible && (
            <TimelineScrubber
              fraction={
                isRtl
                  ? Math.min(rtlPage / Math.max(pageList.length, 1), 1)
                  : filledCount / PROGRESS_PARTITIONS
              }
              currentLabel={
                isRtl ? `Page ${Math.min(rtlPage + 1, pageList.length || 1)}` : `${filledCount}%`
              }
              totalLabel={isRtl && pageList.length > 0 ? String(pageList.length) : null}
              onSeek={seekToFraction}
            />
          )}
        </View>
      )}

      {/* Chrome containers stay MOUNTED at all times — only their contents
          toggle. Remounting a SafeAreaView per-toggle re-measures insets
          mid-transition and leaves controls mispositioned. */}
      <View
        style={[styles.topOverlay, { paddingTop: prefs.notchBehavior === 'cutout' ? insets.top : space.sm }]}
        pointerEvents={controlsVisible ? 'box-none' : 'none'}
      >
        {controlsVisible && (
          <View style={styles.topRow}>
            {/* Circular close button — sits below the camera/notch at the left */}
            <Pressable
              onPress={() => router.back()}
              hitSlop={8}
              style={styles.circleButton}
              accessibilityRole="button"
              accessibilityLabel="Close reader"
            >
              <ChevronLeft color={colors.text} size={20} />
            </Pressable>

            <View
              style={styles.chapterPager}
              accessibilityLabel={`Chapter ${currentChapter.number} of ${chapters.length}`}
            >
              <Pressable
                onPress={() => prevChapter && goToChapter(prevChapter.id)}
                disabled={!prevChapter}
                hitSlop={6}
                style={({ pressed }) => [
                  styles.pagerButton,
                  (!prevChapter || pressed) && styles.pagerButtonDisabled,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Previous chapter"
                accessibilityState={{ disabled: !prevChapter }}
              >
                <ChevronLeft color={prevChapter ? colors.text : colors.textFaint} size={16} />
              </Pressable>

              <View style={styles.pagerDivider} />
              <Text style={styles.pagerText}>
                {currentChapter.number}/{chapters.length}
              </Text>
              <View style={styles.pagerDivider} />

              <Pressable
                onPress={() => nextChapter && goToChapter(nextChapter.id)}
                disabled={!nextChapter}
                hitSlop={6}
                style={({ pressed }) => [
                  styles.pagerButton,
                  (!nextChapter || pressed) && styles.pagerButtonDisabled,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Next chapter"
                accessibilityState={{ disabled: !nextChapter }}
              >
                <ChevronRight color={nextChapter ? colors.text : colors.textFaint} size={16} />
              </Pressable>
            </View>
          </View>
        )}
      </View>

      {controlsVisible && (
        <ReaderMenuRail
          onHome={() => router.replace('/')}
          onChapters={() => setChaptersOpen(true)}
          onSettings={() => setSettingsOpen(true)}
          onReport={() => setReportOpen(true)}
        />
      )}

      {isRtl && !pagesLoading && !pagesError && (
        <View
          style={[styles.pageCounterOverlay, { paddingBottom: insets.bottom + space.sm }]}
          pointerEvents="none"
        >
          {controlsVisible && (
            <View style={styles.pageCounter}>
              <Text style={styles.pageCounterText}>
                {Math.min(rtlPage + 1, pageList.length || 1)} / {pageList.length || '–'}
              </Text>
            </View>
          )}
        </View>
      )}

      <ChapterListSheet
        visible={chaptersOpen}
        onClose={() => setChaptersOpen(false)}
        chapters={chapters}
        currentChapterId={currentChapter.id}
        onSelect={goToChapter}
      />
      <ReaderSettingsSheet
        visible={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onChange={updateSettings}
      />
      <ReportIssueSheet
        visible={reportOpen}
        onClose={() => setReportOpen(false)}
        mangaTitle={manga.title}
        chapterNumber={currentChapter.number}
        onSubmit={(details) => {
          console.log('Report submitted:', { chapterId: currentChapter.id, details });
        }}
      />
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  centerFill: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundTitle: {
    ...type.displayMd,
    color: colors.text,
    marginBottom: space.sm,
    textAlign: 'center',
  },
  backLink: {
    ...type.body,
    color: colors.accent,
  },
  dimOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  rtlCell: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    backgroundColor: colors.bg,
  },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  pageCounterOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  pageCounter: {
    backgroundColor: colors.overlayPanel,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.overlayBorder,
    paddingHorizontal: space.md,
    paddingVertical: space.xs,
  },
  pageCounterText: {
    ...type.caption,
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.sm,
    paddingTop: space.xs,
  },
  // Shared translucent treatment matching the right-hand menu rail
  circleButton: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.overlayPanel,
    borderWidth: 1,
    borderColor: colors.overlayBorder,
  },
  chapterPager: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.overlayPanel,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.overlayBorder,
    paddingVertical: 3,
    paddingHorizontal: space.xs,
  },
  pagerButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pagerButtonDisabled: {
    opacity: 0.35,
  },
  pagerDivider: {
    width: 1,
    height: 18,
    backgroundColor: colors.overlayBorder,
  },
  pagerText: {
    ...type.caption,
    color: colors.text,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
    minWidth: 56,
    textAlign: 'center',
  },
  scrubberOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  scrubberWrap: {
    width: SCREEN_WIDTH - space.xl * 2,
    paddingBottom: space.sm,
  },
  scrubberLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: space.xs,
  },
  scrubberCurrent: {
    ...type.caption,
    color: colors.text,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  scrubberTotal: {
    ...type.caption,
    color: colors.textFaint,
    fontVariant: ['tabular-nums'],
  },
  // Wide invisible hit area around the 5px visual track, like the system
  // video scrubber's generous touch target.
  scrubberHit: {
    paddingVertical: space.sm,
    marginVertical: -space.sm,
  },
  scrubberTrack: {
    height: 5,
    borderRadius: radius.pill,
    backgroundColor: colors.hairline,
    overflow: 'visible',
  },
  scrubberFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
  },
  scrubberThumb: {
    position: 'absolute',
    top: -5,
    width: 15,
    height: 15,
    marginLeft: -7,
    borderRadius: radius.pill,
    backgroundColor: colors.text,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.35,
    shadowRadius: 3,
    elevation: 3,
  },
  endOfChapter: {
    paddingVertical: space.xxl,
    paddingHorizontal: space.xl,
    alignItems: 'center',
    backgroundColor: colors.bg,
  },
  endOfChapterCell: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
  },
  endOfChapterTitle: {
    ...type.displayMd,
    color: colors.text,
    marginBottom: space.xs,
    textAlign: 'center',
  },
  endOfChapterBody: {
    ...type.body,
    color: colors.textMuted,
    marginBottom: space.lg,
    textAlign: 'center',
  },
  endOfChapterNavRow: {
    flexDirection: 'row',
    gap: space.sm,
    width: '100%',
  },
});
