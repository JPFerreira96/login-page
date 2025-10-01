import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Card, CardService, CardType } from '../../core/services/card.service';

@Component({
  selector: 'app-cards',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl:'./cards.component.html',
  styleUrls: ['./cards.component.scss']
})
export class CardsComponent {
  loading = signal(true);
  error = signal<string | null>(null);
  cards = signal<Card[]>([]);
  index = signal(0);
  showBalance = signal(false);
  showRequestForm = signal(false);
  requestingCard = signal(false);

  // pega o card visível (opcional)
  current = computed(() => this.cards()[this.index()] ?? null);

  // formulário para solicitar cartão
  requestForm = new FormGroup({
    cardType: new FormControl<CardType | ''>('', [Validators.required]),
    name: new FormControl('', [Validators.required]) // Adicionando campo nome para o cartão
  });

  constructor(private cardsApi: CardService) {
    this.load();
  }

  // Mapeia o formato do backend para o formato do frontend
  mapBackendCards(backendCards: any[]): Card[] {
    return backendCards.map(card => ({
      id: card.id,
      type: card.tipoCartao as CardType,
      serial: card.numeroCartao,
      numeroCartao: card.numeroCartao, // Garantir que o número do cartão esteja disponível
      nome: card.nome || `Cartão ${card.tipoCartao.toLowerCase()}`, // Garantir que o nome seja exibido
      status: card.status === true ? 'ATIVO' : 'BLOQUEADO',
      balance: 0, // O saldo pode vir de outro endpoint ou ser mock
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

  // estilos de cor por tipo
  colorClass(card: Card) {
    switch (card.type) {
      case 'COMUM':       return 'card--comum';
      case 'ESTUDANTE':  return 'card--estudante';
      case 'TRABALHADOR': return 'card--trabalhador';
      default:            return 'card--comum';
    }
  }

  maskedBalance(card: Card) {
    if (!this.showBalance()) return '***';
    // Garantindo que temos um valor de saldo mesmo que seja zero
    const v = (card.balance ?? 0).toFixed(2).replace('.', ',');
    return v;
  }

  // Toggle status do cartão (ativar/desativar)
  toggleCardStatus(card: Card) {
    // Se o cartão já está processando uma mudança, ignoramos
    if (this.loading()) return;
    
    const newStatus = card.status === 'ATIVO' ? false : true;
    const cardId = card.id;
    
    this.loading.set(true);
    this.cardsApi.toggleCardStatus(cardId, newStatus).subscribe({
      next: () => {
        // Atualizamos apenas o status deste cartão específico
        const updatedCards = this.cards().map(c => {
          if (c.id === cardId) {
            return {
              ...c,
              status: newStatus ? 'ATIVO' : 'BLOQUEADO'
            } as Card; // Forçando o tipo para Card
          }
          return c;
        });
        
        this.cards.set(updatedCards as Card[]); // Forçando o tipo para Card[]
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Erro ao alterar status do cartão:', err);
        this.error.set('Falha ao alterar status do cartão');
        this.loading.set(false);
      }
    });
  }
  
  // Confirma e remove o cartão
  confirmRemoveCard(card: Card) {
    if (confirm(`Tem certeza que deseja remover o cartão ${card.nome || card.type}?`)) {
      this.removeCard(card);
    }
  }
  
  // Remove um cartão
  removeCard(card: Card) {
    if (this.loading()) return;
    
    this.loading.set(true);
    this.cardsApi.removeCard(card.id).subscribe({
      next: () => {
        // Removemos o cartão da lista
        const updatedCards = this.cards().filter(c => c.id !== card.id);
        this.cards.set(updatedCards);
        
        // Se o cartão removido era o atual, ajustamos o índice
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
  
  // Exibe o formulário de solicitação de cartão
  showCardRequestForm() {
    this.showRequestForm.set(true);
  }
  
  // Esconde o formulário de solicitação de cartão
  hideCardRequestForm() {
    this.showRequestForm.set(false);
    this.requestForm.reset();
  }
  
  // Solicita um novo cartão
  requestCard() {
    if (!this.requestForm.valid) return;
    
    const { cardType, name } = this.requestForm.value;
    
    this.requestingCard.set(true);
    this.cardsApi.requestCard(cardType as CardType).subscribe({
      next: () => {
        // Recarregamos os cartões após a solicitação
        this.hideCardRequestForm();
        this.load();
        this.requestingCard.set(false);
      },
      error: (err) => {
        console.error('Erro ao solicitar cartão:', err);
        this.error.set('Falha ao solicitar o cartão');
        this.requestingCard.set(false);
      }
    });
  }
}