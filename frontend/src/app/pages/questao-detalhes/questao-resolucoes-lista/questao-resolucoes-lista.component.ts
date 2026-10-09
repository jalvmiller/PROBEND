import { Component, EventEmitter, Input, Output } from '@angular/core';
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
  @Input() resolucoesOrdenadas: Resolucao[] = [];
  @Input() ordenacao: 'upvotes' | 'recentes' = 'upvotes';
  @Input() meusUpvotesResolucoes: number[] = [];

  @Output() alterarOrdenacao = new EventEmitter<'upvotes' | 'recentes'>();
  @Output() upvoteResolucao = new EventEmitter<Resolucao>();
  @Output() abrirComentarios = new EventEmitter<Resolucao>();
  @Output() baixarPdf = new EventEmitter<Resolucao>();

  public isResolucaoUpvoted(id: number): boolean {
    return this.meusUpvotesResolucoes.includes(id);
  }
}
