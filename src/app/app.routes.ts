// import { Routes } from '@angular/router';
// import { guestCanMatch } from './core/auth.guard';
// import { LoginComponent } from './pages/login/login.component';
// import { SignupComponent } from './pages/signup/signup.component';
// import { AuthService } from './core/services/auth.service';

// export const routes: Routes = [
//   { path: '', pathMatch: 'full', redirectTo: 'login' },
//     { path: 'login',  component: LoginComponent,  canMatch: [guestCanMatch] },
//   { path: 'signup', component: SignupComponent, canMatch: [guestCanMatch] },

//   // novas rotas:
//   { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard.component')
//       .then(m => m.DashboardComponent), canActivate: [AuthService] },
//   // { path: 'admin', loadComponent: () => import('./pages/admin/admin.component')
//   //     .then(m => m.AdminComponent) },

//   { path: '**', redirectTo: 'login' },
// ];


import { Routes } from '@angular/router';
import { authCanMatch, guestCanMatch } from './core/auth.guard';
import { LoginComponent } from './pages/login/login.component';
import { SignupComponent } from './pages/signup/signup.component';

// ✅ importe do arquivo certo
// import { authCanMatch, guestCanMatch } from './core/auth/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },

  // Bloquear se já estiver logado
  { path: 'login',  component: LoginComponent,  canMatch: [guestCanMatch] },
  { path: 'signup', component: SignupComponent, canMatch: [guestCanMatch] },

  // Proteger dashboard: precisa estar logado
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canMatch: [authCanMatch],        // 👈 use o guard aqui
  },

  { path: '**', redirectTo: 'login' },
];