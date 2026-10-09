import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KatexDirective } from '../../../directives/katex.directive';

@Component({
  selector: 'app-editor-code-preview',
  standalone: true,
  imports: [CommonModule, KatexDirective],
  templateUrl: './editor-code-preview.component.html',
  styleUrl: './editor-code-preview.component.css'
})
export class EditorCodePreviewComponent {
  @Input() trechoCodigo: string = '';
  @Input() linguagemCodigo: string = 'python';
  @Input() codigoDestacado: string = '';
  @Input() conteudoExplicacao: string = '';
}
