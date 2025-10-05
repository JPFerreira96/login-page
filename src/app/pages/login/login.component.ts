import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { DefaultLoginLayoutComponent } from '../../components/default-login-layout/default-login-layout.component';
import { PrimaryInputComponent } from '../../components/primary-input/primary-input.component';
import { AuthService } from '../../core/services/auth.service';
import { LoginService } from '../../core/services/login.service';

@Component({
  selector: 'app-login',
  standalone: true,
  providers: [
    LoginService,
    ToastrService
  ],
  imports: [
    DefaultLoginLayoutComponent,
    ReactiveFormsModule,

    PrimaryInputComponent
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})

export class LoginComponent {
  loginForm!: FormGroup;

  constructor(
    private router: Router,
    @Inject(LoginService) private loginService: LoginService,
    private toastService: ToastrService,
    private auth: AuthService
  ) {
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    });
  }

  onSubmit() {
    const { email, password } = this.loginForm.value;

    const remember = !!this.loginForm.value.rememberMe;

    this.loginService.login(email, password).subscribe({
      next: (res) => {
        console.log('Login response:', res);
        this.auth.saveAuth(res, remember);
        const role = res?.user?.role;

        setTimeout(() => {
          if (role) {
            this.router.navigate([role === 'ADMIN' ? '/admin' : '/dashboard']);
          } else {

            console.warn('Role not found in response, redirecting to dashboard');
            this.router.navigate(['/dashboard']);
          }
        }, 100);
      },
      error: (err) => {
        console.error('Login error:', err);
        this.toastService.error('Usuário ou senha inválidos');
      }
    });
  }

  navigate() {
    this.router.navigate(['signup']);
  }
}