import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { User, UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  loading = signal(true);
  error = signal<string | null>(null);
  users = signal<User[]>([]);
  expanded = signal<string | null>(null);
  editUserId = signal<string | null>(null);

  updateForm = new FormGroup({
    name: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email])
  });

  addCardForm = new FormGroup({
    numeroCartao: new FormControl('', [Validators.required, Validators.pattern('\\d{4}\\.\\d{4}\\.\\d{4}\\.\\d{4}')]),
    nome: new FormControl('', Validators.required),
    tipoCartao: new FormControl('', Validators.required)
  });

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading.set(true);
    this.error.set(null);
    this.userService.getAllUsers().subscribe({
      next: data => {
        this.users.set(data);
        this.loading.set(false);
      },
      error: err => {
        this.error.set(err);
        this.loading.set(false);
      }
    });
  }

  toggleExpand(userId: string) {
    this.expanded.set(this.expanded() === userId ? null : userId);
    // reset forms when expanding
    this.editUserId.set(null);
  }

  startEdit(user: User) {
    this.editUserId.set(user.id);
    this.updateForm.patchValue({ name: user.name, email: user.email });
  }

  saveUser(user: User) {
    if (this.updateForm.invalid) return;
    // Extrai valores seguros do formulário para UpdateUserRequest
    const updateData = {
      name: this.updateForm.get('name')!.value ?? '',
      email: this.updateForm.get('email')!.value ?? ''
    };
    this.userService.updateUser(user.id, updateData).subscribe({
      next: updated => {
        this.users.set(this.users().map(u => u.id === updated.id ? updated : u));
        this.editUserId.set(null);
      },
      error: err => this.error.set(err)
    });
  }

  cancelEdit() {
    this.editUserId.set(null);
  }

  deleteUser(user: User) {
    if (!confirm(`Remover usuário ${user.name}?`)) return;
    this.userService.deleteUser(user.id).subscribe({
      next: () => this.users.set(this.users().filter(u => u.id !== user.id)),
      error: err => this.error.set(err)
    });
  }

  addCard(user: User) {
    if (this.addCardForm.invalid) return;
    this.userService.addCardToUser(user.id, this.addCardForm.value).subscribe({
      next: card => {
        user.cards = [...(user.cards || []), card];
        this.addCardForm.reset();
      },
      error: err => this.error.set(err)
    });
  }

  removeCard(userId: string, card: any) {
    if (!confirm(`Remover cartão ${card.nome}?`)) return;
    this.userService.removeCardFromUser(userId, card.id).subscribe({
      next: () => {
        const user = this.users().find(u => u.id === userId);
        if (user && user.cards) {
          user.cards = user.cards.filter((c: any) => c.id !== card.id);
          this.users.set(this.users());
        }
      },
      error: err => this.error.set(err)
    });
  }

  toggleCardStatus(userId: string, card: any) {
    const activate = !card.status;
    const call = activate ? this.userService.activateUserCard(userId, card.id) : this.userService.deactivateUserCard(userId, card.id);
    call.subscribe({
      next: () => {
        const user = this.users().find(u => u.id === userId);
        if (user && user.cards) {
          user.cards = user.cards.map((c: any) => c.id === card.id ? { ...c, status: activate } : c);
          this.users.set(this.users());
        }
      },
      error: err => this.error.set(err)
    });
  }
}
