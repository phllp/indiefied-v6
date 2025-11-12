import './global.css';

import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import palette from 'src/styles/colors';
import PlaylistsScreen from '@/screens/Playlists';
import SearchScreen from '@/screens/Search';
import HomeScreen from '@/screens/Home';

const Tab = createBottomTabNavigator();

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

export default function App() {
  return (
    <NavigationContainer theme={navTheme}>
      <Tab.Navigator
        screenOptions={{
          // ícones/labels da tab
          tabBarActiveTintColor: palette.primary, // amarelo nos ativos
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
          tabBarActiveBackgroundColor: '#FFF17622',

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

      <StatusBar style="light" />
    </NavigationContainer>
  );
}
