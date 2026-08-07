const TOKEN_KEY = "ca_access_token";
const USER_KEY = "ca_user";

/** Session token only — never store API keys or device secrets here. */
export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(TOKEN_KEY);
}

export function setAccessToken(token: string): void {
  sessionStorage.setItem(TOKEN_KEY, token);
}

export function clearAccessToken(): void {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
}

export function getStoredUserJson(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(USER_KEY);
}

export function setStoredUserJson(userJson: string): void {
  sessionStorage.setItem(USER_KEY, userJson);
}
