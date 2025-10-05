export interface AuthResponse {
  token: string;
  tokenType: 'Bearer';
  expiresInMs?: number;
  user: { id: number; name: string; email: string; role: 'USER'|'ADMIN' };
}