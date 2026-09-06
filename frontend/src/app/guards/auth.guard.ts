import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * authGuard: Protege rotas privadas (Dashboard, Detalhes de Questão, etc.)
 *
 * Comparativo React para Angular:
 * - No React: Usava-se um wrapper `<ProtectedRoute><Component /></ProtectedRoute>` com `if (!isAuthenticated) return <Navigate to="/login" />`.
 * - No Angular: O guard é uma função declarativa (`CanActivateFn`) acoplada à rota no roteador.
 *   Ela executa antes do carregamento do componente. Retornar `true` permite o acesso; retornar `UrlTree` redireciona.
 */
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  // Redireciona para a tela de login
  return router.createUrlTree(['/login']);
};

/**
 * publicGuard: Protege rotas públicas exclusivas para não-autenticados (Login, Cadastro)
 *
 * Impede que usuários já logados acessem a tela de login desnecessariamente,
 * redirecionando-os de volta para o feed/dashboard principal ('/').
 */
export const publicGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return true;
  }

  // Redireciona para a página principal
  return router.createUrlTree(['/']);
};
