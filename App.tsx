import './global.css';

import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import palette from 'src/styles/colors';
import PlaylistsScreen from '@/screens/Playlists';
import SearchScreen from '@/screens/Search';
import HomeScreen from '@/screens/Home';
import { PlayerProvider, usePlayer } from '@/context/PlayerProvider';
import { FullPlayerOverlay } from '@/components/FullPlayerOverlay';
import { MiniPlayer } from '@/components/MiniPlayer';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
  initialWindowMetrics,
} from 'react-native-safe-area-context';
import { View } from 'react-native';
import MainTabs from '@/navigation/MainTabs';

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: palette.bg,
    card: palette.surface,
    text: palette.content,
    border: palette.border,
    primary: palette.primary,
  },
};

function Overlays() {
  const insets = useSafeAreaInsets();
  const TAB_BAR_HEIGHT = 60;

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        zIndex: 30,
        elevation: 30,
      }}>
      <FullPlayerOverlay bottomOffset={TAB_BAR_HEIGHT} />
      <MiniPlayer bottomOffset={TAB_BAR_HEIGHT + insets.bottom} />
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <PlayerProvider>
        <NavigationContainer theme={navTheme}>
          <MainTabs />
          <Overlays />
          <StatusBar style="light" />
        </NavigationContainer>
      </PlayerProvider>
    </SafeAreaProvider>
  );
}
