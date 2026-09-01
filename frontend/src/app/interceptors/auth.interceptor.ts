import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

/**
 * Interceptor funcional moderno do Angular (HttpInterceptorFn)
 *
 * Comparativo com React:
 * No React com Axios, fazíamos: api.interceptors.request.use(...) e withCredentials: true.
 * No Angular, o interceptor clona a requisição adicionando credenciais (cookies da sessão HTTP-Only)
 * e captura respostas 401 para redirecionar rotas privadas automaticamente.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  // Clona a requisição para habilitar o tráfego automático de cookies HTTP-Only (AUTH_TOKEN / JSESSIONID)
  const authReq = req.clone({
    withCredentials: true
  });

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Se a API retornar 401 Unauthorized e não estivermos tentando logar ou validar a sessão inicial
      if (
        error.status === 401 &&
        !req.url.includes('/auth/me') &&
        !req.url.includes('/auth/login') &&
        !req.url.includes('/auth/csrf')
      ) {
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
