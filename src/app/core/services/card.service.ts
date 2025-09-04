import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../enviroments/enviroment';

export type CardType = 'COMUM' | 'ESTUDANTIL' | 'TRABALHADOR';
export interface Card {
  id: number;
  type: CardType;
  serial: string;         // ex: "90.03.01391738-7"
  status: 'ATIVO'|'BLOQUEADO';
  balance?: number;       // pode vir null/undefined se preferir
  favorite?: boolean;
}

@Injectable({ providedIn: 'root' })
export class CardService {
  private base = `${environment.apiBaseUrl}/cards`;

  constructor(private http: HttpClient) {}

  // ajuste a rota conforme seu card-service (ex: /me, /my, /)
  getMyCards(): Observable<Card[]> {
    return this.http.get<Card[]>(`${this.base}`);
  }
}
