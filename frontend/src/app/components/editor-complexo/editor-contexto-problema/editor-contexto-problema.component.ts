import { Component, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KatexDirective } from '../../../directives/katex.directive';

type AbaContexto = 'enunciado' | 'anotacoes';

/**
 * Painel direito do Modo Algoritmo: mostra as informações do problema
 * e disponibiliza o campo interativo de anotações e análise matemática com prévia KaTeX.
 */
@Component({
  selector: 'app-editor-contexto-problema',
  standalone: true,
  imports: [FormsModule, KatexDirective],
  templateUrl: './editor-contexto-problema.component.html',
  styleUrl: './editor-contexto-problema.component.css'
})
export class EditorContextoProblemaComponent implements OnInit {
  @Input() titulo: string = '';
  @Input() subtitulo: string = '';
  @Input() enunciado: string = '';
  @Input() codigoOriginal: string = '';
  @Input() anotacoes: string = '';

  @Output() anotacoesChange = new EventEmitter<string>();

  public abaAtiva = signal<AbaContexto>('enunciado');

  ngOnInit(): void {
    // Na criação de questão não existe enunciado original; abrimos direto nas anotações.
    if (!this.enunciado?.trim()) {
      this.abaAtiva.set('anotacoes');
    }
  }

  public selecionarAba(aba: AbaContexto): void {
    this.abaAtiva.set(aba);
  }
}
