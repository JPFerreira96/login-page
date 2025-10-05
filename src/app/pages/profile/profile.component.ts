
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';

import { ChangePasswordRequest } from '../../interface/change-password-request.interface';
import { UpdateUserRequest } from '../../interface/update-user-request.interface';
import { User } from '../../interface/user.interface';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  userForm!: FormGroup;
  passwordForm!: FormGroup;
  user: User | null = null;
  activeTab: string = 'dados';
  loading: boolean = false;
  error: string = '';
  success: string = '';

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.initializeForms();
    this.loadUser();
  }

  private initializeForms(): void {
    
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]]
    });

    
    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  loadUser(): void {
    this.loading = true;
    this.error = '';

    this.userService.getProfile().subscribe({
      next: (userData: User) => {
        this.user = userData;
        
        this.userForm.patchValue({
          name: userData.name,
          email: userData.email
        });
        this.loading = false;
      },
      error: (error: string) => {
        this.error = error;
        this.loading = false;
        console.error('Erro ao carregar dados do usuário:', error);
      }
    });
  }

  saveUser(): void {
    if (!this.userForm.valid || !this.user) return;

    this.loading = true;
    this.error = '';
    this.success = '';

    const updateData: UpdateUserRequest = {
      email: this.userForm.get('email')?.value,
      name: this.userForm.get('name')?.value
    };

    this.userService.updateProfile(updateData).subscribe({
      next: (updatedUser) => {
        this.user = updatedUser;
        this.userForm.patchValue({
          name: updatedUser.name,
          email: updatedUser.email
        });
        this.success = 'Dados atualizados com sucesso!';
        this.loading = false;
        setTimeout(() => this.success = '', 3000);
      },
      error: (error: string) => {
        this.error = error;
        this.loading = false;
      }
    });
  }

  changePassword(): void {
    if (!this.passwordForm.valid || !this.user) return;

    this.loading = true;
    this.error = '';
    this.success = '';

    const passwordData: ChangePasswordRequest = {
      currentPassword: this.passwordForm.get('currentPassword')?.value,
      newPassword: this.passwordForm.get('newPassword')?.value
    };

    this.userService.changePassword(passwordData).subscribe({
      next: () => {
        this.passwordForm.reset();
        this.success = 'Senha alterada com sucesso!';
        this.loading = false;
        setTimeout(() => this.success = '', 3000);
      },
      error: (error: string) => {
        this.error = error;
        this.loading = false;
      }
    });
  }

  deleteAccount(): void {
    if (!this.user) return;

    const confirmMessage = `Tem certeza que deseja excluir sua conta permanentemente?\n\nEsta ação não pode ser desfeita e todos os seus dados serão perdidos.`;

    if (!confirm(confirmMessage)) return;

    this.loading = true;
    this.error = '';

    this.userService.deleteUser(this.user.id).subscribe({
      next: () => {
        alert('Conta excluída com sucesso!');
        this.authService.logout();
        this.router.navigate(['/login']);
      },
      error: (error: string) => {
        this.error = error;
        this.loading = false;
      }
    });
  }

  switchTab(tab: string): void {
    this.activeTab = tab;
    this.error = '';
    this.success = '';
  }

  
  get emailControl() {
    return this.userForm.get('email');
  }

  get nameControl() {
    return this.userForm.get('name');
  }

  get currentPasswordControl() {
    return this.passwordForm.get('currentPassword');
  }

  get newPasswordControl() {
    return this.passwordForm.get('newPassword');
  }
}
