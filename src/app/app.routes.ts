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

  // Dashboard com subrotas
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./components/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    canMatch: [authCanMatch],
    children: [
      { 
        path: '', 
        redirectTo: 'cards', 
        pathMatch: 'full' 
      },
      {
        path: 'cards',
        loadComponent: () =>
          import('./pages/cards/cards.component').then(m => m.CardsComponent)
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./pages/profile/profile.component').then(m => m.ProfileComponent)
      },
      {
        path: 'requests',
        loadComponent: () =>
          import('./pages/requests/requests.component').then(m => m.RequestsComponent)
      },
      {
        path: 'credits',
        loadComponent: () =>
          import('./pages/credits/credits.component').then(m => m.CreditsComponent)
      },
      {
        path: 'debug',
        loadComponent: () =>
          import('./pages/debug/debug.component').then(m => m.DebugComponent)
      }
    ]
  },

  { path: '**', redirectTo: 'login' },
];