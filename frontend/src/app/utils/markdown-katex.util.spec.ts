import { describe, it, expect } from 'vitest';
import { renderMarkdownKatex } from './markdown-katex.util';

describe('renderMarkdownKatex', () => {
  it('deve retornar string vazia para valores nulos, indefinidos ou vazios', () => {
    expect(renderMarkdownKatex('')).toBe('');
    expect(renderMarkdownKatex('   ')).toBe('');
    // @ts-expect-error testando valor nulo defensivo
    expect(renderMarkdownKatex(null)).toBe('');
    // @ts-expect-error testando valor indefinido defensivo
    expect(renderMarkdownKatex(undefined)).toBe('');
  });

  it('deve renderizar fórmulas matemáticas inline ($...$) sem exibir MATHINLINE', () => {
    const input = 'Considere a matriz $A$ de ordem $2 \\times 2$ e o vetor $x$.';
    const output = renderMarkdownKatex(input);

    expect(output).not.toContain('MATHINLINE');
    expect(output).not.toContain('MATH_INLINE');
    expect(output).toContain('katex');
    expect(output).toContain('katex-html');
  });

  it('deve renderizar fórmulas matemáticas em bloco ($$...$$) em displayMode sem encapsular em <p>', () => {
    const input = 'Seja a integral:\n\n$$\\int_0^1 x^2 dx = \\frac{1}{3}$$\n\nComo demonstrado.';
    const output = renderMarkdownKatex(input);

    expect(output).toContain('katex-display');
    expect(output).not.toContain('<p class="doc-p"><span class="katex-display">');
    expect(output).not.toContain('MATHBLOCK');
    expect(output).not.toContain('MATH_BLOCK');
  });

  it('deve suportar delimitadores LaTeX \\[ ... \\] e \\( ... \\)', () => {
    const inputBloco = '\\[ E = mc^2 \\]';
    const outputBloco = renderMarkdownKatex(inputBloco);
    expect(outputBloco).toContain('katex-display');

    const inputInline = 'Fórmula \\( F = ma \\) clássica.';
    const outputInline = renderMarkdownKatex(inputInline);
    expect(outputInline).toContain('katex');
    expect(outputInline).not.toContain('MATHINLINE');
  });

  it('deve preservar fórmulas matemáticas contendo subscritos com underscore sem conflito de itálico', () => {
    const input = 'Considere $a_1 + a_2 = a_3$ e mais $x_{ij}$.';
    const output = renderMarkdownKatex(input);

    expect(output).not.toContain('MATHINLINE');
    expect(output).toContain('katex');
  });

  it('deve renderizar corretamente quando a fórmula estiver dentro de ênfase (negrito ou itálico)', () => {
    const input = 'Temos **$E = mc^2$ em negrito** e *$F = ma$ em itálico*.';
    const output = renderMarkdownKatex(input);

    expect(output).toContain('<strong class="doc-strong">');
    expect(output).toContain('<em class="doc-em">');
    expect(output).toContain('katex');
    expect(output).not.toContain('MATHINLINE');
  });

  it('não deve confundir variáveis de shell com cifrão ($VAR) dentro de blocos de código ou código inline', () => {
    const input = 'Execute `export PATH=$PATH:/usr/bin` e depois calcule $y = 2x$.';
    const output = renderMarkdownKatex(input);

    expect(output).toContain('<code class="doc-inline-code">export PATH=$PATH:/usr/bin</code>');
    expect(output).toContain('katex');
    expect(output).not.toContain('MATHINLINE');
  });

  it('deve preservar cifrão monetário escapado com contra-barra (\\$)', () => {
    const input = 'O livro custa \\$10 e não $x$.';
    const output = renderMarkdownKatex(input);

    expect(output).toContain('$10');
    expect(output).toContain('katex');
  });

  it('deve suportar a opção inline sem criar tags de bloco <p class="doc-p">', () => {
    const input = 'Título com $x^2 + y^2 = 1$';
    const output = renderMarkdownKatex(input, { inline: true });

    expect(output).not.toContain('<p');
    expect(output).toContain('katex');
    expect(output).not.toContain('MATHINLINE');
  });
});
