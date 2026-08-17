import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authConfig } from '../app/store';

const AuthContext = createContext(null);

const base64UrlEncode = (value) =>
  btoa(value)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');

const base64UrlDecode = (value) => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
  return atob(padded);
};

const DEMO_SECRET = 'jwt-demo-secret';

function createSignature(input) {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index) + DEMO_SECRET.length) >>> 0;
  }

  const safeHash = Math.abs(hash).toString(36);
  return base64UrlEncode(safeHash);
}

function isSessionValid(token) {
  try {
    const [headerBase64, payloadBase64, signature] = token.split('.');
    if (!headerBase64 || !payloadBase64 || !signature) {
      return false;
    }

    const payload = JSON.parse(base64UrlDecode(payloadBase64));
    const expectedSignature = createSignature(`${headerBase64}.${payloadBase64}`);

    if (signature !== expectedSignature) {
      return false;
    }

    const expiration = Number(payload.exp ?? 0);
    if (!Number.isFinite(expiration) || expiration < Date.now()) {
      return false;
    }

    return payload;
  } catch (error) {
    return false;
  }
}

async function createJwtToken(user) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    sub: user.email,
    name: user.name,
    role: user.role,
    iat: Date.now(),
    exp: Date.now() + 1000 * 60 * 15,
  };

  const headerBase64 = base64UrlEncode(JSON.stringify(header));
  const payloadBase64 = base64UrlEncode(JSON.stringify(payload));
  const signature = createSignature(`${headerBase64}.${payloadBase64}`);

  return `${headerBase64}.${payloadBase64}.${signature}`;
}

function readSessionFromStorage() {
  const token = window.sessionStorage.getItem(authConfig.storageKey);
  const user = window.sessionStorage.getItem(authConfig.userStorageKey);

  if (!token) {
    return { token: null, user: null };
  }

  const validatedUser = isSessionValid(token);
  if (!validatedUser) {
    window.sessionStorage.removeItem(authConfig.storageKey);
    window.sessionStorage.removeItem(authConfig.userStorageKey);
    return { token: null, user: null };
  }

  return {
    token,
    user: user ? JSON.parse(user) : validatedUser,
  };
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => readSessionFromStorage().token);
  const [user, setUser] = useState(() => readSessionFromStorage().user);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = readSessionFromStorage();
    setToken(stored.token);
    setUser(stored.user);
    setHydrated(true);
  }, []);

  const login = async ({ email, password, role = 'admin' }) => {
    if (!email || !password) {
      throw new Error('Please provide both email and password.');
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedRole = role === 'creator' ? 'creator' : 'admin';
    const credentialMap = {
      admin: {
        email: 'admin@jwt.local',
        password: 'Admin@123',
        name: 'JWT Admin',
      },
      creator: {
        email: 'creator@jwt.local',
        password: 'Creator@123',
        name: 'JWT Creator',
      },
    };

    const selectedCredentials = credentialMap[normalizedRole];
    if (
      normalizedEmail !== selectedCredentials.email ||
      password !== selectedCredentials.password
    ) {
      throw new Error('Invalid credentials. Use the demo credentials shown in the form.');
    }

    const normalizedUser = {
      email: normalizedEmail,
      name: selectedCredentials.name,
      role: normalizedRole,
    };

    const jwt = await createJwtToken(normalizedUser);
    window.sessionStorage.setItem(authConfig.storageKey, jwt);
    window.sessionStorage.setItem(authConfig.userStorageKey, JSON.stringify(normalizedUser));

    setToken(jwt);
    setUser(normalizedUser);
    return jwt;
  };

  const logout = () => {
    window.sessionStorage.removeItem(authConfig.storageKey);
    window.sessionStorage.removeItem(authConfig.userStorageKey);
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token && user),
      hydrated,
      login,
      logout,
    }),
    [token, user, hydrated],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider.');
  }

  return context;
}
