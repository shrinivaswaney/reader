import { ThemeColors } from '@/constants/theme';
import { useTheme } from '@/providers/theme-provider';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Image, StyleSheet, View } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const FALLBACK_RATIO = 1.45; // used only until real dimensions resolve, or if they fail to load
// Wider than this (h/w) counts as a landscape print spread worth splitting.
const SPREAD_RATIO_THRESHOLD = 0.95;

type Props = {
  uri: string;
  margin: number;
  fitHeight?: boolean;
  splitSpreads?: boolean;
}

export function ReaderPageImage({ uri, margin, fitHeight = false, splitSpreads = false }: Props) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const [ratio, setRatio] = useState<number | null>(null); // height / width

  useEffect(() => {
    let cancelled = false;
    setRatio(null);
    Image.getSize(
      uri,
      (w, h) => {
        if (!cancelled && w > 0) setRatio(h / w);
      },
      () => {
        if (!cancelled) setRatio(FALLBACK_RATIO); // fall back rather than leaving the page stuck loading forever
      }
    );
    return () => {
      cancelled = true;
    };
  }, [uri]);

  const effectiveRatio = ratio ?? FALLBACK_RATIO;
  const width = fitHeight ? SCREEN_HEIGHT / effectiveRatio : SCREEN_WIDTH;
  const height = fitHeight ? SCREEN_HEIGHT : SCREEN_WIDTH * effectiveRatio;

  if (ratio === null) {
    return (
      <View style={[styles.placeholder, { width, height, marginVertical: margin / 2 }]}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  // Double-page split: a wide spread rendered whole would shrink text to
  // unreadable on a phone — slice it into its two constituent pages and stack
  // them vertically. Implemented as two clipped windows over one full-size
  // image, so there's no re-download or native image manipulation involved.
  const isSpread = splitSpreads && !fitHeight && ratio < SPREAD_RATIO_THRESHOLD;
  if (isSpread) {
    const halfHeight = height / 2;
    return (
      <View style={{ alignSelf: 'stretch', marginVertical: margin / 2 }}>
        <View style={[styles.spreadHalf, { width, height: halfHeight }]}>
          <Image
            source={{ uri }}
            style={{ width, height, top: 0 }}
            resizeMode="cover" // dimensions come from the image's own ratio, so cover never crops
          />
        </View>
        <View style={[styles.spreadHalf, { width, height: halfHeight }]}>
          <Image
            source={{ uri }}
            style={{ width, height, top: -halfHeight }}
            resizeMode="cover"
          />
        </View>
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      style={{
        width,
        height,
        alignSelf: fitHeight ? 'center' : 'stretch',
        marginVertical: margin / 2,
      }}
      resizeMode="cover" // safe now — width/height are computed from the image's own real ratio, so cover never crops
    />
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  placeholder: {
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spreadHalf: {
    overflow: 'hidden',
    alignSelf: 'stretch',
  },
});
