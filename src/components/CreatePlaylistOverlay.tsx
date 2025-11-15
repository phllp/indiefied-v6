import { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import palette from '@/styles/colors';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSave: (data: { name: string; coverFileUri?: string | null }) => Promise<void>;
};

export function CreatePlaylistOverlay({ visible, onClose, onSave }: Props) {
  const [name, setName] = useState('');
  const [coverUri, setCoverUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
      allowsEditing: true,
    });
    if (!res.canceled && res.assets?.length) {
      setCoverUri(res.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onSave({ name: name.trim(), coverFileUri: coverUri ?? undefined });
      setName('');
      setCoverUri(null);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent
      onRequestClose={onClose}>
      {/* Backdrop que cobre tudo sem criar nova root view */}
      <View className="flex-1 bg-black/60" pointerEvents="box-none">
        {/* Conteúdo em tela cheia, respeitando a safe area */}
        <SafeAreaView className="flex-1">
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ flex: 1 }}>
            {/* Container principal */}
            <View className="flex-1 bg-bg">
              {/* Header */}
              <View className="px-5 pt-3">
                <TouchableOpacity
                  onPress={onClose}
                  className="self-start rounded-full p-2 active:opacity-80">
                  <Text className="text-lg text-content">✕</Text>
                </TouchableOpacity>
              </View>

              {/* Conteúdo */}
              <View className="mt-2 px-6">
                <Text className="text-2xl font-bold text-content">Nova playlist</Text>

                <View className="mt-6">
                  <Text className="mb-2 text-muted">Nome</Text>
                  <View className="rounded-lg border border-border bg-surface px-3 py-2">
                    <TextInput
                      placeholder="Minha playlist"
                      placeholderTextColor={palette.muted}
                      className="text-content"
                      value={name}
                      onChangeText={setName}
                      selectionColor={palette.primary}
                      cursorColor={palette.primary as any}
                      returnKeyType="done"
                      onSubmitEditing={handleSave}
                    />
                  </View>
                </View>

                <View className="mt-6">
                  <Text className="mb-2 text-muted">Capa (opcional)</Text>
                  <TouchableOpacity
                    onPress={pickImage}
                    activeOpacity={0.9}
                    className="size-64 items-center justify-center rounded-xl border border-border bg-surface">
                    {coverUri ? (
                      <Image
                        source={{ uri: coverUri }}
                        style={{ width: '100%', height: '100%' }}
                        contentFit="cover"
                      />
                    ) : (
                      <Text className="text-muted">Selecionar imagem</Text>
                    )}
                  </TouchableOpacity>
                </View>

                <View className="mt-8 flex-row gap-3">
                  <TouchableOpacity
                    onPress={onClose}
                    disabled={saving}
                    className="flex-1 items-center justify-center rounded-lg border border-border bg-surface py-3 active:opacity-90">
                    <Text className="text-content">Cancelar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleSave}
                    disabled={saving || !name.trim()}
                    className="flex-1 items-center justify-center rounded-lg bg-primary py-3 active:opacity-90">
                    <Text className="font-semibold text-black">
                      {saving ? 'Salvando…' : 'Salvar'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}
