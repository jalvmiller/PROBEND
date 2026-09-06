import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Questao, QuestaoRequest, Resolucao, Comentario, UpvoteResponse } from '../models/questao.model';

// @Injectable estilo Spring Boot (injeta dependência no construtor)
// acesso aos endpoints do backend
@Injectable({
  providedIn: 'root' // Serviço Singleton registrado na raiz da aplicação
})
export class QuestaoService {
  // Injeção de dependência moderna com inject()
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/questoes';

  /**
   * Busca a lista de questões no backend Spring Boot
   * @param busca Termo opcional de busca por texto ou tag
   */
  public listar(busca?: string): Observable<Questao[]> {
    let params = new HttpParams();
    if (busca && busca.trim().length > 0) {
      params = params.set('busca', busca.trim());
    }
    return this.http.get<Questao[]>(this.baseUrl, { params });
  }

  /**
   * Busca uma questão específica por ID
   */
  public buscarPorId(id: number | string): Observable<Questao> {
    return this.http.get<Questao>(`${this.baseUrl}/${id}`);
  }

  /**
   * Cria uma nova questão
   */
  public salvar(questao: QuestaoRequest): Observable<Questao> {
    return this.http.post<Questao>(this.baseUrl, questao);
  }

  /**
   * Atualiza uma questão existente
   */
  public atualizar(id: number | string, questao: Partial<QuestaoRequest>): Observable<Questao> {
    return this.http.put<Questao>(`${this.baseUrl}/${id}`, questao);
  }

  /**
   * Exclui uma questão
   */
  public excluir(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  /**
   * Alterna o status da questão (solucionada / pendente)
   */
  public alternarSolucionada(id: number | string, status: boolean): Observable<Questao> {
    return this.http.put<Questao>(`${this.baseUrl}/${id}/solucionada?status=${status}`, {});
  }

  /**
   * Toggle de upvote na questão
   */
  public upvote(id: number | string): Observable<UpvoteResponse> {
    return this.http.post<UpvoteResponse>(`${this.baseUrl}/${id}/upvote`, {});
  }

  /**
   * Retorna os IDs das questões que o usuário logado curtiu
   */
  public getMeusUpvotes(): Observable<number[]> {
    return this.http.get<number[]>(`${this.baseUrl}/meus-upvotes`);
  }

  /**
   * Lista resoluções de uma questão
   */
  public listarResolucoes(questaoId: number | string): Observable<Resolucao[]> {
    return this.http.get<Resolucao[]>(`${this.baseUrl}/${questaoId}/resolucoes`);
  }

  /**
   * Envia uma nova resolução para uma questão
   */
  public enviarResolucao(questaoId: number | string, dados: { conteudo: string; trechoCodigo?: string; linguagemCodigo?: string }): Observable<Resolucao> {
    return this.http.post<Resolucao>(`${this.baseUrl}/${questaoId}/resolucoes`, dados);
  }

  /**
   * Toggle de upvote em uma resolução
   */
  public upvoteResolucao(resolucaoId: number | string): Observable<UpvoteResponse> {
    return this.http.post<UpvoteResponse>(`${this.baseUrl}/resolucoes/${resolucaoId}/upvote`, {});
  }

  /**
   * Retorna os IDs das resoluções que o usuário logado curtiu
   */
  public getMeusUpvotesResolucoes(): Observable<number[]> {
    return this.http.get<number[]>(`${this.baseUrl}/resolucoes/meus-upvotes`);
  }

  /**
   * Lista comentários de uma resolução
   */
  public listarComentarios(resolucaoId: number | string): Observable<Comentario[]> {
    return this.http.get<Comentario[]>(`${this.baseUrl}/resolucoes/${resolucaoId}/comentarios`);
  }

  /**
   * Cria um comentário em uma resolução
   */
  public postarComentario(resolucaoId: number | string, conteudo: string): Observable<Comentario> {
    return this.http.post<Comentario>(`${this.baseUrl}/resolucoes/${resolucaoId}/comentarios`, { conteudo });
  }

  /**
   * Upload de imagem para o MinIO / S3
   */
  public uploadImagem(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ url: string }>('/api/midia/upload', formData);
  }

  /**
   * Sugestão de questão por IA Gemini (rascunho)
   */
  public iaSugerir(prompt: string, rascunhoEnunciado: string = ''): Observable<any> {
    return this.http.post('/api/questoes/ia-sugerir', { prompt, rascunhoEnunciado });
  }

  /**
   * Criação automática de questão por IA Gemini
   */
  public iaCriarTotal(prompt: string): Observable<Questao> {
    return this.http.post<Questao>('/api/questoes/ia-criar-total', { prompt });
  }
}
