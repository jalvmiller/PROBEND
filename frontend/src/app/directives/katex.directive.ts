import { Directive, ElementRef, Input, OnChanges, SimpleChanges } from '@angular/core';
import katex from 'katex';

/**
 * Diretiva [appKatex]: Superpoder anexado a qualquer tag HTML para
 * converter texto com sintaxe LaTeX ($...$ ou $$...$$) em fórmulas matemáticas.
 */
@Directive({
  selector: '[appKatex]',
  standalone: true
})
export class KatexDirective implements OnChanges {
  // Recebe o texto contendo fórmulas matemáticas
  @Input('appKatex') content: string = '';

  // ElementRef nos dá acesso direto ao elemento HTML onde a diretiva foi anexada
  constructor(private readonly el: ElementRef<HTMLElement>) {}

  // Ciclo de vida: executado automaticamente toda vez que o 'content' mudar
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['content']) {
      this.renderizarMatematica();
    }
  }

  private renderizarMatematica(): void {
    if (!this.content) {
      this.el.nativeElement.innerHTML = '';
      return;
    }

    try {
      let texto = this.content;

      // 1. Converte fórmulas em bloco: $$...$$ e \[...\]
      texto = texto.replace(/\$\$([\s\S]+?)\$\$/g, (_, math) => this.renderKaTeX(math.trim(), true));
      texto = texto.replace(/\\\[([\s\S]+?)\\\]/g, (_, math) => this.renderKaTeX(math.trim(), true));

      // 2. Converte fórmulas inline: $...$ e \(...\)
      texto = texto.replace(/\$([^\$\n]+?)\$/g, (_, math) => this.renderKaTeX(math.trim(), false));
      texto = texto.replace(/\\\(([\s\S]+?)\\\)/g, (_, math) => this.renderKaTeX(math.trim(), false));

      // Injeta o HTML resultante com as equações formatadas
      this.el.nativeElement.innerHTML = texto;
    } catch {
      this.el.nativeElement.textContent = this.content;
    }
  }

  private renderKaTeX(math: string, displayMode: boolean): string {
    try {
      return katex.renderToString(math, {
        displayMode,
        throwOnError: false
      });
    } catch {
      return math;
    }
  }
}
