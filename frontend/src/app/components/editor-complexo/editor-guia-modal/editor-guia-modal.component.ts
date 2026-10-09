import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-editor-guia-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './editor-guia-modal.component.html',
  styleUrl: './editor-guia-modal.component.css'
})
export class EditorGuiaModalComponent {
  @Input() aberto: boolean = false;
  @Output() fechar = new EventEmitter<void>();
}
