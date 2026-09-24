import { Component, Input, Output, EventEmitter, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Questao, getDificuldadeTexto, getDificuldadeClasse } from '../../models/questao.model';
import { AuthService } from '../../services/auth.service';
import { QuestaoService } from '../../services/questao.service';
import { KatexDirective } from '../../directives/katex.directive';
import { RoleBadgeComponent } from '../role-badge/role-badge.component';
import { QuestaoEditModalComponent } from '../questao-edit-modal/questao-edit-modal.component';

@Component({
  selector: 'app-questao-card',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    KatexDirective,
    RoleBadgeComponent,
    QuestaoEditModalComponent
  ],
  templateUrl: './questao-card.component.html',
  styleUrl: './questao-card.component.css',
  providers: [DatePipe]
})
export class QuestaoCardComponent {
  @Input({ required: true }) questao!: Questao;
  @Input() isUpvoted: boolean = false;
  @Input() isExpandido: boolean = false;

  @Output() toggleExpandir = new EventEmitter<void>();
  @Output() upvote = new EventEmitter<Event>();
  @Output() questaoExcluida = new EventEmitter<number>();
  @Output() questaoEditada = new EventEmitter<Questao>();

  public readonly authService = inject(AuthService);
  private readonly questaoService = inject(QuestaoService);
  private readonly datePipe = inject(DatePipe);

  public readonly modalEditAberto = signal<boolean>(false);
  public readonly excluindo = signal<boolean>(false);

  public get dificuldadeTexto(): string {
    return getDificuldadeTexto(this.questao?.dificuldade);
  }

  public get dificuldadeClasse(): string {
    return getDificuldadeClasse(this.questao?.dificuldade);
  }

  public get cardDificuldadeClasse(): string {
    const dif = this.questao?.dificuldade;
    if (dif === 2 || dif === '2' || dif === 'DIFICIL') return 'card-dif-dificil';
    if (dif === 1 || dif === '1' || dif === 'MEDIO' || dif === 'MEDIA') return 'card-dif-media';
    return 'card-dif-facil';
  }

  public get glowDificuldadeClasse(): string {
    const dif = this.questao?.dificuldade;
    if (dif === 2 || dif === '2' || dif === 'DIFICIL') return 'glow-dificil';
    if (dif === 1 || dif === '1' || dif === 'MEDIO' || dif === 'MEDIA') return 'glow-media';
    return 'glow-facil';
  }

  public get dataFormatada(): string {
    const dataStr = this.questao?.dataInsercao || this.questao?.criadoEm;
    if (!dataStr) return 'Não informada';
    try {
      return this.datePipe.transform(dataStr, 'dd/MM/yyyy') || 'Não informada';
    } catch {
      return 'Não informada';
    }
  }

  public get isAutor(): boolean {
    const user = this.authService.currentUser();
    if (!user || !this.questao?.autor) return false;
    return user.username === this.questao.autor.username || 
           user.id === this.questao.autor.id || 
           !!user.administrador;
  }

  public onCardClick(): void {
    this.toggleExpandir.emit();
  }

  public onUpvoteClick(event: Event): void {
    event.stopPropagation();
    if (!this.authService.isAuthenticated()) {
      alert('Você precisa estar autenticado para curtir uma questão.');
      return;
    }
    this.upvote.emit(event);
  }

  public abrirModalEdicao(event: Event): void {
    event.stopPropagation();
    this.modalEditAberto.set(true);
  }

  public fecharModalEdicao(): void {
    this.modalEditAberto.set(false);
  }

  public onSalvarSucesso(questaoAtualizada: Questao): void {
    this.questao = { ...this.questao, ...questaoAtualizada };
    this.questaoEditada.emit(this.questao);
  }

  public onExcluirClick(event: Event): void {
    event.stopPropagation();
    const conf = window.confirm(`Deseja realmente excluir a questão #${this.questao.id}? Esta ação não pode ser desfeita.`);
    if (!conf) return;

    this.excluindo.set(true);
    this.questaoService.excluir(this.questao.id).subscribe({
      next: () => {
        this.excluindo.set(false);
        this.questaoExcluida.emit(this.questao.id);
      },
      error: (err) => {
        this.excluindo.set(false);
        console.error('Erro ao excluir questão:', err);
        alert('Erro ao excluir questão. Verifique suas permissões no servidor.');
      }
    });
  }
}
