import { Link } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AuthButton } from '@/components/auth/auth-button';
import { AuthScreenLayout } from '@/components/auth/auth-screen-layout';
import { AuthTextInput } from '@/components/auth/auth-text-input';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/context/auth-context';
import { isValidEmail } from '@/utils/validation';

type FormErrors = { email?: string; password?: string };

export default function SignInScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function validate(): boolean {
    const next: FormErrors = {};
    if (!isValidEmail(email)) next.email = 'Enter a valid email address.';
    if (!password) next.password = 'Enter your password.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit() {
    setFormError(null);
    if (!validate()) return;
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      // No manual navigation here: app/_layout.tsx's Stack.Protected swaps
      // to the (tabs) group automatically once auth state resolves.
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'We couldn’t sign you in. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthScreenLayout title="Welcome back" subtitle="Sign in to continue to Voyago">
      <View style={styles.form}>
        <AuthTextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoComplete="email"
          textContentType="emailAddress"
          error={errors.email}
        />
        <AuthTextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          isPassword
          autoComplete="current-password"
          textContentType="password"
          error={errors.password}
        />
        <Link href="/(auth)/forgot-password" style={styles.forgotLink}>
          <ThemedText type="link">Forgot password?</ThemedText>
        </Link>
        {formError ? <ThemedText style={styles.formError}>{formError}</ThemedText> : null}
        <AuthButton label="Sign in" onPress={handleSubmit} loading={submitting} />
        <View style={styles.footer}>
          <ThemedText>Don&apos;t have an account? </ThemedText>
          <Link href="/(auth)/sign-up">
            <ThemedText type="link">Create one</ThemedText>
          </Link>
        </View>
      </View>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  form: { gap: 16 },
  forgotLink: { alignSelf: 'flex-end' },
  formError: { color: '#dc2626', fontSize: 14 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 8 },
});
