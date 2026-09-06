import { Component, OnInit, Input, Output, EventEmitter, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuestaoService } from '../../../services/questao.service';
import { AuthService } from '../../../services/auth.service';
import { Comentario } from '../../../models/questao.model';
import { KatexDirective } from '../../../directives/katex.directive';

@Component({
  selector: 'app-comentario-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, KatexDirective],
  templateUrl: './comentario-modal.component.html',
  styleUrl: './comentario-modal.component.css'
})
export class ComentarioModalComponent implements OnInit {
  @Input({ required: true }) resolucaoId!: number;
  @Input() nomeAutorResolucao: string = 'Membro da comunidade';
  @Output() fechar = new EventEmitter<void>();

  private readonly questaoService = inject(QuestaoService);
  public readonly authService = inject(AuthService);

  public comentarios = signal<Comentario[]>([]);
  public carregando = signal<boolean>(true);
  public novoComentario = signal<string>('');
  public enviando = signal<boolean>(false);
  public erro = signal<string>('');

  ngOnInit(): void {
    this.carregarComentarios();
  }

  public carregarComentarios(): void {
    this.carregando.set(true);
    this.questaoService.listarComentarios(this.resolucaoId).subscribe({
      next: (lista) => {
        this.comentarios.set(lista);
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set('Erro ao carregar comentários.');
        this.carregando.set(false);
      }
    });
  }

  public enviarComentario(): void {
    const texto = (this.novoComentario() || '').trim();
    if (!texto || this.enviando()) return;

    this.enviando.set(true);
    this.questaoService.postarComentario(this.resolucaoId, texto).subscribe({
      next: (salvo) => {
        this.comentarios.update(atuais => [...atuais, salvo]);
        this.novoComentario.set('');
        this.enviando.set(false);
      },
      error: () => {
        alert('Erro ao enviar comentário.');
        this.enviando.set(false);
      }
    });
  }

  public onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.fechar.emit();
    }
  }
}
