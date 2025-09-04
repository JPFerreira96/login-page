// // // src/app/core/auth/auth.guard.fn.ts
// // import { inject } from '@angular/core';
// // import { CanActivateFn, Router } from '@angular/router';
// // import { AuthService } from './services/auth.service';

// // export const authGuard: CanActivateFn = () => {
// //   const auth = inject(AuthService);
// //   const router = inject(Router);
// //   if (auth.isLoggedIn()) return true;
// //   auth.logout();
// //   return router.parseUrl('/login');
// // };

// // export const adminGuard: CanActivateFn = () => {
// //   const auth = inject(AuthService);
// //   const router = inject(Router);
// //   if (auth.isLoggedIn() && auth.getRole() === 'ADMIN') return true;
// //   return router.parseUrl('/dashboard');
// // };


// import { inject } from '@angular/core';
// import { CanActivateFn, CanMatchFn, Router } from '@angular/router';
// import { AuthService } from './services/auth.service';
// // import { AuthService } from '../services/auth.service';

// function checkAuth(): boolean {
//   const auth = inject(AuthService);
//   const router = inject(Router);

//   const ok = auth.isAuthenticated();            // retorna true se existe token no localStorage
//   if (!ok) router.navigateByUrl('/login');      // redireciona se não logado
//   return ok;
// }

// export const authCanMatch: CanMatchFn = () => {
//   // console.log('[guard] canMatch chamado');   // útil para depurar
//   return checkAuth();
// };

// export const authCanActivate: CanActivateFn = () => {
//   // console.log('[guard] canActivate chamado');
//   return checkAuth();
// };

// export const guestCanMatch: CanMatchFn = () => {
//   const auth = inject(AuthService);
//   const router = inject(Router);
//   if (auth.isAuthenticated()) {

//     console.log("[guard] guestCanMatch chamado");
//     router.navigateByUrl('/dashboard');
//     return false;
//   }
//   return true;
// };

// src/app/core/auth/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, CanMatchFn, Router } from '@angular/router';
import { AuthService } from './services/auth.service';
// import { AuthService } from '../services/auth.service';

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
