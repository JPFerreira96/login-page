// import { CommonModule } from '@angular/common';
// import { Component, OnInit, signal } from '@angular/core';
// import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
// import { User, UserService } from '../../core/services/user.service';

// @Component({
//   selector: 'app-users',
//   standalone: true,
//   imports: [CommonModule, ReactiveFormsModule],
//   templateUrl: './users.component.html',
//   styleUrls: ['./users.component.scss']
// })
// export class UsersComponent implements OnInit {
//   loading = signal(true);
//   error = signal<string | null>(null);
//   users = signal<User[]>([]);
//   expanded = signal<string | null>(null);
//   editUserId = signal<string | null>(null);

//   updateForm = new FormGroup({
//     name: new FormControl('', Validators.required),
//     email: new FormControl('', [Validators.required, Validators.email])
//   });

//   addCardForm = new FormGroup({
//     numeroCartao: new FormControl('', [Validators.required, Validators.pattern('\\d{4}\\.\\d{4}\\.\\d{4}\\.\\d{4}')]),
//     nome: new FormControl('', Validators.required),
//     tipoCartao: new FormControl('', Validators.required)
//   });

//   constructor(private userService: UserService) {}

//   ngOnInit() {
//     this.loadUsers();
//   }

//   loadUsers() {
//     this.loading.set(true);
//     this.error.set(null);
//     this.userService.getAllUsers().subscribe({
//       next: data => {
//         this.users.set(data);
//         this.loading.set(false);
//       },
//       error: err => {
//         this.error.set(err);
//         this.loading.set(false);
//       }
//     });
//   }

//   toggleExpand(userId: string) {
//     this.expanded.set(this.expanded() === userId ? null : userId);
//     // reset forms when expanding
//     this.editUserId.set(null);
//   }

//   startEdit(user: User) {
//     this.editUserId.set(user.id);
//     this.updateForm.patchValue({ name: user.name, email: user.email });
//   }

//   saveUser(user: User) {
//     if (this.updateForm.invalid) return;
//     // Extrai valores seguros do formulário para UpdateUserRequest
//     const updateData = {
//       name: this.updateForm.get('name')!.value ?? '',
//       email: this.updateForm.get('email')!.value ?? ''
//     };
//     this.userService.updateUser(user.id, updateData).subscribe({
//       next: updated => {
//         this.users.set(this.users().map(u => u.id === updated.id ? updated : u));
//         this.editUserId.set(null);
//       },
//       error: err => this.error.set(err)
//     });
//   }

//   cancelEdit() {
//     this.editUserId.set(null);
//   }

//   deleteUser(user: User) {
//     if (!confirm(`Remover usuário ${user.name}?`)) return;
//     this.userService.deleteUser(user.id).subscribe({
//       next: () => this.users.set(this.users().filter(u => u.id !== user.id)),
//       error: err => this.error.set(err)
//     });
//   }

//   addCard(user: User) {
//     if (this.addCardForm.invalid) return;
//     this.userService.addCardToUser(user.id, this.addCardForm.value).subscribe({
//       next: card => {
//         user.cards = [...(user.cards || []), card];
//         this.addCardForm.reset();
//       },
//       error: err => this.error.set(err)
//     });
//   }

//   removeCard(userId: string, card: any) {
//     if (!confirm(`Remover cartão ${card.nome}?`)) return;
//     this.userService.removeCardFromUser(userId, card.id).subscribe({
//       next: () => {
//         const user = this.users().find(u => u.id === userId);
//         if (user && user.cards) {
//           user.cards = user.cards.filter((c: any) => c.id !== card.id);
//           this.users.set(this.users());
//         }
//       },
//       error: err => this.error.set(err)
//     });
//   }

//   toggleCardStatus(userId: string, card: any) {
//     const activate = !card.status;
//     const call = activate ? this.userService.activateUserCard(userId, card.id) : this.userService.deactivateUserCard(userId, card.id);
//     call.subscribe({
//       next: () => {
//         const user = this.users().find(u => u.id === userId);
//         if (user && user.cards) {
//           user.cards = user.cards.map((c: any) => c.id === card.id ? { ...c, status: activate } : c);
//           this.users.set(this.users());
//         }
//       },
//       error: err => this.error.set(err)
//     });
//   }
// }

// src/app/pages/users/users.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, effect, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { User, UserService } from '../../core/services/user.service';

type CardBackend = {
  id: string;
  numeroCartao: string;
  nome: string;
  status: boolean;        // true = ATIVO
  tipoCartao: 'COMUM'|'ESTUDANTE'|'TRABALHADOR'|string;
};

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  // estado
  users = signal<User[]>([]);
  filteredUsers = signal<User[]>([]);
  loading = signal<boolean>(true);
  saving = signal<boolean>(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  // seleção
  selectedId = signal<string | null>(null);
  selectedUser = computed(() => this.users().find(u => u.id === this.selectedId()) ?? null);

  // ui
  activeTab = signal<'dados' | 'senha'>('dados');
  searchTerm = '';

  // forms
  updateForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  passwordForm = this.fb.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(6)]]
  });

  addCardForm = this.fb.group({
    numeroCartao: ['', [Validators.required, Validators.minLength(8)]],
    nome: ['', [Validators.required, Validators.minLength(2)]],
    tipoCartao: ['COMUM', Validators.required]
  });

  constructor(private fb: FormBuilder, private userService: UserService) {}

  ngOnInit(): void {
    this.loadUsers();
    // quando trocar seleção, popular form
    effect(() => {
      const u = this.selectedUser();
      if (u) {
        this.updateForm.reset({ email: u.email }, { emitEvent: false });
        this.passwordForm.reset();
        this.addCardForm.reset({ numeroCartao: '', nome: '', tipoCartao: 'COMUM' as const });
        this.activeTab.set('dados');
      }
    });
  }

  // ------ DATA ------
  private loadUsers(): void {
    this.loading.set(true);
    this.error.set(null);
    this.userService.getAllUsers().subscribe({
      next: (list) => {
        // garante cards array
        const normalized = list.map(u => ({ ...u, cards: u.cards ?? [] }));
        this.users.set(normalized);
        this.filteredUsers.set(normalized);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(String(err));
        this.loading.set(false);
      }
    });
  }

  refreshSelected(): void {
    const id = this.selectedId();
    if (!id) return;
    this.userService.getUser(id).subscribe({
      next: (u) => {
        // troca no array mantendo referência imutável
        const arr = this.users().map(x => (x.id === u.id ? { ...u, cards: u.cards ?? [] } : x));
        this.users.set(arr);
        this.filteredUsers.set(this.filterArray(arr, this.searchTerm));
      },
      error: (e) => this.error.set(String(e))
    });
  }

  // ------ UI actions ------
  select(u: User): void {
    this.selectedId.set(u.id);
    this.success.set(null);
    this.error.set(null);
  }

  applyFilter(): void {
    this.filteredUsers.set(this.filterArray(this.users(), this.searchTerm));
  }

  private filterArray(arr: User[], term: string): User[] {
    const t = term.trim().toLowerCase();
    if (!t) return arr;
    return arr.filter(u => (u.name?.toLowerCase().includes(t) || u.email?.toLowerCase().includes(t)));
  }

  // ------ USER ops ------
  saveProfile(userId: string): void {
    if (this.updateForm.invalid) return;
    this.saving.set(true);
    const payload = { name: this.selectedUser()?.name || '', email: this.updateForm.value.email! };
    this.userService.updateUser(userId, payload).subscribe({
      next: () => {
        this.success.set('Dados atualizados com sucesso.');
        this.saving.set(false);
        this.refreshSelected();
      },
      error: (e) => { this.error.set(String(e)); this.saving.set(false); }
    });
  }

  changePassword(userId: string): void {
    if (this.passwordForm.invalid) return;
    this.saving.set(true);
    const payload = {
      currentPassword: this.passwordForm.value.currentPassword!,
      newPassword: this.passwordForm.value.newPassword!
    };
    // /users/{id}/password (controller já permite USER/ADMIN)
    this.userService.changePassword(payload as any)  // seu service expõe /me; vamos chamar via controller direta do UsersService? Alternativa:
      .subscribe({
        next: () => { this.success.set('Senha alterada com sucesso.'); this.saving.set(false); this.passwordForm.reset(); },
        error: (e) => { this.error.set(String(e)); this.saving.set(false); }
      });
    // OBS: se preferir rota admin:/users/{id}/password, crie método específico no UserService.
  }

  // ------ CARDS ops (via endpoints do UserService → gateway) ------
  addCard(userId: string): void {
    if (this.addCardForm.invalid) return;
    this.saving.set(true);
    this.userService.addCardToUser(userId, this.addCardForm.value as any).subscribe({
      next: () => {
        this.success.set('Cartão adicionado.');
        this.saving.set(false);
        this.addCardForm.reset({ numeroCartao: '', nome: '', tipoCartao: 'COMUM' });
        this.refreshSelected();
      },
      error: (e) => { this.error.set(String(e)); this.saving.set(false); }
    });
  }

  removeCard(userId: string, card: CardBackend): void {
    this.saving.set(true);
    this.userService.removeCardFromUser(userId, card.id).subscribe({
      next: () => { this.success.set('Cartão removido.'); this.saving.set(false); this.refreshSelected(); },
      error: (e) => { this.error.set(String(e)); this.saving.set(false); }
    });
  }

  toggleCard(userId: string, card: CardBackend): void {
    this.saving.set(true);
    const call = card.status
      ? this.userService.deactivateUserCard(userId, card.id)
      : this.userService.activateUserCard(userId, card.id);

    call.subscribe({
      next: () => { this.success.set(card.status ? 'Cartão desativado.' : 'Cartão ativado.'); this.saving.set(false); this.refreshSelected(); },
      error: (e) => { this.error.set(String(e)); this.saving.set(false); }
    });
  }
}

