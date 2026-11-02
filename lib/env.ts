// Fail-fast env access. Expo inlines EXPO_PUBLIC_* at bundle time; a missing
// value means the app was built without its .env — crash loudly here instead
// of surfacing as a cryptic Supabase auth error deep in a screen.
function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `Missing required environment variable ${key}. ` +
        'Copy .env.example to .env and fill in the values.'
    );
  }
  return value;
}

export const env = {
  supabaseUrl: requireEnv('EXPO_PUBLIC_SUPABASE_URL'),
  supabaseAnonKey: requireEnv('EXPO_PUBLIC_SUPABASE_ANON_KEY'),
} as const;
