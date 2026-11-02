import { Database } from '@/types/database.types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';
import { env } from '@/lib/env';

export const supabase = createClient<Database>(env.supabaseUrl, env.supabaseAnonKey, {
    auth: {
        storage: AsyncStorage,       // persists the session on-device between app launches
        autoRefreshToken: true,      // silently refreshes the auth token before it expires
        persistSession: true,
        detectSessionInUrl: false,   // irrelevant on native, avoids a web-only warning
    },
});