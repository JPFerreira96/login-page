

























































import { inject } from '@angular/core';
import { CanActivateFn, CanMatchFn, Router } from '@angular/router';
import { AuthService } from './services/auth.service';


function mustBeAuth(): boolean {
  const auth = inject(AuthService);
  const router = inject(Router);
  const ok = auth.isAuthenticated();
  if (!ok) router.navigateByUrl('/login');
  return ok;
}

export const authCanMatch: CanMatchFn = () => mustBeAuth();
export const authCanActivate: CanActivateFn = () => mustBeAuth();

export const guestCanMatch: CanMatchFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isAuthenticated()) {
    router.navigateByUrl('/dashboard');
    return false;
  }
  return true;
};
