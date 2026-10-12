import { Component, EventEmitter, Input, Output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Resolucao } from '../../../models/questao.model';
import { KatexDirective } from '../../../directives/katex.directive';
import { AvatarComponent } from '../../../components/avatar/avatar.component';
import { IconComponent } from '../../../components/icon/icon.component';

@Component({
  selector: 'app-questao-resolucoes-lista',
  standalone: true,
  imports: [CommonModule, KatexDirective, AvatarComponent, IconComponent],
  templateUrl: './questao-resolucoes-lista.component.html',
  styleUrl: './questao-resolucoes-lista.component.css'
})
export class QuestaoResolucoesListaComponent {
  @Input() resolucoes: Resolucao[] = [];

  @Input()
  set resolucoesOrdenadas(valor: Resolucao[]) {
    this._resolucoesOrdenadas.set(valor || []);
  }
  get resolucoesOrdenadas(): Resolucao[] {
    return this._resolucoesOrdenadas();
  }
  public _resolucoesOrdenadas = signal<Resolucao[]>([]);

  @Input() ordenacao: 'upvotes' | 'recentes' = 'upvotes';
  @Input() meusUpvotesResolucoes: number[] = [];

  @Output() alterarOrdenacao = new EventEmitter<'upvotes' | 'recentes'>();
  @Output() upvoteResolucao = new EventEmitter<Resolucao>();
  @Output() abrirComentarios = new EventEmitter<Resolucao>();
  @Output() baixarPdf = new EventEmitter<Resolucao>();

  // Termo da pesquisa
  public termoBusca = signal<string>('');

  // Resoluções filtradas reativamente por nome do autor ou conteúdo da demonstração
  public resolucoesExibidas = computed(() => {
    const termo = this.termoBusca().trim().toLowerCase();
    const lista = this._resolucoesOrdenadas();

    if (!termo) {
      return lista;
    }

    return lista.filter(res => {
      const nomeAutor = (res.autor?.nome || res.autor?.username || '').toLowerCase();
      const conteudo = (res.conteudo || '').toLowerCase();
      return nomeAutor.includes(termo) || conteudo.includes(termo);
    });
  });

  // Atualiza o termo de busca a partir do evento de digitação
  public atualizarBusca(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.termoBusca.set(input?.value ?? '');
  }

  // Limpa o termo de busca
  public limparBusca(): void {
    this.termoBusca.set('');
  }

  // Guardamos os IDs das resoluções que estão recolhidas
  public idsRecolhidos = signal<Set<number>>(new Set());

  public isResolucaoUpvoted(id: number): boolean {
    return this.meusUpvotesResolucoes.includes(id);
  }

  // Verifica se uma resolução específica está recolhida
  public isRecolhido(id: number): boolean {
    return this.idsRecolhidos().has(id);
  }

  // Alterna entre expandir e recolher uma resolução específica
  public alternarFold(id: number): void {
    this.idsRecolhidos.update(setAtual => {
      const novoSet = new Set(setAtual);
      if (novoSet.has(id)) {
        novoSet.delete(id);
      } else {
        novoSet.add(id);
      }
      return novoSet;
    });
  }

  // Verifica se todas as resoluções visíveis estão atualmente recolhidas
  public todasRecolhidas(): boolean {
    const exibidas = this.resolucoesExibidas();
    return exibidas.length > 0 && exibidas.every(r => this.idsRecolhidos().has(r.id));
  }

  // Alterna o estado de todas as resoluções visíveis
  public alternarTodas(): void {
    const exibidas = this.resolucoesExibidas();
    if (this.todasRecolhidas()) {
      this.idsRecolhidos.update(setAtual => {
        const novoSet = new Set(setAtual);
        exibidas.forEach(r => novoSet.delete(r.id));
        return novoSet;
      });
    } else {
      this.idsRecolhidos.update(setAtual => {
        const novoSet = new Set(setAtual);
        exibidas.forEach(r => novoSet.add(r.id));
        return novoSet;
      });
    }
  }
}
