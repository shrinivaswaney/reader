import { StyleSheet, Text as RNText } from 'react-native';
import type { TextProps, TextStyle } from 'react-native';

type FontWeight = TextStyle['fontWeight'];

const FAMILY_BY_WEIGHT: Record<string, string> = {
  '100': 'JetBrainsMono_100Thin',
  '200': 'JetBrainsMono_200ExtraLight',
  '300': 'JetBrainsMono_300Light',
  '400': 'JetBrainsMono_400Regular',
  '500': 'JetBrainsMono_500Medium',
  '600': 'JetBrainsMono_600SemiBold',
  '700': 'JetBrainsMono_700Bold',
  '800': 'JetBrainsMono_800ExtraBold',
  '900': 'JetBrainsMono_800ExtraBold',
};

function resolveFontFamily(weight: FontWeight, italic: boolean): string {
  let key = '400';
  if (weight === 'bold') {
    key = '700';
  } else if (weight != null && weight !== 'normal') {
    key = String(weight);
  }
  const family = FAMILY_BY_WEIGHT[key] ?? FAMILY_BY_WEIGHT['400'];
  return italic && !family.endsWith('_Italic') ? `${family}_Italic` : family;
}

export function Text({ style, ...props }: TextProps) {
  const flat = StyleSheet.flatten(style);
  const family = resolveFontFamily(flat?.fontWeight, flat?.fontStyle === 'italic');

  const { fontWeight: _fontWeight, fontStyle: _fontStyle, ...restStyle } = flat ?? {};

  return <RNText {...props} style={[restStyle, { fontFamily: family }]} />;
}