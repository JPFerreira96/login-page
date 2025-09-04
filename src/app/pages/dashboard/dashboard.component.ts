import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Card, CardService } from '../../core/services/card.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  loading = signal(true);
  error = signal<string | null>(null);
  cards = signal<Card[]>([]);
  index = signal(0);
  showBalance = signal(false);

  // pega o card visível (opcional)
  current = computed(() => this.cards()[this.index()] ?? null);

  constructor(private cardsApi: CardService, private router: Router) {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.error.set(null);
    this.cardsApi.getMyCards().subscribe({
      next: (data) => {
        // fallback: se vier vazio, deixa um mock para ver o layout
        this.cards.set(data?.length ? data : [
          { id:1, type: 'TRABALHADOR', serial: '90.04.01987473-3', status: 'ATIVO', balance: 42.50 },
          { id:2, type: 'ESTUDANTIL',  serial: '90.03.01391738-7', status: 'ATIVO', balance: 0 },
        ]);
        this.index.set(0);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Falha ao carregar cartões');
        this.loading.set(false);
      }
    });
  }

  prev() {
    const n = this.cards().length;
    if (!n) return;
    this.index.set((this.index() - 1 + n) % n);
  }
  next() {
    const n = this.cards().length;
    if (!n) return;
    this.index.set((this.index() + 1) % n);
  }

  // estilos de cor por tipo
  colorClass(card: Card) {
    switch (card.type) {
      case 'COMUM':       return 'card--purple';
      case 'ESTUDANTIL':  return 'card--orange';
      case 'TRABALHADOR': return 'card--teal';
      default:            return 'card--purple';
    }
  }

  maskedBalance(card: Card) {
    if (!this.showBalance()) return 'R$ ***';
    const v = (card.balance ?? 0).toFixed(2).replace('.', ',');
    return `R$ ${v}`;
  }
}
