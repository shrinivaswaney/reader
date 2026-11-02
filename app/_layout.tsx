import { JetBrainsMono_100Thin } from '@expo-google-fonts/jetbrains-mono/100Thin';
import { JetBrainsMono_100Thin_Italic } from '@expo-google-fonts/jetbrains-mono/100Thin_Italic';
import { JetBrainsMono_200ExtraLight } from '@expo-google-fonts/jetbrains-mono/200ExtraLight';
import { JetBrainsMono_200ExtraLight_Italic } from '@expo-google-fonts/jetbrains-mono/200ExtraLight_Italic';
import { JetBrainsMono_300Light } from '@expo-google-fonts/jetbrains-mono/300Light';
import { JetBrainsMono_300Light_Italic } from '@expo-google-fonts/jetbrains-mono/300Light_Italic';
import { JetBrainsMono_400Regular } from '@expo-google-fonts/jetbrains-mono/400Regular';
import { JetBrainsMono_400Regular_Italic } from '@expo-google-fonts/jetbrains-mono/400Regular_Italic';
import { JetBrainsMono_500Medium } from '@expo-google-fonts/jetbrains-mono/500Medium';
import { JetBrainsMono_500Medium_Italic } from '@expo-google-fonts/jetbrains-mono/500Medium_Italic';
import { JetBrainsMono_600SemiBold } from '@expo-google-fonts/jetbrains-mono/600SemiBold';
import { JetBrainsMono_600SemiBold_Italic } from '@expo-google-fonts/jetbrains-mono/600SemiBold_Italic';
import { JetBrainsMono_700Bold } from '@expo-google-fonts/jetbrains-mono/700Bold';
import { JetBrainsMono_700Bold_Italic } from '@expo-google-fonts/jetbrains-mono/700Bold_Italic';
import { JetBrainsMono_800ExtraBold } from '@expo-google-fonts/jetbrains-mono/800ExtraBold';
import { JetBrainsMono_800ExtraBold_Italic } from '@expo-google-fonts/jetbrains-mono/800ExtraBold_Italic';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  return (
    <>
      {/* 'auto' would follow the OS; follow OUR resolved scheme instead so a
          manual override in Profile restyles the status bar too */}
      {/* <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} /> */}
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#000' },
        }}
      >
        <Stack.Screen name="(tabs)" />
        {/* <Stack.Screen name="settings/reading" options={{ presentation: 'card' }} />
        <Stack.Screen name="manga/[id]" options={{ presentation: 'card' }} />
        <Stack.Screen
          name="reader/[mangaId]/[chapterId]"
          options={{ presentation: 'fullScreenModal', animation: 'fade' }}
        /> */}
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    JetBrainsMono_100Thin,
    JetBrainsMono_200ExtraLight,
    JetBrainsMono_300Light,
    JetBrainsMono_400Regular,
    JetBrainsMono_500Medium,
    JetBrainsMono_600SemiBold,
    JetBrainsMono_700Bold,
    JetBrainsMono_800ExtraBold,
    JetBrainsMono_100Thin_Italic,
    JetBrainsMono_200ExtraLight_Italic,
    JetBrainsMono_300Light_Italic,
    JetBrainsMono_400Regular_Italic,
    JetBrainsMono_500Medium_Italic,
    JetBrainsMono_600SemiBold_Italic,
    JetBrainsMono_700Bold_Italic,
    JetBrainsMono_800ExtraBold_Italic,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return <RootNavigator />;
}
