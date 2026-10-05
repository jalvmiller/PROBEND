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
function getXsrfCookie(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|; )\s*XSRF-TOKEN=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  // Clona a requisição para habilitar o tráfego automático de cookies HTTP-Only (AUTH_TOKEN / JSESSIONID)
  let headers = req.headers;
  const metodo = req.method.toUpperCase();

  // Para requisições mutantes (POST, PUT, PATCH, DELETE), anexa o token CSRF extraído do cookie
  if (metodo !== 'GET' && metodo !== 'HEAD' && metodo !== 'OPTIONS') {
    const xsrfToken = getXsrfCookie();
    if (xsrfToken && !headers.has('X-XSRF-TOKEN')) {
      headers = headers.set('X-XSRF-TOKEN', xsrfToken);
    }
  }

  const authReq = req.clone({
    headers,
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
