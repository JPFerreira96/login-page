import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../enviroments/enviroment';
import { BackendCard } from '../../interface/back-end-card.interface';
import { Card } from '../../interface/card.interface';
import { CardType } from '../../types/card.type';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class CardService {
  private base = `${environment.apiBaseUrl}/cards`;

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {}
  
  private getOptions() {
    const token = this.auth.getToken();
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : ''
      })
    };
  }

  
  getMyCards(): Observable<BackendCard[]> {
    return this.http.get<BackendCard[]>(`${this.base}/me`, this.getOptions());
  }

  
  getAllCards(): Observable<BackendCard[]> {
    return this.http.get<BackendCard[]>(`${this.base}`, this.getOptions());
  }

  
  requestCard(cardType: CardType, name?: string): Observable<BackendCard> {
    return this.http.post<BackendCard>(
      `${this.base}/request`,
      { type: cardType, name },
      this.getOptions()
    );
  }

  
  updateCard(cardId: string, payload: { nome: string; status?: boolean }): Observable<BackendCard> {
    return this.http.put<BackendCard>(
      `${this.base}/${cardId}`,
      payload,
      this.getOptions()
    );
  }

  
  toggleCardStatus(cardId: string, active: boolean): Observable<BackendCard> {
    return this.http.patch<BackendCard>(
      `${this.base}/${cardId}/status`,
      { status: active },
      this.getOptions()
    );
  }

  
  removeCard(cardId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.base}/${cardId}`,
      this.getOptions()
    );
  }

  
  createTestCards(): Observable<Card[]> {
    return this.http.post<Card[]>(
      `${this.base}/dev/create-test-cards`,
      {},
      this.getOptions()
    );
  }
}