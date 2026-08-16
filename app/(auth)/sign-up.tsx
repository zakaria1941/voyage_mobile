import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AuthButton } from '@/components/auth/auth-button';
import { AuthScreenLayout } from '@/components/auth/auth-screen-layout';
import { AuthTextInput } from '@/components/auth/auth-text-input';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/context/auth-context';
import { getPasswordError, isValidEmail } from '@/utils/validation';

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type FormErrors = Partial<Record<keyof FormState | 'acceptTerms', string>>;

const initialForm: FormState = { firstName: '', lastName: '', email: '', password: '', confirmPassword: '' };

export default function SignUpScreen() {
  const { register } = useAuth();
  const [form, setForm] = useState<FormState>(initialForm);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validate(): boolean {
    const next: FormErrors = {};
    if (!form.firstName.trim()) next.firstName = 'First name is required.';
    if (!form.lastName.trim()) next.lastName = 'Last name is required.';
    if (!isValidEmail(form.email)) next.email = 'Enter a valid email address.';
    const passwordError = getPasswordError(form.password);
    if (passwordError) next.password = passwordError;
    if (form.confirmPassword !== form.password) next.confirmPassword = 'Passwords don’t match.';
    if (!acceptTerms) next.acceptTerms = 'You must accept the terms to continue.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit() {
    setFormError(null);
    if (!validate()) return;
    setSubmitting(true);
    try {
      await register({
        email: form.email.trim(),
        password: form.password,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
      });
      // No manual navigation here: app/_layout.tsx's Stack.Protected swaps
      // to the (tabs) group automatically once auth state resolves.
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'We couldn’t create your account. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthScreenLayout title="Create your account" subtitle="Join Voyago to start planning your trips">
      <View style={styles.form}>
        <AuthTextInput
          label="First name"
          value={form.firstName}
          onChangeText={(v) => update('firstName', v)}
          autoCapitalize="words"
          textContentType="givenName"
          error={errors.firstName}
        />
        <AuthTextInput
          label="Last name"
          value={form.lastName}
          onChangeText={(v) => update('lastName', v)}
          autoCapitalize="words"
          textContentType="familyName"
          error={errors.lastName}
        />
        <AuthTextInput
          label="Email"
          value={form.email}
          onChangeText={(v) => update('email', v)}
          keyboardType="email-address"
          autoComplete="email"
          textContentType="emailAddress"
          error={errors.email}
        />
        <AuthTextInput
          label="Password"
          value={form.password}
          onChangeText={(v) => update('password', v)}
          isPassword
          autoComplete="new-password"
          textContentType="newPassword"
          error={errors.password}
        />
        <AuthTextInput
          label="Confirm password"
          value={form.confirmPassword}
          onChangeText={(v) => update('confirmPassword', v)}
          isPassword
          autoComplete="new-password"
          textContentType="newPassword"
          error={errors.confirmPassword}
        />

        <Pressable style={styles.termsRow} onPress={() => setAcceptTerms((v) => !v)} hitSlop={8}>
          <Ionicons name={acceptTerms ? 'checkbox' : 'square-outline'} size={22} color="#0a7ea4" />
          <ThemedText style={styles.termsText}>I accept the Terms of Service and Privacy Policy</ThemedText>
        </Pressable>
        {errors.acceptTerms ? <ThemedText style={styles.formError}>{errors.acceptTerms}</ThemedText> : null}

        {formError ? <ThemedText style={styles.formError}>{formError}</ThemedText> : null}
        <AuthButton label="Create account" onPress={handleSubmit} loading={submitting} />
        <View style={styles.footer}>
          <ThemedText>Already have an account? </ThemedText>
          <Link href="/(auth)/sign-in">
            <ThemedText type="link">Sign in</ThemedText>
          </Link>
        </View>
      </View>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  form: { gap: 16 },
  termsRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  termsText: { flex: 1, fontSize: 14 },
  formError: { color: '#dc2626', fontSize: 14 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 8 },
});
