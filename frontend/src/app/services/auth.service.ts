import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of, firstValueFrom } from 'rxjs';
import { Usuario, LoginRequest, RegisterRequest, AuthResponse } from '../models/auth.model';

/**
 * AuthService — Gerenciador Central de Autenticação com Signals
 *
 * Comparativo React ➔ Angular:
 * - Em React: Criávamos `AuthContext` com `useState(null)` para `user` e `isAuthenticated`.
 * - Em Angular: Criamos um `@Injectable({ providedIn: 'root' })` (Singleton).
 *   O estado é mantido por SIGNALS (`signal()`), que oferecem reatividade granular
 *   e sem necessidade de re-renderizar árvores inteiras de componentes.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly baseUrl = '/api/auth';

  // 1. Signals Privados (Mutáveis apenas dentro do serviço via .set() ou .update())
  private readonly _currentUser = signal<Usuario | null>(null);
  private readonly _isLoading = signal<boolean>(true);

  // 2. Signals Públicos Readonly (Expostos para os componentes lerem sem poder alterar diretamente)
  public readonly currentUser = this._currentUser.asReadonly();
  public readonly isLoading = this._isLoading.asReadonly();

  // 3. Computed Signal (Calculado automaticamente sempre que _currentUser muda de valor)
  // No React, você usaria `useMemo(() => !!user, [user])` ou uma variável calculada
  public readonly isAuthenticated = computed(() => this._currentUser() !== null);

  /**
   * Inicialização de Sessão
   * Executado durante o bootstrap do app (via provideAppInitializer)
   * Garante que o Angular descubra se o usuário já tem cookie ativo antes de ativar as rotas.
   */
  public async inicializarSessao(): Promise<void> {
    try {
      this._isLoading.set(true);
      const usuario = await firstValueFrom(this.obterUsuarioAtual());
      this._currentUser.set(usuario);
    } catch {
      // 401/403 do Spring indica ausência de sessão ativa (comportamento esperado para visitantes)
      this._currentUser.set(null);
    } finally {
      this._isLoading.set(false);
    }
  }

  /**
   * GET /api/auth/me — Busca os dados da sessão ativa no Spring Security
   */
  public obterUsuarioAtual(): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.baseUrl}/me`);
  }

  /**
   * POST /api/auth/login — Efetua login com credenciais
   * Após a validação das credenciais pelo Spring (que grava o cookie HTTP-Only AUTH_TOKEN),
   * atualiza o Signal `_currentUser` com os dados do usuário.
   */
  public login(credenciais: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, credenciais).pipe(
      tap(async () => {
        try {
          const usuario = await firstValueFrom(this.obterUsuarioAtual());
          this._currentUser.set(usuario);
        } catch {
          this._currentUser.set(null);
        }
      })
    );
  }

  /**
   * POST /api/auth/register — Cadastro de nova conta
   */
  public register(dados: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/register`, dados);
  }

  /**
   * POST /api/auth/visitor-session — Cria uma sessão temporária de visitante
   */
  public visitorSession(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/visitor-session`, {}).pipe(
      tap(async () => {
        try {
          const usuario = await firstValueFrom(this.obterUsuarioAtual());
          this._currentUser.set(usuario);
        } catch {
          this._currentUser.set(null);
        }
      })
    );
  }

  /**
   * POST /api/auth/logout — Invalida sessão e zera o estado local
   */
  public logout(): void {
    this.http.post(`${this.baseUrl}/logout`, {}).pipe(
      catchError(() => of(null))
    ).subscribe(() => {
      this._currentUser.set(null);
      this.router.navigate(['/login']);
    });
  }
}
