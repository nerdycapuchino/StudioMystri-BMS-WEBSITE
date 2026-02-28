// In-memory token store — NOT localStorage (prevents XSS token theft)
let _accessToken: string | null = null;

export const getAccessToken = (): string | null => _accessToken;
export const setAccessToken = (token: string): void => { _accessToken = token; };
export const clearAccessToken = (): void => { _accessToken = null; };
