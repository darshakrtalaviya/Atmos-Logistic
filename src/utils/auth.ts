export interface AuthUser {
  username: string;
  isLoggedIn: boolean;
  lastLogin?: string;
}

const AUTH_STORAGE_KEY = 'atmos_auth_credentials_v1';
const SESSION_STORAGE_KEY = 'atmos_auth_session_v1';

export const DEFAULT_CREDENTIALS = {
  username: 'ATMOS.GROUP',
  password: 'Atmos@01012026',
  securityAnswer: 'ATMOS',
};

export const SECURITY_QUESTIONS_POOL = [
  'ફેક્ટરી ગ્રુપનું નામ શું છે? (Factory Group Name)',
  'મુખ્ય સુરક્ષા કીવર્ડ શું છે? (Primary Security Keyword)',
  'પ્લાન્ટ બ્રાન્ડ નેમ શું છે? (Plant Brand Name)',
  'ઓથોરાઇઝ્ડ એડમિન કોડ શું છે? (Authorized Admin Code)',
  'રજિસ્ટર્ડ ટ્રેડમાર્ક શું છે? (Registered Trademark)',
];

export function getStoredCredentials() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(DEFAULT_CREDENTIALS));
      return DEFAULT_CREDENTIALS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_CREDENTIALS;
  }
}

export function saveStoredCredentials(creds: { username: string; password: string; securityAnswer?: string }) {
  const current = getStoredCredentials();
  const updated = {
    ...current,
    ...creds,
  };
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
}

export function getAuthSession(): AuthUser | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) {
      const defaultUser: AuthUser = {
        username: 'ATMOS.GROUP',
        isLoggedIn: true,
        lastLogin: new Date().toISOString(),
      };
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(defaultUser));
      return defaultUser;
    }
    return JSON.parse(raw);
  } catch {
    return {
      username: 'ATMOS.GROUP',
      isLoggedIn: true,
      lastLogin: new Date().toISOString(),
    };
  }
}

export function setAuthSession(user: AuthUser | null) {
  if (!user) {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  } else {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
  }
}

export function verifyLogin(usernameInput: string, passwordInput: string): { success: boolean; message?: string } {
  const creds = getStoredCredentials();
  const cleanUser = usernameInput.trim();
  const cleanPass = passwordInput.trim();

  if (cleanUser.toUpperCase() !== creds.username.toUpperCase()) {
    return { success: false, message: 'ખોટું યુઝરનેમ (Invalid Username). Default: ATMOS.GROUP' };
  }
  if (cleanPass !== creds.password) {
    return { success: false, message: 'ખોટો પાસવર્ડ (Incorrect Password).' };
  }
  return { success: true };
}

export function changePasswordWithOld(oldPass: string, newPass: string): { success: boolean; message: string } {
  const creds = getStoredCredentials();
  if (oldPass !== creds.password) {
    return { success: false, message: 'જૂનો પાસવર્ડ ખોટો છે (Old password does not match).' };
  }
  if (!newPass || newPass.length < 6) {
    return { success: false, message: 'ઓછામાં ઓછા 6 અક્ષર જરૂરી છે (Minimum 6 characters required).' };
  }
  saveStoredCredentials({ ...creds, password: newPass });
  return { success: true, message: 'પાસવર્ડ સફળતાપૂર્વક બદલાઈ ગયો (Password changed successfully)!' };
}

export function resetPasswordWithSecurityAnswers(
  answers: string[],
  newPass: string
): { success: boolean; message: string } {
  const creds = getStoredCredentials();
  const expected = (creds.securityAnswer || 'ATMOS').trim().toUpperCase();

  // All 3 security question answers are expected to be: ATMOS
  const allCorrect = answers.every((ans) => (ans || '').trim().toUpperCase() === expected);
  if (!allCorrect) {
    return {
      success: false,
      message: 'સુરક્ષા જવાબ ખોટો છે. સાચો જવાબ "ATMOS" દાખલ કરો.',
    };
  }
  if (!newPass || newPass.length < 6) {
    return { success: false, message: 'ઓછામાં ઓછા 6 અક્ષર હોવા જોઈએ (Minimum 6 characters).' };
  }
  saveStoredCredentials({ ...creds, password: newPass });
  return { success: true, message: 'પાસવર્ડ સફળતાપૂર્વક રિસેટ થઈ ગયો.' };
}
