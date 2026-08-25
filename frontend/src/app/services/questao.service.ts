import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Questao } from '../models/questao.model';

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
   * Busca uma questão específica pelo id
   */
  public buscarPorId(id: number | string): Observable<Questao> {
    return this.http.get<Questao>(`${this.baseUrl}/${id}`);
  }

  /**
   * Incrementa/alterna o upvote em uma questão
   */
  public upvote(id: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${id}/upvote`, {});
  }
}
