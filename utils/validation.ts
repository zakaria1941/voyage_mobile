export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function getPasswordError(password: string): string | null {
  if (password.length < 6) return 'Password must be at least 6 characters.';
  return null;
}
