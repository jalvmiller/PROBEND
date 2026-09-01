import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { QuestaoService } from '../../services/questao.service';
import { Questao, Dificuldade } from '../../models/questao.model';
import { KatexDirective } from '../../directives/katex.directive';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, KatexDirective],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  private readonly questaoService = inject(QuestaoService);

  // Estados reativos (Signals)
  public questoes = signal<Questao[]>([]);
  public loading = signal<boolean>(true);
  public termoBusca = signal<string>('');
  public filtroDificuldade = signal<'TODAS' | Dificuldade>('TODAS');

  ngOnInit(): void {
    this.carregarQuestoes();
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
    this.carregarQuestoes();
  }

  public alterarFiltroDificuldade(dificuldade: 'TODAS' | Dificuldade): void {
    this.filtroDificuldade.set(dificuldade);
  }

  public get questoesFiltradas(): Questao[] {
    const dif = this.filtroDificuldade();
    const lista = this.questoes();
    if (dif === 'TODAS') return lista;
    return lista.filter(q => q.dificuldade === dif);
  }
}
