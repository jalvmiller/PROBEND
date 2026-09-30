import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay, tap, catchError } from 'rxjs';
import { AuthService } from './auth.service';
import { Usuario } from '../models/auth.model';
import { Questao } from '../models/questao.model';
import {
  AtualizarPerfilRequest,
  AlterarSenhaRequest,
  MinhaResolucao,
  MeuComentario
} from '../models/perfil.model';

@Injectable({
  providedIn: 'root'
})
export class PerfilService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  // Modo Mock ativado durante o refinamento de frontend.
  // Quando o backend tiver os endpoints prontos, basta alternar para false.
  public readonly mockMode = signal<boolean>(false);

  /**
   * Busca as questões criadas pelo usuário logado
   */
  public obterMinhasQuestoes(): Observable<Questao[]> {
    if (this.mockMode()) {
      const u = this.authService.currentUser();
      const autorMock: Usuario = {
        id: u?.id || 1,
        username: u?.username || 'joao_silva',
        nome: u?.nome || 'João Silva',
        avatar: u?.avatar || undefined,
        pontos: u?.pontos ?? 145,
        especialista: !!u?.especialista,
        administrador: !!u?.administrador
      };

      const mockQuestoes: Questao[] = [
        {
          id: 101,
          enunciado: 'Calcule a integral imprópria $\\int_0^\\infty e^{-x^2} dx$ justificando a convergência pela função Gama.',
          materia: 'Cálculo Diferencial e Integral II',
          assunto: 'Integrais Impróprias',
          dificuldade: 2,
          upvotes: 14,
          upvotesCount: 14,
          solucionada: true,
          autor: autorMock,
          dataInsercao: new Date().toISOString()
        },
        {
          id: 102,
          enunciado: 'Demonstre a complexidade assintótica do algoritmo Dijkstra utilizando fila de prioridades (Heap Binário vs Heap de Fibonacci).',
          materia: 'Estruturas de Dados Avançadas',
          assunto: 'Grafos e Caminhos Mínimos',
          dificuldade: 1,
          upvotes: 8,
          upvotesCount: 8,
          solucionada: false,
          autor: autorMock,
          dataInsercao: new Date(Date.now() - 86400000 * 3).toISOString()
        }
      ];

      return of(mockQuestoes).pipe(delay(200));
    }

    return this.http.get<Questao[]>('/api/usuarios/me/questoes');
  }

  /**
   * Busca as resoluções postadas pelo usuário logado
   */
  public obterMinhasResolucoes(): Observable<MinhaResolucao[]> {
    if (this.mockMode()) {
      const mockResolucoes: MinhaResolucao[] = [
        {
          id: 501,
          questaoId: 101,
          questaoEnunciado: 'Calcule a integral imprópria $\\int_0^\\infty e^{-x^2} dx$',
          questaoMateria: 'Cálculo II',
          conteudo: 'Usando a substituição $u = x^2$, temos $du = 2x\\,dx$. Relacionamos com a integral gaussiana: $I = \\frac{\\sqrt{\\pi}}{2}$.',
          trechoCodigo: '// Verificação numérica via trapézio\ndouble integral = Integrador.gaussiano(0, 100);',
          linguagemCodigo: 'java',
          upvotes: 9,
          verificadoPorEspecialista: true,
          qtdComentarios: 2,
          dataCriacao: new Date().toISOString()
        },
        {
          id: 502,
          questaoId: 42,
          questaoEnunciado: 'Encontre os autovalores da matriz simétrica $A \\in \\mathbb{R}^{3 \\times 3}$',
          questaoMateria: 'Álgebra Linear',
          conteudo: 'Pelo Teorema Espectral, os autovalores são todos reais. Calculamos $\\det(A - \\lambda I) = 0$.',
          upvotes: 5,
          verificadoPorEspecialista: false,
          qtdComentarios: 1,
          dataCriacao: new Date(Date.now() - 86400000 * 2).toISOString()
        }
      ];

      return of(mockResolucoes).pipe(delay(200));
    }

    return this.http.get<MinhaResolucao[]>('/api/usuarios/me/resolucoes');
  }

  /**
   * Busca os comentários postados pelo usuário logado
   */
  public obterMeusComentarios(): Observable<MeuComentario[]> {
    if (this.mockMode()) {
      const mockComentarios: MeuComentario[] = [
        {
          id: 801,
          conteudo: 'Excelente resolução! Apenas um detalhe no passo 3: o termo residual de Lagrange precisa ser positivo.',
          dataCriacao: new Date().toISOString(),
          resolucaoId: 501,
          questaoId: 101,
          questaoEnunciado: 'Calcule a integral imprópria $\\int_0^\\infty e^{-x^2} dx$'
        },
        {
          id: 802,
          conteudo: 'Concordo com a abordagem via Heap, reduz a complexidade de $O(V^2)$ para $O((V+E)\\log V)$.',
          dataCriacao: new Date(Date.now() - 86400000).toISOString(),
          resolucaoId: 502,
          questaoId: 102,
          questaoEnunciado: 'Complexidade assintótica do algoritmo Dijkstra'
        }
      ];

      return of(mockComentarios).pipe(delay(200));
    }

    return this.http.get<MeuComentario[]>('/api/usuarios/me/comentarios');
  }

  /**
   * Atualiza dados de Nome e E-mail do usuário autenticado
   */
  public atualizarDados(dados: AtualizarPerfilRequest): Observable<Usuario> {
    if (this.mockMode()) {
      const u = this.authService.currentUser();
      const usuarioAtualizado: Usuario = {
        id: u?.id || 1,
        username: u?.username || 'usuario',
        nome: dados.nome,
        email: dados.email,
        avatar: u?.avatar,
        pontos: u?.pontos ?? 0,
        especialista: !!u?.especialista,
        administrador: !!u?.administrador
      };

      // Atualiza o state global do AuthService imediatamente
      return of(usuarioAtualizado).pipe(
        delay(300),
        tap(atualizado => {
          // Utiliza a sessão local para refletir no header e telas
          (this.authService as any)._currentUser?.set(atualizado);
        })
      );
    }

    return this.http.put<Usuario>('/api/usuarios/me', dados).pipe(
      tap(usuarioAtualizado => {
        (this.authService as any)._currentUser?.set(usuarioAtualizado);
      })
    );
  }

  /**
   * Altera a senha do usuário autenticado
   */
  public alterarSenha(dados: AlterarSenhaRequest): Observable<{ mensagem: string }> {
    if (this.mockMode()) {
      if (!dados.senhaAtual || dados.senhaAtual.trim() === '') {
        throw new Error('A senha atual é obrigatória.');
      }
      if (!dados.novaSenha || dados.novaSenha.length < 6) {
        throw new Error('A nova senha deve ter no mínimo 6 caracteres.');
      }
      if (dados.confirmacaoSenha && dados.novaSenha !== dados.confirmacaoSenha) {
        throw new Error('A confirmação não confere com a nova senha.');
      }

      return of({ mensagem: 'Senha alterada com sucesso!' }).pipe(delay(350));
    }

    return this.http.put<{ mensagem: string }>('/api/usuarios/me/senha', dados);
  }
}
