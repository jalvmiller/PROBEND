import { Directive, ElementRef, Input, OnChanges, SimpleChanges } from '@angular/core';
import { renderMarkdownKatex } from '../utils/markdown-katex.util';

/**
 * Diretiva [appKatex]: Converte texto com Markdown e sintaxe LaTeX ($...$ ou $$...$$)
 * em conteudo HTML estruturado com formulas matematicas, imagens e formatacao tecnica.
 */
@Directive({
  selector: '[appKatex]',
  standalone: true
})
export class KatexDirective implements OnChanges {
  @Input('appKatex') content: string = '';
  @Input() inline?: boolean;
  @Input() removePagebreaks?: boolean;

  constructor(private readonly el: ElementRef<HTMLElement>) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['content'] || changes['inline'] || changes['removePagebreaks']) {
      this.renderizarConteudo();
    }
  }

  private renderizarConteudo(): void {
    if (this.content == null || this.content === '') {
      this.el.nativeElement.innerHTML = '';
      return;
    }

    try {
      const tagName = this.el.nativeElement?.tagName?.toUpperCase() || '';
      const isInline = this.inline !== undefined
        ? this.inline
        : ['SPAN', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P'].includes(tagName);

      this.el.nativeElement.innerHTML = renderMarkdownKatex(String(this.content), {
        inline: isInline,
        removePagebreaks: this.removePagebreaks
      });
    } catch {
      this.el.nativeElement.textContent = String(this.content);
    }
  }
}
