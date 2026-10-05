import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { TrilhaAtiva, TrilhaResumo } from '../models/trilha.model';

@Injectable({
  providedIn: 'root'
})
export class TrilhaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/trilhas';

  public readonly trilhaAtiva = signal<TrilhaAtiva | null>(null);
  public readonly recolhido = signal<boolean>(false);
  public readonly loading = signal<boolean>(false);

  constructor() {
    const estadoSalvo = localStorage.getItem('probend_trilha_recolhida');
    if (estadoSalvo !== null) {
      this.recolhido.set(estadoSalvo === 'true');
    }
  }

  public carregarTrilhaAtiva(): Observable<TrilhaAtiva | null> {
    this.loading.set(true);
    return this.http.get<TrilhaAtiva>(`${this.baseUrl}/ativa`).pipe(
      tap((trilha) => {
        this.trilhaAtiva.set(trilha || null);
        this.loading.set(false);
      }),
      catchError(() => {
        this.trilhaAtiva.set(null);
        this.loading.set(false);
        return of(null);
      })
    );
  }

  public alternarConclusao(trilhaId: number, itemId: number): Observable<TrilhaAtiva> {
    return this.http.patch<TrilhaAtiva>(`${this.baseUrl}/${trilhaId}/itens/${itemId}/conclusao`, {}).pipe(
      tap((atualizada) => this.trilhaAtiva.set(atualizada))
    );
  }

  public alternarPorQuestao(questaoId: number): Observable<TrilhaAtiva> {
    return this.http.patch<TrilhaAtiva>(`${this.baseUrl}/questoes/${questaoId}/conclusao`, {}).pipe(
      tap((atualizada) => this.trilhaAtiva.set(atualizada))
    );
  }

  public ativarTrilha(trilhaId: number): Observable<TrilhaAtiva> {
    return this.http.post<TrilhaAtiva>(`${this.baseUrl}/${trilhaId}/ativar`, {}).pipe(
      tap((ativa) => this.trilhaAtiva.set(ativa))
    );
  }

  public desativarTrilha(trilhaId: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${trilhaId}/desativar`, {}).pipe(
      tap(() => this.trilhaAtiva.set(null))
    );
  }

  public listarPublicas(): Observable<TrilhaResumo[]> {
    return this.http.get<TrilhaResumo[]>(this.baseUrl);
  }

  public listarTodas(): Observable<TrilhaResumo[]> {
    return this.http.get<TrilhaResumo[]>(this.baseUrl);
  }

  public buscarPorId(id: number): Observable<TrilhaResumo> {
    return this.http.get<TrilhaResumo>(`${this.baseUrl}/${id}`);
  }

  public removerTrilha(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  public criarTrilha(request: { titulo: string; descricao?: string; publica?: boolean; questaoIds: number[] }): Observable<TrilhaResumo> {
    return this.http.post<TrilhaResumo>(this.baseUrl, request).pipe(
      tap(() => {
        this.carregarTrilhaAtiva().subscribe();
      })
    );
  }

  public toggleRecolhido(): void {
    const novo = !this.recolhido();
    this.recolhido.set(novo);
    localStorage.setItem('probend_trilha_recolhida', String(novo));
  }
}
