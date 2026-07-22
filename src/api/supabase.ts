import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SupabaseClient } from '@supabase/supabase-js';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

let client: SupabaseClient | null | undefined;

/**
 * Supabase 클라이언트 (lazy).
 * - env가 없으면 null — 앱은 로컬 저장만으로 동작한다.
 * - 웹 정적 export(SSR) 중 모듈 로드 시점에 생성하지 않도록 lazy로 만든다.
 */
export const getSupabase = (): SupabaseClient | null => {
  if (client !== undefined) return client;
  if (!url || !anonKey) {
    client = null;
    return client;
  }
  if (Platform.OS !== 'web') {
    // supabase-js가 쓰는 URL API 폴리필 (RN/Hermes)
    require('react-native-url-polyfill/auto');
  }
  const { createClient } = require('@supabase/supabase-js') as typeof import('@supabase/supabase-js');
  client = createClient(url, anonKey, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
  return client;
};
