import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { QuestaoService } from '../../services/questao.service';
import { TrilhaService } from '../../services/trilha.service';
import { Questao, getDificuldadeTexto, getDificuldadeClasse } from '../../models/questao.model';

@Component({
  selector: 'app-trilha-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './trilha-form.component.html',
  styleUrl: './trilha-form.component.css'
})
export class TrilhaFormComponent implements OnInit {
  private readonly questaoService = inject(QuestaoService);
  private readonly trilhaService = inject(TrilhaService);
  private readonly router = inject(Router);

  public readonly getDificuldadeTexto = getDificuldadeTexto;
  public readonly getDificuldadeClasse = getDificuldadeClasse;

  public titulo = signal<string>('');
  public descricao = signal<string>('');
  public publica = signal<boolean>(true);

  public todasQuestoes = signal<Questao[]>([]);
  public questoesSelecionadas = signal<Questao[]>([]);
  public busca = signal<string>('');

  public carregandoQuestoes = signal<boolean>(true);
  public salvando = signal<boolean>(false);
  public erro = signal<string>('');

  public readonly questoesFiltradas = computed(() => {
    const termo = this.busca().trim().toLowerCase();
    const selecionadasIds = new Set(this.questoesSelecionadas().map(q => q.id));
    
    return this.todasQuestoes().filter(q => {
      if (selecionadasIds.has(q.id)) return false;
      if (!termo) return true;
      return (
        (q.enunciado && q.enunciado.toLowerCase().includes(termo)) ||
        (q.materia && q.materia.toLowerCase().includes(termo)) ||
        (q.assunto && q.assunto.toLowerCase().includes(termo))
      );
    });
  });

  public ngOnInit(): void {
    this.carregarQuestoes();
  }

  public carregarQuestoes(): void {
    this.carregandoQuestoes.set(true);
    this.questaoService.listar().subscribe({
      next: (dados) => {
        this.todasQuestoes.set(dados);
        this.carregandoQuestoes.set(false);
      },
      error: () => {
        this.erro.set('Não foi possível carregar as questões.');
        this.carregandoQuestoes.set(false);
      }
    });
  }

  public adicionarQuestao(q: Questao): void {
    this.questoesSelecionadas.update(lista => [...lista, q]);
  }

  public removerQuestao(index: number): void {
    this.questoesSelecionadas.update(lista => lista.filter((_, i) => i !== index));
  }

  public moverCima(index: number): void {
    if (index <= 0) return;
    this.questoesSelecionadas.update(lista => {
      const nova = [...lista];
      const temp = nova[index - 1];
      nova[index - 1] = nova[index];
      nova[index] = temp;
      return nova;
    });
  }

  public moverBaixo(index: number): void {
    if (index >= this.questoesSelecionadas().length - 1) return;
    this.questoesSelecionadas.update(lista => {
      const nova = [...lista];
      const temp = nova[index + 1];
      nova[index + 1] = nova[index];
      nova[index] = temp;
      return nova;
    });
  }

  public salvarTrilha(): void {
    const t = this.titulo().trim();
    if (!t) {
      this.erro.set('Informe um título para a trilha.');
      return;
    }

    if (this.questoesSelecionadas().length === 0) {
      this.erro.set('Adicione pelo menos uma questão à sua trilha.');
      return;
    }

    this.salvando.set(true);
    this.erro.set('');

    const questaoIds = this.questoesSelecionadas().map(q => q.id);

    this.trilhaService.criarTrilha({
      titulo: t,
      descricao: this.descricao().trim() || undefined,
      publica: this.publica(),
      questaoIds
    }).subscribe({
      next: () => {
        this.salvando.set(false);
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.salvando.set(false);
        this.erro.set(err?.error?.erro || 'Erro ao criar a trilha.');
      }
    });
  }
}
