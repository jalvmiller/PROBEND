import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CodeMirrorEditorComponent } from '../code-mirror-editor/code-mirror-editor.component';

@Component({
  selector: 'app-editor-code-pane',
  standalone: true,
  imports: [CommonModule, FormsModule, CodeMirrorEditorComponent],
  templateUrl: './editor-code-pane.component.html',
  styleUrl: './editor-code-pane.component.css'
})
export class EditorCodePaneComponent {
  @Input() trechoCodigo: string = '';
  @Input() linguagemCodigo: string = 'python';
  @Input() placeholderCodigo: string = '';
  @Input() conteudoExplicacao: string = '';

  @Output() trechoCodigoChange = new EventEmitter<string>();
  @Output() linguagemCodigoChange = new EventEmitter<string>();
  @Output() conteudoExplicacaoChange = new EventEmitter<string>();

  // Lista de linguagens suportadas
  public readonly linguagens = [
    { valor: 'java', rotulo: 'Java' },
    { valor: 'python', rotulo: 'Python' },
    { valor: 'cpp', rotulo: 'C++' },
    { valor: 'csharp', rotulo: 'C#' },
    { valor: 'c', rotulo: 'C' },
    { valor: 'javascript', rotulo: 'JavaScript' },
    { valor: 'typescript', rotulo: 'TypeScript' },
    { valor: 'sql', rotulo: 'SQL' },
    { valor: 'rust', rotulo: 'Rust' },
    { valor: 'go', rotulo: 'Go' }
  ];
}
