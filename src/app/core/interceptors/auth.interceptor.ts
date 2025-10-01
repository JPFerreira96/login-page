import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();
  
  console.log('🔐 Interceptor - Request:', req.url);
  console.log('🔐 Interceptor - Token found:', !!token);
  console.log('🔐 Interceptor - Token preview:', token?.substring(0, 20) + '...');
  
  if (token) {
    req = req.clone({ 
      setHeaders: { 
        Authorization: `Bearer ${token}` 
      } 
    });
    console.log('🔐 Interceptor - Authorization header added');
  } else {
    console.log('🔐 Interceptor - No token, skipping authorization header');
  }
  
  return next(req);
};