// import { CommonModule } from '@angular/common';
// import { Component, computed, signal } from '@angular/core';
// import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
// import { Router } from '@angular/router';
// import { Card, CardService, CardType } from '../../core/services/card.service';

// @Component({
//   selector: 'app-dashboard',
//   standalone: true,
//   imports: [CommonModule, ReactiveFormsModule],
//   templateUrl: './dashboard.component.html',
//   styleUrls: ['./dashboard.component.scss']
// })
// export class DashboardComponent {
//   loading = signal(true);
//   error = signal<string | null>(null);
//   cards = signal<Card[]>([]);
//   index = signal(0);
//   showBalance = signal(false);
//   showRequestForm = signal(false);
//   requestingCard = signal(false);

//   // pega o card visível (opcional)
//   current = computed(() => this.cards()[this.index()] ?? null);

//   // formulário para solicitar cartão
//   requestForm = new FormGroup({
//     cardType: new FormControl<CardType | ''>('', [Validators.required])
//   });

//   constructor(private cardsApi: CardService, private router: Router) {
//     this.load();
//   }

//   load() {
//     this.loading.set(true);
//     this.error.set(null);
//     this.cardsApi.getMyCards().subscribe({
//       next: (data) => {
//         console.log('🔍 DADOS DOS CARTÕES RECEBIDOS:', data); // DEBUG
//         this.cards.set(data || []);
//         this.index.set(0);
//         this.loading.set(false);
//       },
//       error: () => {
//         this.error.set('Falha ao carregar cartões');
//         this.loading.set(false);
//       }
//     });
//   }

//   prev() {
//     const n = this.cards().length;
//     if (!n) return;
//     this.index.set((this.index() - 1 + n) % n);
//   }
//   next() {
//     const n = this.cards().length;
//     if (!n) return;
//     this.index.set((this.index() + 1) % n);
//   }

//   // estilos de cor por tipo
//   colorClass(card: Card) {
//     switch (card.type) {
//       case 'COMUM':       return 'card--comum';
//       case 'ESTUDANTE':   return 'card--estudantil';
//       case 'TRABALHADOR': return 'card--trabalhador';
//       default:            return 'card--comum';
//     }
//   }

//   maskedBalance(card: Card) {
//     if (!this.showBalance()) return 'R$ ***';
//     const v = (card.balance ?? 0).toFixed(2).replace('.', ',');
//     return `R$ ${v}`;
//   }

//   showCardRequestForm() {
//     this.showRequestForm.set(true);
//   }

//   hideCardRequestForm() {
//     this.showRequestForm.set(false);
//     this.requestForm.reset();
//   }

//   requestCard() {
//     if (this.requestForm.valid) {
//       this.requestingCard.set(true);
      
//       const cardType = this.requestForm.get('cardType')?.value as CardType;
      
//       this.cardsApi.requestCard(cardType).subscribe({
//         next: () => {
//           this.requestingCard.set(false);
//           this.hideCardRequestForm();
//           // Recarregar cartões após solicitar
//           this.load();
//         },
//         error: (err) => {
//           console.error('Erro ao solicitar cartão:', err);
//           this.requestingCard.set(false);
//           this.error.set('Erro ao solicitar cartão. Tente novamente.');
//         }
//       });
//     }
//   }
// }
