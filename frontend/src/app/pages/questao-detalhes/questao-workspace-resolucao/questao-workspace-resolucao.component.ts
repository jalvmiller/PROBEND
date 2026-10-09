import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { KatexDirective } from '../../../directives/katex.directive';

@Component({
  selector: 'app-questao-workspace-resolucao',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, KatexDirective],
  templateUrl: './questao-workspace-resolucao.component.html',
  styleUrl: './questao-workspace-resolucao.component.css'
})
export class QuestaoWorkspaceResolucaoComponent {
  @Input() isAutenticado: boolean = false;
  @Input() novaResolucao: string = '';
  @Input() codigoResolucao: string = '';
  @Input() selectedPdfFile: File | null = null;
  @Input() mostrarCampoCodigo: boolean = false;
  @Input() submetendo: boolean = false;

  @Output() novaResolucaoChange = new EventEmitter<string>();
  @Output() codigoResolucaoChange = new EventEmitter<string>();
  @Output() mostrarCampoCodigoChange = new EventEmitter<boolean>();
  @Output() abrirEditorExpandido = new EventEmitter<void>();
  @Output() pdfSelecionado = new EventEmitter<Event>();
  @Output() removerPdf = new EventEmitter<void>();
  @Output() submeter = new EventEmitter<void>();
}
