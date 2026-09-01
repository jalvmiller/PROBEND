import { Component, OnInit, Input, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { QuestaoService } from '../../services/questao.service';
import { Questao } from '../../models/questao.model';
import { KatexDirective } from '../../directives/katex.directive';

@Component({
  selector: 'app-questao-detalhes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, KatexDirective],
  templateUrl: './questao-detalhes.component.html',
  styleUrl: './questao-detalhes.component.css'
})
export class QuestaoDetalhesComponent implements OnInit {
  // 1. O Angular preenche este @Input automaticamente com o :id da URL!
  @Input() id!: string;

  private readonly questaoService = inject(QuestaoService);

  // Estados reativos (Signals)
  public questao = signal<Questao | null>(null);
  public loading = signal<boolean>(true);
  public erro = signal<string>('');

  // Estados do formulário de resolução
  public novaResolucao = signal<string>('');
  public submetendo = signal<boolean>(false);

  ngOnInit(): void {
    if (this.id) {
      this.carregarQuestao(this.id);
    }
  }

  public carregarQuestao(id: string): void {
    this.loading.set(true);
    this.erro.set('');

    this.questaoService.buscarPorId(id).subscribe({
      next: (q) => {
        this.questao.set(q);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Erro ao carregar questão:', err);
        this.erro.set('Não foi possível carregar os detalhes da questão.');
        this.loading.set(false);
      }
    });
  }

  public darUpvote(): void {
    const q = this.questao();
    if (!q) return;

    this.questaoService.upvote(q.id).subscribe({
      next: () => {
        // Recarrega a questão com o contador atualizado
        this.carregarQuestao(String(q.id));
      }
    });
  }

  public getTagsArray(tags: any): string[] {
    if (!tags) return [];
    return tags.map((t: any) => typeof t === 'string' ? t : t.nome);
  }
}
