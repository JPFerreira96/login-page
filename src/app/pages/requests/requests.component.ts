import { Component } from '@angular/core';

@Component({
  selector: 'app-requests',
  standalone: true,
  template: `
    <header class="topbar">
      <h1 class="title">Minhas solicitações</h1>
    </header>
    
    <section class="requests-content">
      <div class="card">
        <h3>Histórico de Solicitações</h3>
        <p>Página em desenvolvimento...</p>
      </div>
    </section>
  `,
  styles: [`
    .topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
      
      .title {
        font-size: 28px;
        margin: 0;
      }
    }
    
    .card {
      background: #fff;
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 1px 8px rgba(0,0,0,.05);
    }
  `]
})
export class RequestsComponent {}