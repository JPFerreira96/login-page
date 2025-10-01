
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ChangePasswordRequest, UpdateUserRequest, User, UserService } from '../../core/services/user.service';

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
  ) {}

  ngOnInit(): void {
    this.initializeForms();
    this.loadUser();
  }

  private initializeForms(): void {
    // Form para dados pessoais - apenas email é editável
    this.userForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    // Form para alteração de senha
    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  loadUser(): void {
    this.loading = true;
    this.error = '';
    
    this.userService.getProfile().subscribe({
      next: (userData: User) => {
        this.user = userData;
        // Preenche apenas o campo editável (email)
        this.userForm.patchValue({
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
      email: this.userForm.get('email')?.value
    };

    this.userService.updateProfile(this.user.id, updateData).subscribe({
      next: (updatedUser: User) => {
        this.user = updatedUser;
        this.success = 'Email atualizado com sucesso!';
        this.loading = false;
        // Limpa a mensagem após 3 segundos
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

    this.userService.changePassword(this.user.id, passwordData).subscribe({
      next: () => {
        this.success = 'Senha alterada com sucesso!';
        this.passwordForm.reset();
        this.loading = false;
        // Limpa a mensagem após 3 segundos
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

  // Getter para facilitar validações no template
  get emailControl() {
    return this.userForm.get('email');
  }

  get currentPasswordControl() {
    return this.passwordForm.get('currentPassword');
  }

  get newPasswordControl() {
    return this.passwordForm.get('newPassword');
  }
}
