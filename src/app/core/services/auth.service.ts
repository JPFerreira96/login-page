// // // src/app/core/services/auth.service.ts
// // import { HttpClient } from '@angular/common/http';
// // import { Injectable } from '@angular/core';
// // import { environment } from '../../../enviroments/enviroment';
// // // import { environment } from '../../../environments/environment';

// // export interface LoginReq { email: string; password: string; }
// // export interface AuthResponse {
// //   token: string; tokenType: string; expiresInMs: number;
// //   user: { id: number; name: string; email: string; role: 'USER'|'ADMIN' };
// // }

// // type JwtPayload = { exp: number; sub?: string; [k: string]: any };

// // @Injectable({ providedIn: 'root' })
// // export class AuthService {
// //   private base = environment.apiBaseUrl;

// //   constructor(private http: HttpClient) {}

// //   // API
// //   login(data: LoginReq) {
// //     return this.http.post<AuthResponse>(`${this.base}/auth/login`, data);
// //   }

// //   signup(data: { name: string; email: string; password: string }) {
// //     return this.http.post<AuthResponse>(`${this.base}/auth/signup`, data);
// //   }

// //   // Storage
// //   saveAuth(res: AuthResponse) { 
// //     localStorage.setItem('auth', JSON.stringify(res)); 
// //   }

// //   getAuth(): AuthResponse | null {
// //     const v = localStorage.getItem('auth'); return v ? JSON.parse(v) : null;
// //   }

// //   getToken(): string | null { 
// //     return this.getAuth()?.token ?? null; 
// //   }

// //   getRole(): 'USER'|'ADMIN'|null { 
// //     return this.getAuth()?.user.role ?? null; 
// //   }

// //   logout(){ 
// //     localStorage.removeItem('auth'); 
// //   }

// //   // Helpers
// //   private decode<T = JwtPayload>(token: string): T | null {
// //     try {
// //       const [, payload] = token.split('.');
// //       return JSON.parse(atob(payload)) as T;
// //     } catch { return null; }
// //   }

// //   isLoggedIn(leewayMs = 5000): boolean {
// //     const token = this.getToken();
// //     if (!token) return false;
// //     const payload = this.decode<JwtPayload>(token);
// //     if (!payload?.exp) return false;
// //     const expiresAt = payload.exp * 1000;
// //     return (expiresAt - leewayMs) > Date.now();
// //   }

// //   hasRole(role: 'USER'|'ADMIN'): boolean {
// //     return this.isLoggedIn() && this.getRole() === role;
// //   }

// //   /** Útil em guards funcionais: true ou faz logout + retorna false */
// //   requireAuth(): boolean {
// //     if (this.isLoggedIn()) return true;
// //     this.logout();
// //     return false;
// //   }

// //   isAuthenticated(): boolean {
// //   return !!localStorage.getItem('auth');   // onde você salvou o token
// // }
// // }

// // src/app/core/services/auth.service.ts
// import { HttpClient } from '@angular/common/http';
// import { Injectable } from '@angular/core';
// import { environment } from '../../../enviroments/enviroment';
// // import { environment } from '../../../environments/environment';

// export interface AuthResponse {
//   token: string;
//   tokenType: 'Bearer';
//   expiresInMs?: number;        // opcional (já tem exp no JWT)
//   user: { id:number; name:string; email:string; role:'USER'|'ADMIN' };
// }

// type StorageMode = 'session' | 'local';

// @Injectable({ providedIn: 'root' })
// export class AuthService {
//   private base = environment.apiBaseUrl;
//   private KEY = 'auth';

//   constructor(private http: HttpClient) {}

//   // ---- API ----
//   login(data: { email: string; password: string }) {
//     return this.http.post<AuthResponse>(`${this.base}/auth/login`, data);
//   }
//   signup(data: { name: string; email: string; password: string; role: string }) {
//     return this.http.post<AuthResponse>(`${this.base}/auth/signup`, data);
//   }

//   // ---- Persistência ----
//   /** Salva auth. Se remember=true usa localStorage; senão sessionStorage */
//   saveAuth(res: AuthResponse, remember = false) {
//     const payload = this.decodeJwt(res.token);
//     const expMs = payload?.exp ? payload.exp * 1000 : Date.now() + (res.expiresInMs ?? 0);

//     const auth = {
//       token: res.token,
//       tokenType: res.tokenType,
//       exp: expMs,
//       user: res.user,
//     };

//     const store = remember ? localStorage : sessionStorage;
//     store.setItem(this.KEY, JSON.stringify(auth));
//   }

//   /** Lê auth de sessionStorage OU localStorage (prioriza sessão) */
//   private readAuth(): { token:string; exp:number; user:any } | null {
//     const raw = sessionStorage.getItem(this.KEY) ?? localStorage.getItem(this.KEY);
//     if (!raw) return null;
//     try { return JSON.parse(raw); } catch { return null; }
//   }

//   isAuthenticated(): boolean {
//     const auth = this.readAuth();
//     if (!auth?.token || !auth?.exp) { this.logout(); return false; }
//     if (Date.now() >= auth.exp) { this.logout(); return false; }
//     return true;
//   }

//   getRole(): 'USER' | 'ADMIN' | null {
//     return this.readAuth()?.user?.role ?? null;
//   }

//   getToken(): string | null {
//     return this.readAuth()?.token ?? null;
//   }

//   logout() {
//     sessionStorage.removeItem(this.KEY);
//     localStorage.removeItem(this.KEY);
//   }

//   // ---- util ----
//   private decodeJwt(token: string): any | null {
//     try {
//       const payload = token.split('.')[1];
//       return JSON.parse(atob(payload));
//     } catch { return null; }
//   }
// }

// src/app/core/services/auth.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../enviroments/enviroment';
// import { environment } from '../../../environments/environment';

export interface AuthResponse {
  token: string;
  tokenType: 'Bearer';
  expiresInMs?: number;
  user: { id: number; name: string; email: string; role: 'USER'|'ADMIN' };
}

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
    const expFromJwt = this.decodeJwt(res.token)?.exp; // segundos
    const expMs = expFromJwt ? expFromJwt * 1000 : (Date.now() + (res.expiresInMs ?? 0));
    const data = { token: res.token, tokenType: res.tokenType, exp: expMs, user: res.user };

    const store = remember ? localStorage : sessionStorage;
    store.setItem(this.KEY, JSON.stringify(data));
  }

  private readAuth(): { token:string; exp:number; user:any } | null {
    const raw = sessionStorage.getItem(this.KEY) ?? localStorage.getItem(this.KEY);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  }

  isAuthenticated(): boolean {
    const auth = this.readAuth();
    if (!auth?.token || !auth?.exp) return false;
    if (Date.now() >= auth.exp) { this.logout(); return false; }
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
