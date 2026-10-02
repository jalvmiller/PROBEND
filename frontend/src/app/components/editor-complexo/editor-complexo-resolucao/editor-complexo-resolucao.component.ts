import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditorComplexoComponent, RespostaEditorComplexo } from '../editor-complexo.component';
import { Questao } from '../../../models/questao.model';

@Component({
  selector: 'app-editor-complexo-resolucao',
  standalone: true,
  imports: [CommonModule, EditorComplexoComponent],
  template: `
    <app-editor-complexo
      [titulo]="questao.titulo || 'Demonstração Técnica'"
      [subtitulo]="questao.materia || 'Geral'"
      [badgeModo]="'#' + questao.id"
      [mostrarVerEnunciado]="true"
      [enunciadoOriginal]="questao.enunciado"
      [codigoOriginal]="questao.trechoCodigo || ''"
      [textoBotaoAcao]="'Submeter Resolução'"
      [conteudoInicial]="conteudoInicial"
      [codigoInicial]="codigoInicial"
      [linguagemInicial]="linguagemInicial"
      (fechar)="fechar.emit($event)"
      (publicar)="publicar.emit($event)"
    ></app-editor-complexo>
  `,
  styles: ``
})
export class EditorComplexoResolucaoComponent {
  @Input({ required: true }) questao!: Questao;
  @Input() conteudoInicial: string = '';
  @Input() codigoInicial: string = '';
  @Input() linguagemInicial: string = 'java';

  @Output() fechar = new EventEmitter<RespostaEditorComplexo>();
  @Output() publicar = new EventEmitter<RespostaEditorComplexo>();
}
