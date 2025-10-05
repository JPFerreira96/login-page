import { Injectable } from '@angular/core';
import { tap } from 'rxjs';
import { AuthResponse } from '../../interface/auth-response.interface';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class LoginService {
  constructor(private auth: AuthService) {}

  login(email: string, password: string) {
    return this.auth.login({ email, password }).pipe(
      tap((res: AuthResponse) => this.auth.saveAuth(res))
    );
  }
}
