import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../enviroments/enviroment';
import { AuthResponse } from '../../interface/auth-response.interface';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private base = environment.apiBaseUrl;
  private KEY = 'auth';

  constructor(private http: HttpClient) {}

  login(data: { email: string; password: string }) {
    return this.http.post<AuthResponse>(`${this.base}/auth/login`, data);
  }
  signup(data: { name: string; email: string; password: string; role: string }) {
    return this.http.post<AuthResponse>(`${this.base}/auth/signup`, data);
  }

  saveAuth(res: AuthResponse, remember = false) {
    if (!res || !res.token) {
      console.error('Invalid auth response:', res);
      return;
    }
    
    const expFromJwt = this.decodeJwt(res.token)?.exp; 
    const expMs = expFromJwt ? expFromJwt * 1000 : (Date.now() + (res.expiresInMs ?? 3600000)); 
    const data = { 
      token: res.token, 
      tokenType: res.tokenType || 'Bearer', 
      exp: expMs, 
      user: res.user || { id: 0, name: '', email: '', role: 'USER' }
    };

    const store = remember ? localStorage : sessionStorage;
    store.setItem(this.KEY, JSON.stringify(data));
    console.log('Auth saved successfully:', { remember, user: data.user });
  }

  private readAuth(): { token:string; exp:number; user:any } | null {
    const raw = sessionStorage.getItem(this.KEY) ?? localStorage.getItem(this.KEY);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  }

  isAuthenticated(): boolean {
    const auth = this.readAuth();
    console.log('Checking authentication:', auth);
    
    if (!auth?.token || !auth?.exp) {
      console.log('No token or expiration found');
      return false;
    }
    
    if (Date.now() >= auth.exp) { 
      console.log('Token expired, logging out');
      this.logout(); 
      return false; 
    }
    
    console.log('User is authenticated');
    return true;
  }

  getRole(): 'USER'|'ADMIN'|null { return this.readAuth()?.user?.role ?? null; }
  getToken(): string|null { return this.readAuth()?.token ?? null; }

  logout() {
    sessionStorage.removeItem(this.KEY);
    localStorage.removeItem(this.KEY);
  }

  private decodeJwt(token: string): any | null {
    try { return JSON.parse(atob(token.split('.')[1])); } catch { return null; }
  }
}
