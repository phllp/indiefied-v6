import HomeScreen from '@/screens/Home';
import PlaylistsScreen from '@/screens/Playlists';
import SearchScreen from '@/screens/Search';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import palette from 'src/styles/colors';
import { Ionicons } from '@expo/vector-icons';
import { usePlayer } from '@/context/PlayerProvider';
import { useOverlay } from '@/context/OverlayProvider';

export default function MainTabs() {
  const { closePlayer, isPlayerOpen } = usePlayer();
  const { close } = useOverlay();

  const Tab = createBottomTabNavigator();
  return (
    <Tab.Navigator
      screenListeners={{
        tabPress: () => {
          closePlayer();
          close();
        },
      }}
      screenOptions={{
        // ícones/labels da tab
        tabBarActiveTintColor: !isPlayerOpen ? palette.primary : palette.muted, // amarelo nos ativos
        tabBarInactiveTintColor: palette.muted, // cinza nos inativos

        // barra inferior (surface)
        tabBarStyle: {
          backgroundColor: palette.surface,
          borderTopWidth: 1,
          borderTopColor: palette.border,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        tabBarItemStyle: {},
        // leve realce no item ativo (amarelo suave translúcido)
        tabBarActiveBackgroundColor: isPlayerOpen ? 'transparent' : '#FFF17622',

        // header: fundo dark, título claro; amarelo nos botões/ações
        headerStyle: {
          backgroundColor: palette.bg,
        },
        headerTitleStyle: {
          color: palette.content,
          fontWeight: 'bold',
        },
        headerTintColor: palette.primary, // ícone de back / action em amarelo
        headerShadowVisible: false,
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Início',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarLabel: 'Buscar',
          tabBarIcon: ({ color, size }) => <Ionicons name="search" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Playlists"
        component={PlaylistsScreen}
        options={{
          tabBarLabel: 'Playlists',
          tabBarIcon: ({ color, size }) => <Ionicons name="list" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}
