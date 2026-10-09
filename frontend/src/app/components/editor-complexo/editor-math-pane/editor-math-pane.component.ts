import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
  computed,
  signal,
  AfterViewInit,
  OnDestroy,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import 'mathlive';
import { MathfieldElement } from 'mathlive';

import { IconComponent } from '../../icon/icon.component';

// Configura o carregamento de fontes e sons oficiais do MathLive via CDN (evita 404 no Vite em dev)
MathfieldElement.fontsDirectory = '//unpkg.com/mathlive/dist/fonts/';
MathfieldElement.soundsDirectory = '//unpkg.com/mathlive/sounds';

@Component({
  selector: 'app-editor-math-pane',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  templateUrl: './editor-math-pane.component.html',
  styleUrl: './editor-math-pane.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class EditorMathPaneComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() conteudo: string = '';
  @Input() placeholderMatematica: string = 'Digite sua demonstração matemática em Markdown e LaTeX ($...$ ou $$...$$)...';
  
  @Output() conteudoChange = new EventEmitter<string>();
  @Output() cursorAlterado = new EventEmitter<number>();
  @Output() linhaAlterada = new EventEmitter<number>();

  @ViewChild('textareaMatematica') textareaMatematica?: ElementRef<HTMLTextAreaElement>;
  @ViewChild('mathFieldComposer') mathFieldComposer?: ElementRef<MathfieldElement>;
  @ViewChild('gutterMatematica') gutterMatematica?: ElementRef<HTMLElement>;
  @ViewChild('inputArquivoImagem') inputArquivoImagem?: ElementRef<HTMLInputElement>;

  private readonly http = inject(HttpClient);

  // Compositor MathLive (sempre ativo no modo matemática)
  public compositorLatex: string = '';
  private _mathFieldConfigurado = false;
  private _sincronizandoCompositor = false;

  // Linha Ativa e Posicionamento do Destaque
  public linhaAtiva: number = 1;
  public scrollMatematicaTop = signal<number>(0);

  public readonly alturaLinhaPx = 24;
  public readonly paddingTopoPx = 14;

  public get posicaoTopLinhaAtiva(): number {
    return this.paddingTopoPx + (this.linhaAtiva - 1) * this.alturaLinhaPx - this.scrollMatematicaTop();
  }

  // Upload e drag & drop de imagens
  public uploadingImagem = false;
  public erroUpload = '';
  public dragOver = false;

  // Abas do compositor
  public readonly abasCompositor = [
    { id: 'basico', rotulo: 'Básico', icone: '∑' },
    { id: 'calculo', rotulo: 'Cálculo', icone: '∫' },
    { id: 'gregas', rotulo: 'Letras Gregas', icone: 'α' },
    { id: 'matrizes', rotulo: 'Matrizes', icone: '⊞' }
  ] as const;
  public abaCompositorAtiva: string = 'basico';

  // Teclas do compositor MathLive (dados no TS para evitar { } no template Angular)
  public readonly teclasBasico = [
    { visual: 'ᵃ⁄ᵦ', latex: '\\frac{#0}{#0}', dica: 'Fração' },
    { visual: '√x', latex: '\\sqrt{#0}', dica: 'Raiz quadrada' },
    { visual: 'ⁿ√x', latex: '\\sqrt[#0]{#0}', dica: 'Raiz n-ésima' },
    { visual: 'xⁿ', latex: '^{#0}', dica: 'Expoente' },
    { visual: 'xₙ', latex: '_{#0}', dica: 'Subscrito' },
    { visual: 'xₙᵐ', latex: '_{#0}^{#0}', dica: 'Sub e superscrito' },
    { visual: 'log', latex: '\\log_{#0}', dica: 'Logaritmo' },
    { visual: 'ln', latex: '\\ln', dica: 'Log natural' },
    { visual: '∞', latex: '\\infty', dica: 'Infinito' },
    { visual: '±', latex: '\\pm', dica: 'Mais ou menos' },
    { visual: '≠', latex: '\\neq', dica: 'Diferente' },
    { visual: '≤', latex: '\\le', dica: 'Menor ou igual' },
    { visual: '≥', latex: '\\ge', dica: 'Maior ou igual' },
    { visual: '≈', latex: '\\approx', dica: 'Aproximadamente' },
    { visual: '×', latex: '\\times', dica: 'Multiplicação' },
    { visual: '⋅', latex: '\\cdot', dica: 'Ponto' },
    { visual: '∈', latex: '\\in', dica: 'Pertence' },
    { visual: '⊂', latex: '\\subset', dica: 'Subconjunto' },
    { visual: '∪', latex: '\\cup', dica: 'União' },
    { visual: '∩', latex: '\\cap', dica: 'Interseção' }
  ];

  public readonly teclasCalculo = [
    { visual: '∫ₐᵇ f dx', latex: '\\int_{#0}^{#0} #0 \\, d#0', dica: 'Integral definida', largo: true },
    { visual: '∫ f dx', latex: '\\int #0 \\, d#0', dica: 'Integral indefinida', largo: true },
    { visual: '∬ f dA', latex: '\\iint_{#0} #0 \\, dA', dica: 'Integral dupla', largo: true },
    { visual: '∮ f ds', latex: '\\oint_{#0} #0 \\, d#0', dica: 'Integral de contorno', largo: true },
    { visual: '∑ᵢ₌₁ⁿ', latex: '\\sum_{#0}^{#0} #0', dica: 'Somatório', largo: true },
    { visual: '∏ᵢ₌₁ⁿ', latex: '\\prod_{#0}^{#0} #0', dica: 'Produtório', largo: true },
    { visual: 'lim x→a', latex: '\\lim_{#0 \\to #0} #0', dica: 'Limite', largo: true },
    { visual: 'df/dx', latex: '\\frac{d#0}{d#0}', dica: 'Derivada', largo: true },
    { visual: '∂f/∂x', latex: '\\frac{\\partial #0}{\\partial #0}', dica: 'Derivada parcial', largo: true },
    { visual: '∇', latex: '\\nabla', dica: 'Nabla / Gradiente', largo: false },
    { visual: 'sin(x)', latex: '\\sin(#0)', dica: 'Seno', largo: true },
    { visual: 'cos(x)', latex: '\\cos(#0)', dica: 'Cosseno', largo: true },
    { visual: 'tan(x)', latex: '\\tan(#0)', dica: 'Tangente', largo: true },
    { visual: 'eˣ', latex: 'e^{#0}', dica: 'Exponencial', largo: false }
  ];

  public readonly teclasGregas = [
    { visual: 'α', latex: '\\alpha', dica: 'Alpha' },
    { visual: 'β', latex: '\\beta', dica: 'Beta' },
    { visual: 'γ', latex: '\\gamma', dica: 'Gamma' },
    { visual: 'δ', latex: '\\delta', dica: 'Delta' },
    { visual: 'ε', latex: '\\epsilon', dica: 'Epsilon' },
    { visual: 'ζ', latex: '\\zeta', dica: 'Zeta' },
    { visual: 'η', latex: '\\eta', dica: 'Eta' },
    { visual: 'θ', latex: '\\theta', dica: 'Theta' },
    { visual: 'ι', latex: '\\iota', dica: 'Iota' },
    { visual: 'κ', latex: '\\kappa', dica: 'Kappa' },
    { visual: 'λ', latex: '\\lambda', dica: 'Lambda' },
    { visual: 'μ', latex: '\\mu', dica: 'Mu' },
    { visual: 'ν', latex: '\\nu', dica: 'Nu' },
    { visual: 'ξ', latex: '\\xi', dica: 'Xi' },
    { visual: 'π', latex: '\\pi', dica: 'Pi' },
    { visual: 'ρ', latex: '\\rho', dica: 'Rho' },
    { visual: 'σ', latex: '\\sigma', dica: 'Sigma' },
    { visual: 'τ', latex: '\\tau', dica: 'Tau' },
    { visual: 'φ', latex: '\\phi', dica: 'Phi' },
    { visual: 'χ', latex: '\\chi', dica: 'Chi' },
    { visual: 'ψ', latex: '\\psi', dica: 'Psi' },
    { visual: 'ω', latex: '\\omega', dica: 'Omega' },
    { visual: 'Γ', latex: '\\Gamma', dica: 'Gamma maiúsc.' },
    { visual: 'Δ', latex: '\\Delta', dica: 'Delta maiúsc.' },
    { visual: 'Θ', latex: '\\Theta', dica: 'Theta maiúsc.' },
    { visual: 'Λ', latex: '\\Lambda', dica: 'Lambda maiúsc.' },
    { visual: 'Σ', latex: '\\Sigma', dica: 'Sigma maiúsc.' },
    { visual: 'Φ', latex: '\\Phi', dica: 'Phi maiúsc.' },
    { visual: 'Ψ', latex: '\\Psi', dica: 'Psi maiúsc.' },
    { visual: 'Ω', latex: '\\Omega', dica: 'Omega maiúsc.' }
  ];

  public readonly teclasMatrizes = [
    { visual: '( 2×2 )', latex: '\\begin{pmatrix} #0 & #0 \\\\ #0 & #0 \\end{pmatrix}', dica: 'Matriz 2×2 (parênteses)' },
    { visual: '[ 2×2 ]', latex: '\\begin{bmatrix} #0 & #0 \\\\ #0 & #0 \\end{bmatrix}', dica: 'Matriz 2×2 (colchetes)' },
    { visual: '( 3×3 )', latex: '\\begin{pmatrix} #0 & #0 & #0 \\\\ #0 & #0 & #0 \\\\ #0 & #0 & #0 \\end{pmatrix}', dica: 'Matriz 3×3' },
    { visual: '→v', latex: '\\vec{#0}', dica: 'Vetor' },
    { visual: '( col )', latex: '\\begin{pmatrix} #0 \\\\ #0 \\\\ #0 \\end{pmatrix}', dica: 'Vetor coluna' },
    { visual: 'det|2×2|', latex: '\\det \\begin{vmatrix} #0 & #0 \\\\ #0 & #0 \\end{vmatrix}', dica: 'Determinante 2×2' },
    { visual: 'cases', latex: '\\begin{cases} #0 & \\text{se } #0 \\\\ #0 & \\text{se } #0 \\end{cases}', dica: 'Sistema / Cases' },
    { visual: 'x̂', latex: '\\hat{#0}', dica: 'Chapéu' },
    { visual: 'x̄', latex: '\\bar{#0}', dica: 'Barra' },
    { visual: 'ẋ', latex: '\\dot{#0}', dica: 'Ponto (derivada temporal)' }
  ];

  public get linhasMatematica(): number[] {
    const total = (this.conteudo.match(/\n/g) || []).length + 1;
    return Array.from({ length: Math.max(total, 1) }, (_, i) => i + 1);
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this._configurarMathField();
  }

  ngOnDestroy(): void {
    this._mathFieldConfigurado = false;
  }

  public configurarMathFieldPublico(): void {
    this._mathFieldConfigurado = false;
    this._configurarMathField();
  }

  private _configurarMathField(): void {
    setTimeout(() => {
      const mf = this.mathFieldComposer?.nativeElement;
      if (!mf || this._mathFieldConfigurado) return;

      mf.mathVirtualKeyboardPolicy = 'manual';
      mf.style.setProperty('--_text-font-family', 'var(--font-serif)');

      mf.addEventListener('input', () => {
        if (this._sincronizandoCompositor) return;
        this.compositorLatex = mf.value;
      });

      mf.addEventListener('keydown', (event: KeyboardEvent) => {
        if (this.tratarKeyDownMatematica(event)) {
          event.preventDefault();
          event.stopPropagation();
        }
      }, { capture: true });

      this._mathFieldConfigurado = true;
    }, 100);
  }

  public selecionarAba(id: string): void {
    this.abaCompositorAtiva = id;
  }

  public inserirNoCompositor(latex: string): void {
    const mf = this.mathFieldComposer?.nativeElement;
    if (!mf) return;
    mf.executeCommand(['insert', latex, { feedback: true }]);
    mf.focus();
    this.compositorLatex = mf.value;
  }

  public limparCompositor(): void {
    const mf = this.mathFieldComposer?.nativeElement;
    if (mf) {
      mf.value = '';
      this.compositorLatex = '';
      MathfieldElement.playSound('delete');
      mf.focus();
    }
  }

  public fecharAlertaErro(): void {
    this.erroUpload = '';
  }

  public focarTextareaMatematica(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.editor-gutter')) {
      this.textareaMatematica?.nativeElement.focus();
    }
  }

  public tratarKeydown(event: KeyboardEvent): void {
    if (this.tratarKeyDownMatematica(event)) {
      return;
    }
    if (event.key === 'Tab') {
      event.preventDefault();
      const el = event.target as HTMLTextAreaElement;
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const espacos = '  ';

      const atual = el.value;
      const novoTexto = atual.substring(0, start) + espacos + atual.substring(end);
      this.conteudo = novoTexto;
      this.conteudoChange.emit(novoTexto);

      setTimeout(() => {
        el.selectionStart = el.selectionEnd = start + espacos.length;
        this.onInteracaoTextareaMatematica();
      }, 0);
    }
  }

  public tratarKeyDownMatematica(event: KeyboardEvent): boolean {
    const isCtrlOrCmd = event.ctrlKey || event.metaKey;
    const isAlt = event.altKey;
    const isDown = event.key === 'ArrowDown' || event.code === 'ArrowDown';
    const isUp = event.key === 'ArrowUp' || event.code === 'ArrowUp';

    if (isCtrlOrCmd && !isAlt && isDown) {
      event.preventDefault();
      event.stopPropagation();
      this.descerLinhaAtiva();
      return true;
    }

    if (isCtrlOrCmd && !isAlt && isUp) {
      event.preventDefault();
      event.stopPropagation();
      this.subirLinhaAtiva();
      return true;
    }

    if (isAlt && !isCtrlOrCmd && isUp) {
      event.preventDefault();
      event.stopPropagation();
      this.aplicarCompositorComoInline();
      return true;
    }

    if (isAlt && !isCtrlOrCmd && isDown) {
      event.preventDefault();
      event.stopPropagation();
      this.aplicarCompositorComoBloco();
      return true;
    }

    return false;
  }

  public descerLinhaAtiva(): void {
    const linhas = this.conteudo.split('\n');
    const proximaLinha = this.linhaAtiva + 1;
    if (proximaLinha > linhas.length) return;
    this.navegarParaLinha(proximaLinha);
  }

  public subirLinhaAtiva(): void {
    const proximaLinha = Math.max(1, this.linhaAtiva - 1);
    this.navegarParaLinha(proximaLinha);
  }

  public extrairExpressaoParaCompositor(linha: string): string {
    const trim = linha.trim();
    if (trim.startsWith('$$') && trim.endsWith('$$') && trim.length >= 4) {
      return trim.slice(2, -2).trim();
    }
    if (trim.startsWith('$') && trim.endsWith('$') && trim.length >= 2) {
      return trim.slice(1, -1).trim();
    }
    const match = trim.match(/\$(.+?)\$/);
    if (match) {
      return match[1].trim();
    }
    return '';
  }

  public carregarLinhaNoCompositor(conteudoLinha: string): void {
    const expr = this.extrairExpressaoParaCompositor(conteudoLinha);
    this.compositorLatex = expr;
    const mf = this.mathFieldComposer?.nativeElement;
    if (mf) {
      this._sincronizandoCompositor = true;
      try {
        mf.value = expr;
      } finally {
        setTimeout(() => {
          this._sincronizandoCompositor = false;
        }, 50);
      }
    }
  }

  public obterLatexDoCompositor(): string {
    const mf = this.mathFieldComposer?.nativeElement;
    let val = (mf?.value ?? this.compositorLatex ?? '').trim();
    if (!val) {
      const linhas = this.conteudo.split('\n');
      const linha = linhas[this.linhaAtiva - 1] || '';
      val = this.extrairExpressaoParaCompositor(linha);
    }
    return val.replace(/\$/g, '').trim();
  }

  public aplicarCompositorComoInline(): void {
    const latex = this.obterLatexDoCompositor();
    if (!latex) return;
    const formato = `$${latex}$`;
    const linhas = this.conteudo.split('\n');
    const idx = this.linhaAtiva - 1;
    const linhaAtual = (linhas[idx] || '').trim();

    if (linhaAtual === '' || (linhaAtual.startsWith('$') && linhaAtual.endsWith('$') && !linhaAtual.startsWith('$$'))) {
      this.inserirOuAtualizarLinhaAtiva(formato);
    } else {
      this.inserirTextoNoCursor(` ${formato} `);
    }
    MathfieldElement.playSound('keypress');
  }

  public aplicarCompositorComoBloco(): void {
    const latex = this.obterLatexDoCompositor();
    if (!latex) return;
    const formato = `$$\n${latex}\n$$`;
    const linhas = this.conteudo.split('\n');
    const idx = this.linhaAtiva - 1;
    const linhaAtual = (linhas[idx] || '').trim();

    if (linhaAtual === '' || (linhaAtual.startsWith('$$') && linhaAtual.endsWith('$$'))) {
      this.inserirOuAtualizarLinhaAtiva(formato);
    } else {
      this.inserirTextoNoCursor(`\n${formato}\n`);
    }
    MathfieldElement.playSound('keypress');
  }

  public aplicarCompositorNaLinhaAtual(tipo: 'inline' | 'bloco'): void {
    if (tipo === 'inline') {
      this.aplicarCompositorComoInline();
    } else {
      this.aplicarCompositorComoBloco();
    }
  }

  public inserirOuAtualizarLinhaAtiva(conteudoFormatado: string): void {
    let linhas = this.conteudo.split('\n');
    const idx = this.linhaAtiva - 1;

    while (linhas.length <= idx) {
      linhas.push('');
    }

    linhas[idx] = conteudoFormatado;
    this.conteudo = linhas.join('\n');
    this.conteudoChange.emit(this.conteudo);

    const el = this.textareaMatematica?.nativeElement;
    const mf = this.mathFieldComposer?.nativeElement;
    const focoNoCompositor = mf && (document.activeElement === mf || mf.contains(document.activeElement));

    if (el) {
      let pos = 0;
      for (let i = 0; i < idx; i++) {
        pos += linhas[i].length + 1;
      }
      pos += conteudoFormatado.length;
      setTimeout(() => {
        if (!focoNoCompositor) {
          el.focus();
        }
        el.setSelectionRange(pos, pos);
      }, 0);
    }
  }

  public inserirTextoNoCursor(texto: string): void {
    const el = this.textareaMatematica?.nativeElement;
    if (!el) {
      this.conteudo += texto;
      this.conteudoChange.emit(this.conteudo);
      return;
    }

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const atual = el.value;

    const novoTexto = atual.substring(0, start) + texto + atual.substring(end);
    this.conteudo = novoTexto;
    this.conteudoChange.emit(novoTexto);

    setTimeout(() => {
      el.focus();
      const novaPos = start + texto.length;
      el.setSelectionRange(novaPos, novaPos);
      this.onInteracaoTextareaMatematica();
    }, 0);
  }

  public calcularLinhaCursor(texto: string, posCursor: number): number {
    const trechoAteCursor = texto.substring(0, posCursor);
    return (trechoAteCursor.match(/\n/g) || []).length + 1;
  }

  public navegarParaLinha(indiceAlvo: number): void {
    const el = this.textareaMatematica?.nativeElement;
    const linhas = this.conteudo.split('\n');

    indiceAlvo = Math.min(Math.max(indiceAlvo, 1), linhas.length);

    this._definirLinhaAtiva(indiceAlvo, linhas[indiceAlvo - 1] ?? '');
    this.linhaAlterada.emit(indiceAlvo);

    let pos = 0;
    for (let i = 0; i < indiceAlvo - 1; i++) {
      pos += linhas[i].length + 1;
    }

    const mf = this.mathFieldComposer?.nativeElement;
    const focoNoCompositor = mf && (document.activeElement === mf || mf.contains(document.activeElement));

    if (el) {
      if (!focoNoCompositor) {
        el.focus();
      }
      el.setSelectionRange(pos, pos);
      this._manterLinhaVisivel(indiceAlvo);
    }
    MathfieldElement.playSound('keypress');
  }

  private _definirLinhaAtiva(linha: number, conteudoLinha: string): void {
    if (this.linhaAtiva === linha) return;
    this.linhaAtiva = linha;
    if (this.extrairExpressaoParaCompositor(conteudoLinha)) {
      this.carregarLinhaNoCompositor(conteudoLinha);
    }
  }

  public onConteudoChange(novoTexto: string): void {
    this.conteudo = novoTexto;
    this.conteudoChange.emit(novoTexto);
    const el = this.textareaMatematica?.nativeElement;
    if (el) {
      const pos = el.selectionStart ?? 0;
      const linha = this.calcularLinhaCursor(novoTexto, pos);
      this._definirLinhaAtiva(linha, novoTexto.split('\n')[linha - 1] ?? '');
      this.cursorAlterado.emit(pos);
    }
  }

  public onInteracaoTextareaMatematica(): void {
    const el = this.textareaMatematica?.nativeElement;
    if (!el) return;
    const pos = el.selectionStart ?? 0;
    const linha = this.calcularLinhaCursor(el.value, pos);
    this._definirLinhaAtiva(linha, el.value.split('\n')[linha - 1] ?? '');
    this.cursorAlterado.emit(pos);
  }

  private _manterLinhaVisivel(linha: number): void {
    const el = this.textareaMatematica?.nativeElement;
    if (!el) return;
    const linhaTop = (linha - 1) * this.alturaLinhaPx;
    const linhaBottom = linhaTop + this.alturaLinhaPx;
    const visivelTop = el.scrollTop;
    const visivelBottom = el.scrollTop + el.clientHeight - (this.paddingTopoPx * 2);

    if (linhaTop < visivelTop) {
      el.scrollTop = linhaTop;
    } else if (linhaBottom > visivelBottom) {
      el.scrollTop = linhaBottom - el.clientHeight + (this.paddingTopoPx * 2);
    }
    this.scrollMatematicaTop.set(el.scrollTop);
    const gutter = this.gutterMatematica?.nativeElement;
    if (gutter) {
      gutter.scrollTop = el.scrollTop;
    }
  }

  public sincronizarScroll(origem: HTMLTextAreaElement, gutter: HTMLElement): void {
    gutter.scrollTop = origem.scrollTop;
    this.scrollMatematicaTop.set(origem.scrollTop);
  }

  public inserirFormatacao(tipo: string): void {
    const el = this.textareaMatematica?.nativeElement;
    if (!el) return;

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const atual = el.value;
    const selecionado = atual.substring(start, end);

    let prefixo = '';
    let sufixo = '';
    let textoPadrao = '';

    switch (tipo) {
      case 'h2':
        prefixo = '\n## ';
        textoPadrao = selecionado || 'Subtítulo da Seção';
        sufixo = '\n';
        break;
      case 'bold':
        prefixo = '**';
        textoPadrao = selecionado || 'texto em negrito';
        sufixo = '**';
        break;
      case 'italic':
        prefixo = '*';
        textoPadrao = selecionado || 'texto em itálico';
        sufixo = '*';
        break;
      case 'lista':
        prefixo = '\n- ';
        textoPadrao = selecionado || 'Item da lista';
        sufixo = '\n';
        break;
      case 'citacao':
        prefixo = '\n> ';
        textoPadrao = selecionado || 'Observação ou teorema...';
        sufixo = '\n';
        break;
      case 'math-inline':
        prefixo = '$';
        textoPadrao = selecionado || 'f(x) = x^2';
        sufixo = '$';
        break;
      case 'math-bloco':
        prefixo = '\n$$\n';
        textoPadrao = selecionado || '\\int_{0}^{1} x \\, dx = \\frac{1}{2}';
        sufixo = '\n$$\n';
        break;
    }

    const novoConteudo = atual.substring(0, start) + prefixo + textoPadrao + sufixo + atual.substring(end);
    this.conteudo = novoConteudo;
    this.conteudoChange.emit(novoConteudo);

    setTimeout(() => {
      el.focus();
      const novoStart = start + prefixo.length;
      const novoEnd = novoStart + textoPadrao.length;
      el.setSelectionRange(novoStart, novoEnd);
      this.onInteracaoTextareaMatematica();
    }, 0);
  }

  public acionarSelecaoImagem(): void {
    this.inputArquivoImagem?.nativeElement.click();
  }

  public onArquivoSelecionado(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.fazerUploadImagem(file);
      input.value = '';
    }
  }

  public onPasteEditor(event: ClipboardEvent): void {
    const items = event.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf('image') !== -1) {
        event.preventDefault();
        const file = item.getAsFile();
        if (file) {
          this.fazerUploadImagem(file);
        }
        return;
      }
    }
  }

  public onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = true;
  }

  public onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = false;
  }

  public onDropEditor(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        this.fazerUploadImagem(file);
      }
    }
  }

  public fazerUploadImagem(file: File): void {
    if (!file.type.startsWith('image/')) {
      this.erroUpload = 'Apenas arquivos de imagem sao permitidos.';
      return;
    }

    this.uploadingImagem = true;
    this.erroUpload = '';

    const placeholder = `\n![Carregando: ${file.name}...]()\n`;
    this.inserirTextoNoCursor(placeholder);

    const formData = new FormData();
    formData.append('file', file);

    this.http.post<{ imageUrl: string }>('/api/midia/upload', formData).subscribe({
      next: (res) => {
        this.uploadingImagem = false;
        const nomeLimpo = file.name.replace(/\.[^/.]+$/, '');
        const markdownImagem = `\n![${nomeLimpo}](${res.imageUrl})\n`;
        this.conteudo = this.conteudo.replace(placeholder, markdownImagem);
        this.conteudoChange.emit(this.conteudo);
      },
      error: (err) => {
        this.uploadingImagem = false;
        const msg = err?.error?.erro || 'Falha ao processar upload da imagem.';
        this.erroUpload = msg;
        this.conteudo = this.conteudo.replace(placeholder, `\n> Falha ao carregar imagem: ${file.name}\n`);
        this.conteudoChange.emit(this.conteudo);
      }
    });
  }
}
