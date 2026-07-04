import type { AuthResponse } from "@/lib/api";

export const authSessionKey = "restaurant-auth-session";

const authSessionChangeEvent = "restaurant-auth-session-change";

let cachedSessionString: string | null = null;
let cachedSession: AuthResponse | null = null;

function parseStoredSession(storedSession: string | null): AuthResponse | null {
  if (!storedSession) {
    cachedSessionString = null;
    cachedSession = null;
    return null;
  }

  if (storedSession === cachedSessionString) {
    return cachedSession;
  }

  try {
    cachedSessionString = storedSession;
    cachedSession = JSON.parse(storedSession) as AuthResponse;
    return cachedSession;
  } catch {
    window.localStorage.removeItem(authSessionKey);
    cachedSessionString = null;
    cachedSession = null;
    return null;
  }
}

export function getStoredAuthSession(): AuthResponse | null {
  if (typeof window === "undefined") {
    return null;
  }

  return parseStoredSession(window.localStorage.getItem(authSessionKey));
}

export function subscribeToAuthSessionChanges(onStoreChange: () => void) {
  const handleStorageChange = (event: StorageEvent) => {
    if (event.key === authSessionKey) {
      onStoreChange();
    }
  };

  window.addEventListener("storage", handleStorageChange);
  window.addEventListener(authSessionChangeEvent, onStoreChange);

  return () => {
    window.removeEventListener("storage", handleStorageChange);
    window.removeEventListener(authSessionChangeEvent, onStoreChange);
  };
}

export function saveAuthSession(session: AuthResponse) {
  window.localStorage.setItem(authSessionKey, JSON.stringify(session));
  window.dispatchEvent(new Event(authSessionChangeEvent));
}

export function clearAuthSession() {
  window.localStorage.removeItem(authSessionKey);
  cachedSessionString = null;
  cachedSession = null;
  window.dispatchEvent(new Event(authSessionChangeEvent));
}
