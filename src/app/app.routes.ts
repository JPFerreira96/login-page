import { Routes } from '@angular/router';
import { authCanMatch, guestCanMatch } from './core/auth.guard';
import { LoginComponent } from './pages/login/login.component';
import { SignupComponent } from './pages/signup/signup.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },  
  { path: 'login',  component: LoginComponent,  canMatch: [guestCanMatch] },
  { path: 'signup', component: SignupComponent, canMatch: [guestCanMatch] },

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
        path: 'debug',
        loadComponent: () =>
          import('./pages/debug/debug.component').then(m => m.DebugComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./pages/users/users.component').then(m => m.UsersComponent)
      }
    ]
  },

  { path: '**', redirectTo: 'login' },
];