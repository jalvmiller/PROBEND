import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Questao, getDificuldadeTexto, getDificuldadeClasse } from '../../../models/questao.model';
import { KatexDirective } from '../../../directives/katex.directive';
import { AvatarComponent } from '../../../components/avatar/avatar.component';
import { IconComponent } from '../../../components/icon/icon.component';

@Component({
  selector: 'app-questao-enunciado-artigo',
  standalone: true,
  imports: [CommonModule, KatexDirective, AvatarComponent, IconComponent],
  templateUrl: './questao-enunciado-artigo.component.html',
  styleUrl: './questao-enunciado-artigo.component.css'
})
export class QuestaoEnunciadoArtigoComponent {
  @Input() questao!: Questao;
  @Input() isUpvoted: boolean = false;
  @Input() upvotesCount: number = 0;

  @Output() upvote = new EventEmitter<void>();

  public readonly getDificuldadeTexto = getDificuldadeTexto;
  public readonly getDificuldadeClasse = getDificuldadeClasse;

  public getTagsArray(tags: any): string[] {
    if (!tags) return [];
    if (Array.isArray(tags)) return tags;
    if (typeof tags === 'string') {
      return tags.split(',').map((t: string) => t.trim()).filter(Boolean);
    }
    return [];
  }
}
