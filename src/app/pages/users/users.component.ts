import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, effect, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { UserService } from '../../core/services/user.service';
import { User } from '../../interface/user.interface';
import { CardBackend } from '../../types/card-backend.type';
import { CardType } from '../../types/card.type';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  
  users = signal<User[]>([]);
  filteredUsers = signal<User[]>([]);
  loading = signal<boolean>(true);
  saving = signal<boolean>(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);
  private feedbackTimeout: ReturnType<typeof setTimeout> | null = null;

  
  selectedId = signal<string | null>(null);
  selectedUser = computed(() => this.users().find(u => u.id === this.selectedId()) ?? null);

  
  activeTab = signal<'dados' | 'senha'>('dados');
  searchTerm = '';

  
  updateForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  passwordForm = this.fb.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(6)]]
  });

  addCardForm = this.fb.group({
    nome: ['', [Validators.required, Validators.minLength(2)]],
    tipoCartao: ['COMUM', Validators.required]
  });

  constructor(private fb: FormBuilder, private userService: UserService) {}

  ngOnInit(): void {
    this.loadUsers();
    
    effect(() => {
      const u = this.selectedUser();
      if (u) {
        this.updateForm.reset({ email: u.email }, { emitEvent: false });
        this.passwordForm.reset();
        this.addCardForm.reset({ nome: '', tipoCartao: 'COMUM' as const });
        this.activeTab.set('dados');
      }
    });
  }

  
  private loadUsers(): void {
    this.loading.set(true);
    this.clearFeedback();
    this.userService.getAllUsers().subscribe({
      next: (list) => {
        
        const normalized = list.map(u => ({ ...u, cards: u.cards ?? [] }));
        this.users.set(normalized);
        this.filteredUsers.set(normalized);
        this.loading.set(false);
      },
      error: (err) => {
        this.showError(String(err));
        this.loading.set(false);
      }
    });
  }

  refreshSelected(): void {
    const id = this.selectedId();
    if (!id) return;
    this.userService.getUser(id).subscribe({
      next: (u) => {
        
        const arr = this.users().map(x => (x.id === u.id ? { ...u, cards: u.cards ?? [] } : x));
        this.users.set(arr);
        this.filteredUsers.set(this.filterArray(arr, this.searchTerm));
      },
      error: (e) => this.showError(String(e))
    });
  }

  
  select(u: User): void {
    this.selectedId.set(u.id);
    this.clearFeedback();
  }

  applyFilter(): void {
    this.filteredUsers.set(this.filterArray(this.users(), this.searchTerm));
  }

  private filterArray(arr: User[], term: string): User[] {
    const t = term.trim().toLowerCase();
    if (!t) return arr;
    return arr.filter(u => (u.name?.toLowerCase().includes(t) || u.email?.toLowerCase().includes(t)));
  }

  
  saveProfile(userId: string): void {
    if (this.updateForm.invalid) return;
    this.saving.set(true);
    this.clearFeedback();
    
    const payload = { email: this.updateForm.value.email! };
    this.userService.updateUser(userId, payload)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.showSuccess(`Email atualizado para ${payload.email}.`);
          this.refreshSelected();
        },
        error: (e) => this.showError(String(e))
      });
  }

  changePassword(userId: string): void {
    if (this.passwordForm.invalid) return;
    this.saving.set(true);
    this.clearFeedback();
    const payload = {
      currentPassword: this.passwordForm.value.currentPassword!,
      newPassword: this.passwordForm.value.newPassword!
    };
    
    this.userService.changePassword(payload as any)  
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => { this.showSuccess('Senha alterada com sucesso.'); this.passwordForm.reset(); },
        error: (e) => this.showError(String(e))
      });
    
  }
  
  addCard(userId: string): void {
    if (this.addCardForm.invalid) return;
    const { nome, tipoCartao } = this.addCardForm.value;
    const payload: { nome: string; tipoCartao: CardType } = {
      nome: (nome ?? '').trim(),
      tipoCartao: (tipoCartao ?? 'COMUM') as CardType
    };
    if (!payload.nome) return;

    this.saving.set(true);
    this.clearFeedback();
    this.userService.addCardToUser(userId, payload)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.showSuccess(`Cartão "${payload.nome}" (${this.formatCardType(payload.tipoCartao)}) criado automaticamente.`);
          this.addCardForm.reset({ nome: '', tipoCartao: 'COMUM' as const });
          this.refreshSelected();
        },
        error: (e) => this.showError(String(e))
      });
  }

  removeCard(userId: string, card: CardBackend): void {
    this.saving.set(true);
    this.clearFeedback();
    const cardName = card.nome || 'Cartão sem nome';
    this.userService.removeCardFromUser(userId, card.id)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => { this.showSuccess(`Cartão "${cardName}" removido.`); this.refreshSelected(); },
        error: (e) => this.showError(String(e))
      });
  }

  toggleCard(userId: string, card: CardBackend): void {
    this.saving.set(true);
    this.clearFeedback();
    const call = card.status
      ? this.userService.deactivateUserCard(userId, card.id)
      : this.userService.activateUserCard(userId, card.id);

    call.pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          const action = card.status ? 'desativado' : 'ativado';
          const cardName = card.nome || 'Cartão sem nome';
          this.showSuccess(`Cartão "${cardName}" ${action}.`);
          this.refreshSelected();
        },
        error: (e) => this.showError(String(e))
      });
  }

  private formatCardType(type: CardType): string {
    switch (type) {
      case 'COMUM': return 'Comum';
      case 'ESTUDANTE': return 'Estudante';
      case 'TRABALHADOR': return 'Trabalhador';
      default: return type;
    }
  }

  private clearFeedback(): void {
    this.success.set(null);
    this.error.set(null);
    if (this.feedbackTimeout) {
      clearTimeout(this.feedbackTimeout);
      this.feedbackTimeout = null;
    }
  }

  private showSuccess(message: string): void {
    this.success.set(message);
    this.error.set(null);
    this.scheduleFeedbackClear();
  }

  private showError(message: string): void {
    this.error.set(message);
    this.success.set(null);
    this.scheduleFeedbackClear();
  }

  private scheduleFeedbackClear(): void {
    if (this.feedbackTimeout) {
      clearTimeout(this.feedbackTimeout);
    }
    this.feedbackTimeout = setTimeout(() => {
      this.success.set(null);
      this.error.set(null);
      this.feedbackTimeout = null;
    }, 5000);
  }
}

