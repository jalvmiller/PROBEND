import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../../icon/icon.component';

@Component({
  selector: 'app-editor-header',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './editor-header.component.html',
  styleUrl: './editor-header.component.css'
})
export class EditorHeaderComponent {
  @Input() badgeModo: string = 'QUESTÃO';
  @Input() titulo: string = '';
  @Input() subtitulo: string = '';
  @Input() modoAtivo: 'MATEMATICA' | 'ALGORITMO' = 'MATEMATICA';
  @Input() mostrarVerEnunciado: boolean = false;
  @Input() enunciadoAberto: boolean = false;
  @Input() totalLinhas: number = 0;
  @Input() totalCaracteres: number = 0;
  @Input() selectedPdfFile: File | null = null;
  @Input() submetendo: boolean = false;
  @Input() textoBotaoAcao: string = 'Salvar Resolução';
  @Input() podeSubmeter: boolean = false;

  @Output() fechar = new EventEmitter<void>();
  @Output() modoAlterado = new EventEmitter<'MATEMATICA' | 'ALGORITMO'>();
  @Output() alternarEnunciado = new EventEmitter<void>();
  @Output() abrirGuia = new EventEmitter<void>();
  @Output() pdfSelecionado = new EventEmitter<Event>();
  @Output() removerPdf = new EventEmitter<void>();
  @Output() submeter = new EventEmitter<void>();
}
