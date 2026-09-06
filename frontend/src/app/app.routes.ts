import { Routes } from '@angular/router';
import { authGuard, publicGuard } from './guards/auth.guard';

export const routes: Routes = [
  // 1. Rotas Públicas de Autenticação (Apenas visitantes - protegidas por publicGuard)
  {
    path: 'login',
    canActivate: [publicGuard],
    loadComponent: () =>
      import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    canActivate: [publicGuard],
    loadComponent: () =>
      import('./pages/register/register.component').then(m => m.RegisterComponent)
  },

  // 2. Rota Raiz Protegida: Feed de Questões com Lazy Loading
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },

  // 3. Rotas de Questões
  {
    path: 'questoes/nova',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/questao-form/questao-form.component').then(m => m.QuestaoFormComponent)
  },
  {
    path: 'questoes/:id/editar',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/questao-form/questao-form.component').then(m => m.QuestaoFormComponent)
  },
  {
    path: 'questoes/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/questao-detalhes/questao-detalhes.component').then(m => m.QuestaoDetalhesComponent)
  },

  // 4. Rota de Perfil & Configurações
  {
    path: 'configuracoes',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/configuracoes/configuracoes.component').then(m => m.ConfiguracoesComponent)
  },

  // 5. Fallback: Qualquer rota desconhecida redireciona para a raiz
  {
    path: '**',
    redirectTo: ''
  }
];

