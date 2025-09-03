// src/app/core/services/auth.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../enviroments/enviroment';
// import { environment } from '../../../environments/environment';

export interface LoginReq { email: string; password: string; }
export interface AuthResponse {
  token: string; tokenType: string; expiresInMs: number;
  user: { id: number; name: string; email: string; role: 'USER'|'ADMIN' };
}

type JwtPayload = { exp: number; sub?: string; [k: string]: any };

@Injectable({ providedIn: 'root' })
export class AuthService {
  private base = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  // API
  login(data: LoginReq) {
    return this.http.post<AuthResponse>(`${this.base}/auth/login`, data);
  }
  signup(data: { name: string; email: string; password: string }) {
    return this.http.post<AuthResponse>(`${this.base}/auth/signup`, data);
  }

  // Storage
  saveAuth(res: AuthResponse) { localStorage.setItem('auth', JSON.stringify(res)); }
  getAuth(): AuthResponse | null {
    const v = localStorage.getItem('auth'); return v ? JSON.parse(v) : null;
  }
  getToken(): string | null { return this.getAuth()?.token ?? null; }
  getRole(): 'USER'|'ADMIN'|null { return this.getAuth()?.user.role ?? null; }
  logout(){ localStorage.removeItem('auth'); }

  // Helpers
  private decode<T = JwtPayload>(token: string): T | null {
    try {
      const [, payload] = token.split('.');
      return JSON.parse(atob(payload)) as T;
    } catch { return null; }
  }

  isLoggedIn(leewayMs = 5000): boolean {
    const token = this.getToken();
    if (!token) return false;
    const payload = this.decode<JwtPayload>(token);
    if (!payload?.exp) return false;
    const expiresAt = payload.exp * 1000;
    return (expiresAt - leewayMs) > Date.now();
  }

  hasRole(role: 'USER'|'ADMIN'): boolean {
    return this.isLoggedIn() && this.getRole() === role;
  }

  /** Útil em guards funcionais: true ou faz logout + retorna false */
  requireAuth(): boolean {
    if (this.isLoggedIn()) return true;
    this.logout();
    return false;
  }
}
