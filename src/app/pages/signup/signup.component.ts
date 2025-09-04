// src/app/pages/signup/signup.component.ts
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { DefaultLoginLayoutComponent } from '../../components/default-login-layout/default-login-layout.component';
import { PrimaryInputComponent } from '../../components/primary-input/primary-input.component';
import { AuthResponse, AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-signup', // só pra não confundir com login
  standalone: true,
  imports: [
    DefaultLoginLayoutComponent,
    ReactiveFormsModule,
    PrimaryInputComponent,
    CommonModule
  ],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent {

  signupForm = new FormGroup(
    {
      name: new FormControl('', [Validators.required, Validators.minLength(2)]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
      confirmPassword: new FormControl('', [Validators.required, Validators.minLength(6)]),
    },
    { validators: this.passwordsMatchValidator } // <= validador cross-field
  );

  constructor(
    private router: Router,
    private authService: AuthService,
    private toast: ToastrService
  ) {}

  // Validador do FormGroup: compara password e confirmPassword
  private passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
    const pass = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    if (!pass || !confirm) return null;
    return pass === confirm ? null : { passwordsDontMatch: true };
  }

  onSubmit() {
    if (this.signupForm.invalid) {
      // mostra feedback útil
      if (this.signupForm.hasError('passwordsDontMatch')) {
        this.toast.error('As senhas não conferem');
      } else {
        this.toast.error('Preencha os campos corretamente');
      }
      this.signupForm.markAllAsTouched();
      return;
    }

    const { name, email, password } = this.signupForm.value;
    this.authService.signup({ name: name!, email: email!, password: password!, role: 'user' })
      .subscribe({
        next: (res: AuthResponse) => {
          // salva auth e redireciona
          this.authService.saveAuth(res);
          this.toast.success('Conta criada com sucesso!');
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          console.error('[Signup] erro', err);
          this.toast.error(err?.error?.message ?? 'Falha ao criar conta');
        }
      });
  }

  navigate() {
    this.router.navigate(['login']);
  }
}
