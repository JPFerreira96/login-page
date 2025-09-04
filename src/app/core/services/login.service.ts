// import { Injectable } from '@angular/core';
// import { tap } from 'rxjs';
// import { AuthService } from './auth.service';

// @Injectable({ providedIn: 'root' })
// export class LoginService {
//   constructor(private auth: AuthService) {}
//   login(name: string, password: string) {
//     return this.auth.login({ email: name, password }).pipe(
//       tap(res => this.auth.saveAuth(res))
//     );
//   }
// }

// core/services/login.service.ts
import { Injectable } from '@angular/core';
import { tap } from 'rxjs';
import { AuthResponse, AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class LoginService {
  constructor(private auth: AuthService) {}

  login(email: string, password: string) {
    return this.auth.login({ email, password }).pipe(
      tap((res: AuthResponse) => this.auth.saveAuth(res))
    );
  }
}
