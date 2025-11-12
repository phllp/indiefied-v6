import { View, Text } from 'react-native';

export default function SearchScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-3xl font-bold text-gray-800">Buscar</Text>
      <Text className="mt-2 text-gray-600">Essa é a tela de busca</Text>
    </View>
  );
}
