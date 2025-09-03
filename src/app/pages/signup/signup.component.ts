// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-signup',
//   standalone: true,
//   imports: [],
//   templateUrl: './signup.component.html',
//   styleUrl: './signup.component.scss'
// })
// export class SignupComponent {

// }

import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { DefaultLoginLayoutComponent } from '../../components/default-login-layout/default-login-layout.component';
import { PrimaryInputComponent } from '../../components/primary-input/primary-input.component';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  providers: [
    AuthService,
    ToastrService
  ],
  imports: [
    DefaultLoginLayoutComponent,
    ReactiveFormsModule,
    PrimaryInputComponent
  ],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'] // Corrigi aqui
})

export class SignupComponent {
  signupForm!: FormGroup;

  constructor(
    private router: Router,
    private authService: AuthService,
    private toastService: ToastrService // Adicionei aqui
  ) {
    this.signupForm = new FormGroup({
      // name: new FormControl('', [Validators.required, Validators.name]),
      name: new FormControl('', [Validators.required, Validators.minLength(2)]),
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

  onSubmit() {
  this.authService.signup({ email: this.signupForm.value.email, password: this.signupForm.value.password, name: this.signupForm.value.name })
    .subscribe({
      next: () => {
        const role = this.signupForm.value.role;
        this.router.navigate([role === 'ADMIN' ? '/admin' : '/dashboard']);
      },
      error: () => this.toastService.error('Usuário ou senha inválidos')
    });
}
  navigate() {
    this.router.navigate(['signup']);
  }

}