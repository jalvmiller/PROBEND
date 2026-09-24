import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { QuestaoService } from '../../services/questao.service';
import { Questao, Dificuldade, UpvoteResponse, getDificuldadeTexto, getDificuldadeClasse } from '../../models/questao.model';
import { QuestaoCardComponent } from '../../components/questao-card/questao-card.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, QuestaoCardComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  private readonly questaoService = inject(QuestaoService);

  public readonly getDificuldadeTexto = getDificuldadeTexto;
  public readonly getDificuldadeClasse = getDificuldadeClasse;

  // Estados reativos (Signals)
  public questoes = signal<Questao[]>([]);
  public loading = signal<boolean>(true);
  public termoBusca = signal<string>('');
  public filtroDificuldade = signal<string>('TODAS');
  public filtroStatus = signal<'TODAS' | 'PENDENTES' | 'SOLUCIONADAS'>('TODAS');
  public itensPorPagina = signal<number>(10);
  public paginaAtual = signal<number>(1);
  public meusUpvotes = signal<number[]>([]);

  // Conjunto de IDs de cards expandidos
  public cardsExpandidos = signal<Set<number>>(new Set<number>());

  ngOnInit(): void {
    this.carregarQuestoes();
    this.carregarMeusUpvotes();
  }

  public carregarMeusUpvotes(): void {
    this.questaoService.getMeusUpvotes().subscribe({
      next: (ids: number[]) => this.meusUpvotes.set(ids || []),
      error: () => {}
    });
  }

  public carregarQuestoes(): void {
    this.loading.set(true);

    this.questaoService.listar(this.termoBusca()).subscribe({
      next: (dados) => {
        this.questoes.set(dados || []);
        this.loading.set(false);
      },
      error: (erro) => {
        console.error('Erro ao carregar questões:', erro);
        this.questoes.set([]);
        this.loading.set(false);
      }
    });
  }

  public aoDigitarBusca(novoTermo: string): void {
    this.termoBusca.set(novoTermo);
    this.paginaAtual.set(1);
    this.carregarQuestoes();
  }

  public alterarFiltroDificuldade(dificuldade: string): void {
    this.filtroDificuldade.set(dificuldade);
    this.paginaAtual.set(1);
  }

  public alterarFiltroStatus(status: 'TODAS' | 'PENDENTES' | 'SOLUCIONADAS'): void {
    this.filtroStatus.set(status);
    this.paginaAtual.set(1);
  }

  public alterarItensPorPagina(qtd: number): void {
    this.itensPorPagina.set(qtd);
    this.paginaAtual.set(1);
  }

  public irParaPagina(p: number): void {
    if (p >= 1 && p <= this.totalPaginas) {
      this.paginaAtual.set(p);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  public paginaAnterior(): void {
    this.irParaPagina(this.paginaAtual() - 1);
  }

  public proximaPagina(): void {
    this.irParaPagina(this.paginaAtual() + 1);
  }

  public alternarUpvote(q: Questao, event: Event): void {
    event.stopPropagation();
    this.questaoService.upvote(q.id).subscribe({
      next: (res: UpvoteResponse) => {
        q.upvotes = res.upvotes;
        q.upvotesCount = res.upvotes;
        this.meusUpvotes.update(ids => {
          if (res.upvoted) {
            return [...ids, q.id];
          } else {
            return ids.filter(id => id !== q.id);
          }
        });
      }
    });
  }

  public isUpvoted(id: number): boolean {
    return this.meusUpvotes().includes(id);
  }

  public toggleExpandirCard(id: number): void {
    this.cardsExpandidos.update(set => {
      const novo = new Set(set);
      if (novo.has(id)) {
        novo.delete(id);
      } else {
        novo.add(id);
      }
      return novo;
    });
  }

  public isCardExpandido(id: number): boolean {
    return this.cardsExpandidos().has(id);
  }

  public getDificuldadeCardClasse(dif: any): string {
    if (dif === 2 || dif === '2' || dif === 'DIFICIL') return 'card-dificuldade-dificil';
    if (dif === 1 || dif === '1' || dif === 'MEDIO' || dif === 'MEDIA') return 'card-dificuldade-media';
    return 'card-dificuldade-facil';
  }

  public get questoesFiltradas(): Questao[] {
    const dif = this.filtroDificuldade();
    const st = this.filtroStatus();
    let lista = this.questoes();

    // Filtro por Dificuldade
    if (dif !== 'TODAS') {
      lista = lista.filter(q => {
        const qDif = String(q.dificuldade);
        if (dif === 'FACIL') return qDif === '0' || qDif === 'FACIL';
        if (dif === 'MEDIA') return qDif === '1' || qDif === 'MEDIA' || qDif === 'MEDIO';
        if (dif === 'DIFICIL') return qDif === '2' || qDif === 'DIFICIL';
        return true;
      });
    }

    // Filtro por Status
    if (st === 'PENDENTES') {
      lista = lista.filter(q => !q.solucionada);
    } else if (st === 'SOLUCIONADAS') {
      lista = lista.filter(q => q.solucionada);
    }

    return lista;
  }

  public get totalPaginas(): number {
    return Math.ceil(this.questoesFiltradas.length / this.itensPorPagina()) || 1;
  }

  public get paginasArray(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  public get indiceInicio(): number {
    return (this.paginaAtual() - 1) * this.itensPorPagina();
  }

  public get indiceFim(): number {
    return Math.min(this.indiceInicio + this.itensPorPagina(), this.questoesFiltradas.length);
  }

  public get questoesPaginadas(): Questao[] {
    return this.questoesFiltradas.slice(this.indiceInicio, this.indiceFim);
  }

  public onQuestaoExcluida(id: number): void {
    this.questoes.update(lista => lista.filter(q => q.id !== id));
  }

  public onQuestaoEditada(questaoAtualizada: Questao): void {
    this.questoes.update(lista =>
      lista.map(q => q.id === questaoAtualizada.id ? { ...q, ...questaoAtualizada } : q)
    );
  }
}
