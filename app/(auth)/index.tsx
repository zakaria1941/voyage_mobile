import { Redirect } from 'expo-router';

// The (auth) group's Stack has no natural initial screen of its own;
// redirect explicitly to sign-in rather than rely on implicit ordering.
export default function AuthIndex() {
  return <Redirect href="/(auth)/sign-in" />;
}
