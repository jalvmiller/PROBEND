import { Component, Input, Output, EventEmitter, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { Comentario } from '../../../models/questao.model';
import { KatexDirective } from '../../../directives/katex.directive';
import { AvatarComponent } from '../../../components/avatar/avatar.component';

/**
 * ComentarioItemComponent
 *
 * Componente standalone recursivo para exibição de comentários em árvore estilo Reddit.
 * Suporta colapso de nós ([+]/[−]), linhas guia laterais interativas,
 * respostas em linha (inline form) e suporte completo a LaTeX via KaTeX.
 */
@Component({
  selector: 'app-comentario-item',
  standalone: true,
  imports: [CommonModule, FormsModule, KatexDirective, ComentarioItemComponent, AvatarComponent],
  templateUrl: './comentario-item.component.html',
  styleUrl: './comentario-item.component.css'
})
export class ComentarioItemComponent {
  @Input({ required: true }) comentario!: Comentario;
  @Input() nivel: number = 0;
  @Output() responder = new EventEmitter<{ paiId: number; conteudo: string }>();

  public readonly authService = inject(AuthService);

  // Limite de até 6 níveis de hierarquia (0 a 5). No nível 5, respostas são bloqueadas.
  public readonly LIMITE_NIVEL = 5;

  public colapsado = signal<boolean>(false);
  public exibindoFormResposta = signal<boolean>(false);
  public textoResposta = signal<string>('');

  public alternarColapso(): void {
    this.colapsado.update(v => !v);
  }

  public abrirResposta(): void {
    if (!this.authService.isAuthenticated() || this.nivel >= this.LIMITE_NIVEL) return;
    this.exibindoFormResposta.set(true);
    this.textoResposta.set('');
  }

  public cancelarResposta(): void {
    this.exibindoFormResposta.set(false);
    this.textoResposta.set('');
  }

  public submeterResposta(): void {
    const texto = this.textoResposta().trim();
    if (!texto) return;

    this.responder.emit({
      paiId: this.comentario.id,
      conteudo: texto
    });

    this.cancelarResposta();
  }

  public onSubResposta(event: { paiId: number; conteudo: string }): void {
    this.responder.emit(event);
  }

  /**
   * Calcula recursivamente a quantidade total de respostas descendentes do comentário.
   */
  public contarTotalRespostas(c: Comentario): number {
    if (!c.respostas || c.respostas.length === 0) return 0;
    return c.respostas.reduce((acc, r) => acc + 1 + this.contarTotalRespostas(r), 0);
  }
}
