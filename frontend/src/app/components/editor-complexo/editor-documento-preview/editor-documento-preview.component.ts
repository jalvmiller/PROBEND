import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KatexDirective } from '../../../directives/katex.directive';
import { exportarResolucaoPdf } from '../../../utils/pdf-export.util';
import { IconComponent } from '../../icon/icon.component';

@Component({
  selector: 'app-editor-documento-preview',
  standalone: true,
  imports: [CommonModule, KatexDirective, IconComponent],
  templateUrl: './editor-documento-preview.component.html',
  styleUrl: './editor-documento-preview.component.css'
})
export class EditorDocumentoPreviewComponent {
  @Input() conteudo: string = '';
  @Input() trechoCodigo: string = '';
  @Input() linguagemCodigo: string = 'java';
  @Input() titulo: string = '';
  @Input() subtitulo: string = '';
  @Input() autorExibicao: string = 'Você';

  @Input() paginas: string[] = [''];
  @Input() paginaAtualIndex: number = 0;
  @Input() modoVisualizacao: 'DOCUMENTO' | 'CORRIDO' = 'DOCUMENTO';

  @Output() paginaAtualIndexChange = new EventEmitter<number>();
  @Output() modoVisualizacaoChange = new EventEmitter<'DOCUMENTO' | 'CORRIDO'>();
  @Output() adicionarPagina = new EventEmitter<void>();

  public exportandoPdf = false;

  public get totalPaginas(): number {
    return this.paginas.length;
  }

  public get conteudoPaginaAtiva(): string {
    const idx = Math.min(Math.max(this.paginaAtualIndex, 0), this.paginas.length - 1);
    return this.paginas[idx] || '';
  }

  public alternarModoVisualizacao(modo: 'DOCUMENTO' | 'CORRIDO'): void {
    this.modoVisualizacao = modo;
    this.modoVisualizacaoChange.emit(modo);
  }

  public proximaPagina(): void {
    if (this.paginaAtualIndex < this.totalPaginas - 1) {
      this.paginaAtualIndex++;
      this.paginaAtualIndexChange.emit(this.paginaAtualIndex);
    }
  }

  public paginaAnterior(): void {
    if (this.paginaAtualIndex > 0) {
      this.paginaAtualIndex--;
      this.paginaAtualIndexChange.emit(this.paginaAtualIndex);
    }
  }

  public irParaPagina(index: number): void {
    if (index >= 0 && index < this.totalPaginas) {
      this.paginaAtualIndex = index;
      this.paginaAtualIndexChange.emit(this.paginaAtualIndex);
    }
  }

  public async baixarPdfDocumento(): Promise<void> {
    if (!this.conteudo.trim() && !this.trechoCodigo.trim()) {
      return;
    }

    let conteudoParaExportar = this.conteudo.trim();
    if (!conteudoParaExportar && this.trechoCodigo.trim()) {
      conteudoParaExportar = '```' + this.linguagemCodigo + '\n' + this.trechoCodigo + '\n```';
    }

    try {
      this.exportandoPdf = true;
      await exportarResolucaoPdf(this.paginas, {
        titulo: this.titulo || 'Resolução Probend',
        autor: this.autorExibicao,
        subtitulo: this.subtitulo
      });
    } catch (err) {
      console.error('Erro ao gerar PDF da resolução:', err);
      alert('Não foi possível iniciar a exportação para PDF.');
    } finally {
      this.exportandoPdf = false;
    }
  }
}
