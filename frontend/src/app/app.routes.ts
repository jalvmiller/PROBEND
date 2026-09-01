import { Routes } from '@angular/router';
import { authGuard, publicGuard } from './guards/auth.guard';

export const routes: Routes = [
  // 1. Rota Pública de Autenticação (Apenas visitantes - protegida por publicGuard)
  {
    path: 'login',
    canActivate: [publicGuard],
    loadComponent: () =>
      import('./pages/login/login.component').then(m => m.LoginComponent)
  },

  // 2. Rota Raiz Protegida: Feed de Questões com Lazy Loading
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },

  // 3. Rota Dinâmica Protegida: Detalhes da Questão com Lazy Loading
  {
    path: 'questoes/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/questao-detalhes/questao-detalhes.component').then(m => m.QuestaoDetalhesComponent)
  },

  // 4. Fallback: Qualquer rota desconhecida redireciona para a raiz
  {
    path: '**',
    redirectTo: ''
  }
];

