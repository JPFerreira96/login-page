import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { CardService } from '../../core/services/card.service';
import { Card } from '../../interface/card.interface';
import { CardType } from '../../types/card.type';

@Component({
  selector: 'app-cards',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.scss']
})

export class CardsComponent {
  loading = signal(true);
  error = signal<string | null>(null);
  cards = signal<Card[]>([]);
  index = signal(0);
  showBalance = signal(false);
  showRequestForm = signal(false);
  showRequestModal = signal(false);
  requestingCard = signal(false);

  hasCards = computed(() => this.cards().length > 0);
  
  current = computed(() => this.cards()[this.index()] ?? null);
  
  requestForm = new FormGroup({
    cardType: new FormControl<CardType | ''>('', [Validators.required]),
    name: new FormControl('', [Validators.required]) 
  });

  constructor(private cardsApi: CardService) {
    this.load();
  }
  
  mapBackendCards(backendCards: any[]): Card[] {
    return backendCards.map(card => ({
      id: card.id,
      type: card.tipoCartao as CardType,
      serial: card.numeroCartao,
      numeroCartao: card.numeroCartao, 
      nome: card.nome || `Cartão ${card.tipoCartao.toLowerCase()}`, 
      status: card.status === true ? 'ATIVO' : 'BLOQUEADO',
      balance: 0, 
      favorite: false
    }));
  }

  load() {
    this.loading.set(true);
    this.error.set(null);
    this.cardsApi.getMyCards().subscribe({
      next: (data) => {
        const mappedCards = this.mapBackendCards(data);
        this.cards.set(mappedCards || []);
        this.index.set(0);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Erro ao carregar cartões:', err);
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

  
  colorClass(card: Card) {
    switch (card.type) {
      case 'COMUM': return 'card--comum';
      case 'ESTUDANTE': return 'card--estudante';
      case 'TRABALHADOR': return 'card--trabalhador';
      default: return 'card--comum';
    }
  }

  displayBalance(card: Card) {
    const hasBalance = card.balance !== undefined && Number.isFinite(card.balance);

    if (!this.showBalance()) {
      return hasBalance ? '***' : 'indisponível';
    }

    if (!hasBalance) {
      return 'indisponível';
    }

    const value = (card.balance ?? 0).toFixed(2);
    return value.replace('.', ',');
  }

  
  toggleCardStatus(card: Card) {
    
    if (this.loading()) return;

    const newStatus = card.status === 'ATIVO' ? false : true;
    const cardId = card.id;

    this.loading.set(true);
    this.cardsApi.toggleCardStatus(cardId, newStatus).subscribe({
      next: () => {
        
        const updatedCards = this.cards().map(c => {
          if (c.id === cardId) {
            return {
              ...c,
              status: newStatus ? 'ATIVO' : 'BLOQUEADO'
            } as Card; 
          }
          return c;
        });

        this.cards.set(updatedCards as Card[]); 
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Erro ao alterar status do cartão:', err);
        this.error.set('Falha ao alterar status do cartão');
        this.loading.set(false);
      }
    });
  }

  
  confirmRemoveCard(card: Card) {
    if (confirm(`Tem certeza que deseja remover o cartão ${card.nome || card.type}?`)) {
      this.removeCard(card);
    }
  }

  bloqueiaAtual() {
    const card = this.current();
    if (!card) return;
    this.toggleCardStatus(card);
  }

  isCurrentCardActive() {
    return this.current()?.status === 'ATIVO';
  }

  renameCard(card: Card) {
    const novoNome = prompt('Nome do cartão', card.nome ?? '');
    if (!novoNome || novoNome.trim() === card.nome) return;
    this.cardsApi.updateCard(card.id, { nome: novoNome.trim() }).subscribe({
      next: updated => {
        this.cards.set(this.cards().map(c => c.id === card.id ? { ...c, nome: updated.nome } : c));
      },
      error: err => this.error.set('Falha ao renomear cartão'),
    });
  }

  
  removeCard(card: Card) {
    if (this.loading()) return;

    this.loading.set(true);
    this.cardsApi.removeCard(card.id).subscribe({
      next: () => {
        
        const updatedCards = this.cards().filter(c => c.id !== card.id);
        this.cards.set(updatedCards);

        
        if (updatedCards.length > 0 && this.index() >= updatedCards.length) {
          this.index.set(updatedCards.length - 1);
        }

        this.loading.set(false);
      },
      error: (err) => {
        console.error('Erro ao remover cartão:', err);
        this.error.set('Falha ao remover o cartão');
        this.loading.set(false);
      }
    });
  }

  
  showCardRequestForm() {
    this.showRequestForm.set(true);
    this.requestForm.reset({ cardType: '', name: '' });
  }

  
  hideCardRequestForm() {
    this.showRequestForm.set(false);
    this.requestForm.reset({ cardType: '', name: '' });
  }

  
  requestCard() {
    if (!this.requestForm.valid) return;

    const { cardType, name } = this.requestForm.value;
    const trimmedName = name?.trim();
    if (!cardType || !trimmedName) return;

    this.error.set(null);
    this.requestingCard.set(true);

    this.cardsApi.requestCard(cardType as CardType, trimmedName)
      .pipe(finalize(() => this.requestingCard.set(false)))
      .subscribe({
        next: () => {
          this.hideCardRequestForm();
          this.closeRequestModal();
          this.load();
        },
        error: (err) => {
          console.error('Erro ao solicitar cartão:', err);
          this.error.set('Falha ao solicitar o cartão');
        }
      });
  }

  openRequestModal() {
    this.hideCardRequestForm();
    this.error.set(null);
    this.requestForm.reset({ cardType: '', name: '' });
    this.showRequestModal.set(true);
  }

  closeRequestModal() {
    if (this.showRequestModal()) {
      this.showRequestModal.set(false);
      this.requestForm.reset({ cardType: '', name: '' });
    }
  }

  criarNovoCartao() {
    if (!this.hasCards()) {
      return;
    }

    this.openRequestModal();
    
  }
}