import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../enviroments/enviroment';
import { AuthService } from './auth.service';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  cpf?: string;
  birthDate?: string;
  motherName?: string;
  role: string;
  cards?: any[];
}

export interface UpdateUserRequest {
  name: string;
  email: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiBaseUrl}/users`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHttpOptions() {
    const token = this.authService.getToken();
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      })
    };
  }

  /**
   * Busca os dados do usuário logado através do endpoint /me
   */
  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`, this.getHttpOptions())
      .pipe(catchError(this.handleError.bind(this)));
  }

  /**
   * Atualiza os dados do usuário logado usando endpoint /me
   */
  updateProfile(userData: UpdateUserRequest): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/me`, userData, this.getHttpOptions())
      .pipe(catchError(this.handleError.bind(this)));
  }

  /**
   * Altera a senha do usuário logado usando endpoint /me/password
   */
  changePassword(passwordData: ChangePasswordRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/me/password`, passwordData, this.getHttpOptions())
      .pipe(catchError(this.handleError.bind(this)));
  }

  /**
   * Exclui a conta do usuário
   */
  deleteUser(userId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${userId}`, this.getHttpOptions())
      .pipe(catchError(this.handleError.bind(this)));
  }
  /** Lista todos os usuários (ADMIN) */
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}`, this.getHttpOptions())
      .pipe(catchError(this.handleError.bind(this)));
  }
  /** Busca usuário por ID */
  getUser(userId: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${userId}`, this.getHttpOptions())
      .pipe(catchError(this.handleError.bind(this)));
  }
  /** Atualiza usuário (ADMIN ou próprio usuário) */
  updateUser(userId: string, userData: UpdateUserRequest): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${userId}`, userData, this.getHttpOptions())
      .pipe(catchError(this.handleError.bind(this)));
  }
  /** Adiciona cartão a um usuário */
  addCardToUser(userId: string, request: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${userId}/cards`, request, this.getHttpOptions())
      .pipe(catchError(this.handleError.bind(this)));
  }
  /** Remove cartão de um usuário */
  removeCardFromUser(userId: string, cardId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${userId}/cards/${cardId}`, this.getHttpOptions())
      .pipe(catchError(this.handleError.bind(this)));
  }
  /** Ativa cartão de um usuário */
  activateUserCard(userId: string, cardId: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${userId}/cards/${cardId}/activate`, null, this.getHttpOptions())
      .pipe(catchError(this.handleError.bind(this)));
  }
  /** Desativa cartão de um usuário */
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
  return this.http.put<void>(`${this.apiUrl}/${userId}/password`, passwordData, this.getHttpOptions());
}
}