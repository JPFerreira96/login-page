import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../enviroments/enviroment';

export type CardType = 'COMUM' | 'ESTUDANTE' | 'TRABALHADOR';
export interface Card {
  id: string;
  type: CardType;
  serial?: string;         // ex: "90.03.01391738-7"
  numeroCartao?: string;   // número do cartão
  nome?: string;           // nome do cartão
  status: 'ATIVO'|'BLOQUEADO';
  balance?: number;        // pode vir null/undefined se preferir
  favorite?: boolean;
}

// Interface correspondendo à estrutura do backend
export interface BackendCard {
  id: string;
  numeroCartao: string;
  nome: string;
  status: boolean;
  tipoCartao: string;
}

@Injectable({ providedIn: 'root' })
export class CardService {
  private base = `${environment.apiBaseUrl}/cards`;

  constructor(private http: HttpClient) {}

  // endpoint para buscar cartões do usuário logado
  getMyCards(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/me`);
  }

  // endpoint para buscar todos os cartões (para admin)
  getAllCards(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}`);
  }

  // endpoint para solicitar um novo cartão
  requestCard(cardType: CardType): Observable<any> {
    return this.http.post(`${this.base}/request`, { type: cardType });
  }

  // endpoint para ativar/desativar um cartão
  toggleCardStatus(cardId: string, active: boolean): Observable<any> {
    return this.http.patch(`${this.base}/${cardId}/status`, { status: active });
  }

  // endpoint para remover um cartão
  removeCard(cardId: string): Observable<any> {
    return this.http.delete(`${this.base}/${cardId}`);
  }

  // Método para criar cartões de teste (DEV)
  createTestCards(): Observable<Card[]> {
    return this.http.post<Card[]>(`${this.base}/dev/create-test-cards`, {});
  }
}
