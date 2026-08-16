import { Link } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AuthButton } from '@/components/auth/auth-button';
import { AuthScreenLayout } from '@/components/auth/auth-screen-layout';
import { AuthTextInput } from '@/components/auth/auth-text-input';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/context/auth-context';
import { isValidEmail } from '@/utils/validation';

export default function ForgotPasswordScreen() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  async function handleSubmit() {
    setFormError(null);
    if (!isValidEmail(email)) {
      setError('Enter a valid email address.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await resetPassword(email.trim());
      setSentTo(email.trim());
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'We couldn’t send the reset email. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (sentTo) {
    return (
      <AuthScreenLayout title="Check your email" subtitle={`We sent a password reset link to ${sentTo}.`}>
        <Link href="/(auth)/sign-in" style={styles.backLink}>
          <ThemedText type="link">Back to sign in</ThemedText>
        </Link>
      </AuthScreenLayout>
    );
  }

  return (
    <AuthScreenLayout title="Forgot password" subtitle="We'll email you a link to reset it">
      <View style={styles.form}>
        <AuthTextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoComplete="email"
          textContentType="emailAddress"
          error={error}
        />
        {formError ? <ThemedText style={styles.formError}>{formError}</ThemedText> : null}
        <AuthButton label="Send reset link" onPress={handleSubmit} loading={submitting} />
        <Link href="/(auth)/sign-in" style={styles.backLink}>
          <ThemedText type="link">Back to sign in</ThemedText>
        </Link>
      </View>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  form: { gap: 16 },
  formError: { color: '#dc2626', fontSize: 14 },
  backLink: { alignSelf: 'center', marginTop: 8 },
});
