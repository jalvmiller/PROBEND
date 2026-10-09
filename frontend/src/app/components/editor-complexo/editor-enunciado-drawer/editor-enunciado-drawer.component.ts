import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KatexDirective } from '../../../directives/katex.directive';

@Component({
  selector: 'app-editor-enunciado-drawer',
  standalone: true,
  imports: [CommonModule, KatexDirective],
  templateUrl: './editor-enunciado-drawer.component.html',
  styleUrl: './editor-enunciado-drawer.component.css'
})
export class EditorEnunciadoDrawerComponent {
  @Input() aberto: boolean = false;
  @Input() enunciado: string = '';
  @Input() codigoOriginal: string = '';

  @Output() fechar = new EventEmitter<void>();
}
