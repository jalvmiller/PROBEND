import { Directive, ElementRef, Input, OnChanges, SimpleChanges } from '@angular/core';
import katex from 'katex';

/**
 * Diretiva [appKatex] — Superpoder anexado a qualquer tag HTML para
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
      let textoProcessado = this.content;

      // 1. Converte fórmulas em bloco: $$ fórmula $$
      textoProcessado = textoProcessado.replace(/\$\$([\s\S]+?)\$\$/g, (_, math) => {
        try {
          return katex.renderToString(math.trim(), { displayMode: true, throwOnError: false });
        } catch {
          return math;
        }
      });

      // 2. Converte fórmulas inline (na mesma linha): $ fórmula $
      textoProcessado = textoProcessado.replace(/\$([^\$\n]+?)\$/g, (_, math) => {
        try {
          return katex.renderToString(math.trim(), { displayMode: false, throwOnError: false });
        } catch {
          return math;
        }
      });

      // Injeta o HTML resultante com as equações matemáticas formatadas
      this.el.nativeElement.innerHTML = textoProcessado;
    } catch {
      this.el.nativeElement.textContent = this.content;
    }
  }
}
