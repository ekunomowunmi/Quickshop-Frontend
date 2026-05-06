import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {createContext, useContext, useEffect, useMemo, useState} from 'react';
import type {AuthUser} from '../services/api';

export type AppMode = 'CUSTOMER' | 'MERCHANT';

type AppModeContextValue = {
  ready: boolean;
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  isStoreOwner: boolean;
};

const MODE_KEY = 'app_mode_v1';
const USER_KEY = 'current_user_v1';

const Ctx = createContext<AppModeContextValue | null>(null);

export function AppModeProvider({children}: {children: React.ReactNode}) {
  const [ready, setReady] = useState(false);
  const [mode, setModeState] = useState<AppMode>('CUSTOMER');
  const [user, setUserState] = useState<AuthUser | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [rawMode, rawUser] = await Promise.all([
          AsyncStorage.getItem(MODE_KEY),
          AsyncStorage.getItem(USER_KEY),
        ]);

        const nextMode =
          rawMode === 'MERCHANT' || rawMode === 'CUSTOMER'
            ? (rawMode as AppMode)
            : 'CUSTOMER';

        const nextUser = rawUser ? (JSON.parse(rawUser) as AuthUser) : null;

        if (!cancelled) {
          setModeState(nextMode);
          setUserState(nextUser);
        }
      } catch {
        // ignore corrupt storage
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<AppModeContextValue>(() => {
    const role = String(user?.role ?? '').trim().toUpperCase();
    const isStoreOwner = role === 'STORE_OWNER';

    function setMode(next: AppMode) {
      setModeState(next);
      AsyncStorage.setItem(MODE_KEY, next).catch(() => {});
    }

    function setUser(next: AuthUser | null) {
      const normalized =
        next == null
          ? null
          : {
              ...next,
              role: next.role ? String(next.role).trim().toUpperCase() : next.role,
            };

      setUserState(normalized);
      if (normalized) {
        AsyncStorage.setItem(USER_KEY, JSON.stringify(normalized)).catch(() => {});
      } else {
        AsyncStorage.removeItem(USER_KEY).catch(() => {});
      }
    }

    return {ready, mode, setMode, user, setUser, isStoreOwner};
  }, [mode, ready, user]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppMode() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAppMode must be used within AppModeProvider');
  return ctx;
}

