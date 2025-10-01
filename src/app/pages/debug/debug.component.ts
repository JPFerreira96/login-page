import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { CardService } from '../../core/services/card.service';

@Component({
  selector: 'app-debug',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding: 20px; font-family: monospace;">
      <h2>🔍 Debug da API</h2>
      
      <div style="margin: 20px 0;">
        <h3>Status da Autenticação:</h3>
        <p>✅ Autenticado: {{ isAuthenticated() }}</p>
        <p>🔑 Token existe: {{ !!token() }}</p>
        <p>👤 Role: {{ role() }}</p>
        <p>🔢 Token preview: {{ tokenPreview() }}</p>
      </div>

      <div style="margin: 20px 0;">
        <button (click)="testCardsAPI()" 
                style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; margin-right: 10px;">
          🧪 Testar API de Cartões
        </button>
        <button (click)="createTestCards()" 
                style="padding: 10px 20px; background: #28a745; color: white; border: none; border-radius: 5px;">
          🚀 Criar Cartões de Teste
        </button>
      </div>

      <div style="margin: 20px 0;" *ngIf="apiResponse()">
        <h3>Resposta da API:</h3>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 5px;">
          <pre>{{ apiResponse() }}</pre>
        </div>
      </div>

      <div style="margin: 20px 0;">
        <h3>Dados no LocalStorage/SessionStorage:</h3>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 5px;">
          <p><strong>localStorage['auth']:</strong></p>
          <pre>{{ localStorageAuth() }}</pre>
          <p><strong>sessionStorage['auth']:</strong></p>
          <pre>{{ sessionStorageAuth() }}</pre>
        </div>
      </div>
    </div>
  `
})
export class DebugComponent {
  isAuthenticated = signal(false);
  token = signal<string | null>(null);
  role = signal<string | null>(null);
  apiResponse = signal<string>('');
  localStorageAuth = signal<string>('');
  sessionStorageAuth = signal<string>('');

  constructor(
    private authService: AuthService,
    private cardService: CardService
  ) {
    this.updateAuthStatus();
  }

  updateAuthStatus() {
    this.isAuthenticated.set(this.authService.isAuthenticated());
    this.token.set(this.authService.getToken());
    this.role.set(this.authService.getRole());
    
    const localAuth = localStorage.getItem('auth');
    const sessionAuth = sessionStorage.getItem('auth');
    
    this.localStorageAuth.set(localAuth ? JSON.stringify(JSON.parse(localAuth), null, 2) : 'null');
    this.sessionStorageAuth.set(sessionAuth ? JSON.stringify(JSON.parse(sessionAuth), null, 2) : 'null');
  }

  tokenPreview() {
    const token = this.token();
    return token ? token.substring(0, 50) + '...' : 'null';
  }

  testCardsAPI() {
    console.log('🧪 Testando API de cartões...');
    this.apiResponse.set('Carregando...');
    
    this.cardService.getMyCards().subscribe({
      next: (cards) => {
        console.log('✅ API Success:', cards);
        this.apiResponse.set(`✅ SUCCESS:\n${JSON.stringify(cards, null, 2)}`);
      },
      error: (error) => {
        console.error('❌ API Error:', error);
        this.apiResponse.set(`❌ ERROR:\n${JSON.stringify(error, null, 2)}`);
      }
    });
  }

  createTestCards() {
    console.log('🚀 Criando cartões de teste...');
    this.apiResponse.set('Criando cartões de teste...');
    
    this.cardService.createTestCards().subscribe({
      next: (cards) => {
        console.log('✅ Cartões criados:', cards);
        this.apiResponse.set(`✅ CARTÕES CRIADOS COM SUCESSO:\n${JSON.stringify(cards, null, 2)}`);
        // Atualizar status de autenticação
        this.updateAuthStatus();
      },
      error: (error) => {
        console.error('❌ Erro ao criar cartões:', error);
        this.apiResponse.set(`❌ ERRO AO CRIAR CARTÕES:\n${JSON.stringify(error, null, 2)}`);
      }
    });
  }
}