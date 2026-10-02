import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditorComplexoComponent, RespostaEditorComplexo } from '../editor-complexo.component';

@Component({
  selector: 'app-editor-complexo-criacao',
  standalone: true,
  imports: [CommonModule, EditorComplexoComponent],
  template: `
    <app-editor-complexo
      [titulo]="tituloQuestao || 'Criação de Questão Técnica'"
      [subtitulo]="materiaQuestao || 'Enunciado & Código'"
      [badgeModo]="isEdicao ? 'EDIÇÃO' : 'QUESTÃO'"
      [mostrarVerEnunciado]="false"
      [placeholderMatematicaText]="placeholderMath"
      [placeholderCodigoText]="placeholderCode"
      [textoBotaoAcao]="'Aplicar ao Formulário'"
      [conteudoInicial]="conteudoInicial"
      [codigoInicial]="codigoInicial"
      [linguagemInicial]="linguagemInicial"
      [forcarModoAlgoritmo]="false"
      (fechar)="fechar.emit($event)"
      (publicar)="publicar.emit($event)"
    ></app-editor-complexo>
  `,
  styles: ``
})
export class EditorComplexoCriacaoComponent {
  @Input() tituloQuestao: string = '';
  @Input() materiaQuestao: string = '';
  @Input() isEdicao: boolean = false;
  
  @Input() conteudoInicial: string = '';
  @Input() codigoInicial: string = '';
  @Input() linguagemInicial: string = '';

  @Output() fechar = new EventEmitter<RespostaEditorComplexo>();
  @Output() publicar = new EventEmitter<RespostaEditorComplexo>();

  public readonly placeholderMath = `Digite aqui o enunciado detalhado da questão...

Use fórmulas em LaTeX na mesma linha ($x^2 + y^2 = r^2$) ou em bloco destacado:
$$\\int_{0}^{1} x^n \\, dx = \\frac{1}{n+1}$$

Você pode incluir explicações, teoremas e quebras de página com <!-- pagebreak -->.`;

  public readonly placeholderCode = `// Escreva o trecho de código, assinatura de método ou template que acompanha a questão...
// Suporta identação com Tab e realce de sintaxe PrismJS.`;
}
