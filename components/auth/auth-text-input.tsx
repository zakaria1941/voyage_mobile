import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

type Props = TextInputProps & {
  label: string;
  error?: string | null;
  isPassword?: boolean;
};

export function AuthTextInput({ label, error, isPassword, style, ...rest }: Props) {
  const [hidden, setHidden] = useState(isPassword);
  const borderColor = useThemeColor({}, 'icon');
  const textColor = useThemeColor({}, 'text');

  return (
    <View style={styles.container}>
      <ThemedText style={styles.label}>{label}</ThemedText>
      <View style={[styles.inputRow, { borderColor: error ? '#dc2626' : borderColor }]}>
        <TextInput
          style={[styles.input, { color: textColor }, style]}
          placeholderTextColor="#9BA1A6"
          autoCapitalize="none"
          autoCorrect={false}
          {...rest}
          secureTextEntry={hidden}
        />
        {isPassword ? (
          <Pressable onPress={() => setHidden((v) => !v)} hitSlop={8}>
            <Ionicons name={hidden ? 'eye-outline' : 'eye-off-outline'} size={20} color={borderColor} />
          </Pressable>
        ) : null}
      </View>
      {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 6 },
  label: { fontSize: 14, fontWeight: '600' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 48,
    gap: 8,
  },
  input: { flex: 1, fontSize: 16 },
  error: { color: '#dc2626', fontSize: 13 },
});
