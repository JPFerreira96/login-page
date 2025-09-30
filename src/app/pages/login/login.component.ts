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
    // AuthService,
    PrimaryInputComponent
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'] // Corrigi aqui
})

export class LoginComponent {
  loginForm!: FormGroup;
  
  constructor(
    private router: Router,
    @Inject(LoginService) private loginService: LoginService,
    private toastService: ToastrService, // Adicionei aqui
    private auth: AuthService
  ) {
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    });
  }

  // submit() {
  //   this.loginService.login(this.loginForm.value.email, this.loginForm.value.password).subscribe(
  //     () => this.toastService.success('Login realizado com sucesso'),
  //     (error) => this.toastService.error('Erro ao realizar login')
  //   );
  // }

  //   onSubmit() {
  //   this.loginService.login(this.loginForm.value.email, this.loginForm.value.password)
  //     .subscribe({
  //       next: () => {
  //         const role = this.loginForm.value.role;
  //         this.router.navigate([role === 'ADMIN' ? '/admin' : '/dashboard']);
  //       },
  //       error: () => this.toastService.error('Usuário ou senha inválidos')
  //     });
  // }

  // onSubmit() {
  //   if (this.loginForm.invalid) {
  //     this.toastService.warning('Preencha email e senha válidos');
  //     return;
  //   }

  //   const { email, password } = this.loginForm.value;

  //   this.loginService.login(email, password).subscribe({
  //     next: (res) => {
  //       // res vem do backend: { token, expiresInMs, user: { id, name, email, role }, tokenType }
  //       const role = res.user.role;
  //       this.toastService.success('Login realizado com sucesso');
  //       this.router.navigate([role === 'ADMIN' ? '/admin' : '/dashboard']);
  //     },
  //     error: (err) => {
  //       console.error('[Login] erro', err);
  //       this.toastService.error('Usuário ou senha inválidos');
  //     }
  //   });
  // }

//   onSubmit() {
//   if (this.loginForm.invalid) return;

//   const { email, password } = this.loginForm.value;

//   this.loginService.login(email!, password!).subscribe({
//     next: (res) => {
//       this.toastService.success(`Bem-vindo, ${res.user.name.split(' ')[0]}!`);
//       const role = res.user.role; // <- vem do backend
//       this.router.navigateByUrl(role === 'ADMIN' ? '/admin' : '/dashboard');
//     },
//     error: () => this.toastService.error('Usuário ou senha inválidos'),
//   });
// }

onSubmit() {
  const { email, password } = this.loginForm.value;
  // pegue o valor do checkbox "rememberMe" se tiver
  const remember = !!this.loginForm.value.rememberMe;

  this.loginService.login(email, password).subscribe({
    next: (res) => {
      console.log('Login response:', res); // Para debug
      this.auth.saveAuth(res, remember);   // ⬅️ escolhe session/local
      
      // Verificação defensiva para evitar erro
      const role = res?.user?.role;
      
      // Pequeno delay para garantir que o storage foi salvo
      setTimeout(() => {
        if (role) {
          this.router.navigate([role === 'ADMIN' ? '/admin' : '/dashboard']);
        } else {
          // Fallback se não tiver role definido
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