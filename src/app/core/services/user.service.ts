import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../enviroments/enviroment';
import { Card } from '../../interface/card.interface';
import { ChangePasswordRequest } from '../../interface/change-password-request.interface';
import { UpdateUserRequest } from '../../interface/update-user-request.interface';
import { User } from '../../interface/user.interface';
import { CardType } from '../../types/card.type';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiBaseUrl}/users`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  private getHttpOptions() {
    const token = this.authService.getToken();
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      })
    };
  }


  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`, this.getHttpOptions())
      .pipe(catchError(this.handleError.bind(this)));
  }


  updateProfile(userData: UpdateUserRequest): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/me`, userData, this.getHttpOptions())
      .pipe(catchError(this.handleError.bind(this)));
  }


  changePassword(passwordData: ChangePasswordRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/me/password`, passwordData, this.getHttpOptions())
      .pipe(catchError(this.handleError.bind(this)));
  }


  deleteUser(userId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${userId}`, this.getHttpOptions())
      .pipe(catchError(this.handleError.bind(this)));
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}`, this.getHttpOptions())
      .pipe(catchError(this.handleError.bind(this)));
  }

  getUser(userId: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${userId}`, this.getHttpOptions())
      .pipe(catchError(this.handleError.bind(this)));
  }

  updateUser(userId: string, userData: UpdateUserRequest): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${userId}`, userData, this.getHttpOptions())
      .pipe(catchError(this.handleError.bind(this)));
  }


  removeCardFromUser(userId: string, cardId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${userId}/cards/${cardId}`, this.getHttpOptions())
      .pipe(catchError(this.handleError.bind(this)));
  }

  activateUserCard(userId: string, cardId: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${userId}/cards/${cardId}/activate`, null, this.getHttpOptions())
      .pipe(catchError(this.handleError.bind(this)));
  }

  deactivateUserCard(userId: string, cardId: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${userId}/cards/${cardId}/deactivate`, null, this.getHttpOptions())
      .pipe(catchError(this.handleError.bind(this)));
  }

  private handleError(error: any): Observable<never> {
    console.error('Erro na API:', error);

    let errorMessage = 'Erro desconhecido';

    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.status === 401) {
      errorMessage = 'Não autorizado. Faça login novamente.';
      this.authService.logout();
    } else if (error.status === 403) {
      errorMessage = 'Acesso negado.';
    } else if (error.status === 404) {
      errorMessage = 'Recurso não encontrado.';
    } else if (error.status === 400) {
      errorMessage = 'Dados inválidos.';
    } else if (error.status === 0) {
      errorMessage = 'Erro de conexão com o servidor.';
    }

    return throwError(() => errorMessage);
  }

  changeUserPassword(userId: string, passwordData: ChangePasswordRequest) {
    return this.http.put<void>(`${this.apiUrl}/${userId}/password`, passwordData, this.getHttpOptions())
      .pipe(catchError(this.handleError.bind(this)));
  }


  addCardToUser(userId: string, payload: { nome: string; tipoCartao: CardType }) {
    return this.http.post<Card>(`${this.apiUrl}/${userId}/cards`, payload, this.getHttpOptions())
      .pipe(catchError(this.handleError.bind(this)));
  }
}