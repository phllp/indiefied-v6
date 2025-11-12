import { View, Text } from 'react-native';

export default function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-3xl font-bold text-gray-800">Home</Text>
      <Text className="mt-2 text-gray-600">Essa é a home</Text>
    </View>
  );
}
