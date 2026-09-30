import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  EventEmitter,
  HostListener,
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
import { Questao, getDificuldadeClasse, getDificuldadeTexto } from '../../../models/questao.model';
import { KatexDirective } from '../../../directives/katex.directive';

import 'mathlive';
import { MathfieldElement } from 'mathlive';

// Configura o carregamento de fontes e sons oficiais do MathLive via CDN (evita 404 no Vite em dev)
MathfieldElement.fontsDirectory = '//unpkg.com/mathlive/dist/fonts/';
MathfieldElement.soundsDirectory = '//unpkg.com/mathlive/sounds';

import * as Prism from 'prismjs';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-go';

export interface RespostaEditorFullscreen {
  conteudo: string;
  trechoCodigo?: string;
  linguagemCodigo?: string;
}

@Component({
  selector: 'app-editor-fullscreen',
  standalone: true,
  imports: [CommonModule, FormsModule, KatexDirective],
  templateUrl: './editor-fullscreen.component.html',
  styleUrl: './editor-fullscreen.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class EditorFullscreenComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input({ required: true }) questao!: Questao;
  @Input() conteudoInicial: string = '';
  @Input() codigoInicial: string = '';
  @Input() linguagemInicial: string = 'java';

  @Output() fechar = new EventEmitter<RespostaEditorFullscreen>();
  @Output() publicar = new EventEmitter<RespostaEditorFullscreen>();

  @ViewChild('textareaMatematica') textareaMatematica?: ElementRef<HTMLTextAreaElement>;
  @ViewChild('textareaCodigo') textareaCodigo?: ElementRef<HTMLTextAreaElement>;
  @ViewChild('mathFieldComposer') mathFieldComposer?: ElementRef<MathfieldElement>;
  @ViewChild('gutterMatematica') gutterMatematica?: ElementRef<HTMLElement>;
  @ViewChild('inputArquivoImagem') inputArquivoImagem?: ElementRef<HTMLInputElement>;

  private readonly http = inject(HttpClient);

  public readonly getDificuldadeTexto = getDificuldadeTexto;
  public readonly getDificuldadeClasse = getDificuldadeClasse;

  // Modos de Edição
  public modoAtivo = signal<'MATEMATICA' | 'ALGORITMO'>('MATEMATICA');

  // Modo de Visualização do Preview: Documento Paginado x Página Corrida
  public modoVisualizacao = signal<'DOCUMENTO' | 'CORRIDO'>('DOCUMENTO');
  public paginaAtualIndex = signal<number>(0);
  public uploadingImagem = signal<boolean>(false);
  public erroUpload = signal<string>('');
  public dragOver = signal<boolean>(false);

  // Estados dos Conteúdos
  public conteudo = signal<string>('');
  public trechoCodigo = signal<string>('');
  public linguagemCodigo = signal<string>('java');

  // Divisão do documento em páginas com base no delimitador <!-- pagebreak -->
  public paginas = computed(() => {
    const raw = this.conteudo();
    if (!raw || !raw.trim()) {
      return [''];
    }
    const partes = raw.split(/<!--\s*pagebreak\s*-->/gi);
    return partes.length > 0 ? partes : [''];
  });

  public totalPaginas = computed(() => this.paginas().length);

  public conteudoPaginaAtiva = computed(() => {
    const pags = this.paginas();
    const idx = Math.min(Math.max(this.paginaAtualIndex(), 0), pags.length - 1);
    return pags[idx] || '';
  });

  // Contadores de linhas reativos para régua de IDE
  public linhasMatematica = computed(() => {
    const total = (this.conteudo().match(/\n/g) || []).length + 1;
    return Array.from({ length: Math.max(total, 1) }, (_, i) => i + 1);
  });

  public linhasCodigo = computed(() => {
    const total = (this.trechoCodigo().match(/\n/g) || []).length + 1;
    return Array.from({ length: Math.max(total, 1) }, (_, i) => i + 1);
  });

  // Compositor MathLive (sempre ativo no modo matemática)
  public compositorLatex = signal<string>('');
  private _mathFieldConfigurado = false;
  private _sincronizandoCompositor = false;

  // Linha Ativa e Posicionamento do Destaque
  public linhaAtiva = signal<number>(1);
  public scrollMatematicaTop = signal<number>(0);

  public readonly alturaLinhaPx = 24;
  public readonly paddingTopoPx = 14;

  public posicaoTopLinhaAtiva = computed(() => {
    return this.paddingTopoPx + (this.linhaAtiva() - 1) * this.alturaLinhaPx - this.scrollMatematicaTop();
  });

  // Abas do compositor
  public readonly abasCompositor = [
    { id: 'basico', rotulo: 'Básico', icone: '∑' },
    { id: 'calculo', rotulo: 'Cálculo', icone: '∫' },
    { id: 'gregas', rotulo: 'Letras Gregas', icone: 'α' },
    { id: 'matrizes', rotulo: 'Matrizes', icone: '⊞' }
  ] as const;
  public abaCompositorAtiva = signal<string>('basico');

  // Drawer de Enunciado
  public enunciadoAberto = signal<boolean>(false);

  // Estado de Submissão
  public submetendo = signal<boolean>(false);

  // Lista de linguagens suportadas
  public readonly linguagens = [
    { valor: 'java', rotulo: 'Java' },
    { valor: 'python', rotulo: 'Python' },
    { valor: 'cpp', rotulo: 'C++' },
    { valor: 'csharp', rotulo: 'C#' },
    { valor: 'c', rotulo: 'C' },
    { valor: 'javascript', rotulo: 'JavaScript' },
    { valor: 'typescript', rotulo: 'TypeScript' },
    { valor: 'sql', rotulo: 'SQL' },
    { valor: 'rust', rotulo: 'Rust' },
    { valor: 'go', rotulo: 'Go' }
  ];

  // Atalhos Matemáticos categorizados
  public readonly simbolosCalculo = [
    { rotulo: 'a/b', latex: '\\frac{a}{b}', dica: 'Fração' },
    { rotulo: '√x', latex: '\\sqrt{x}', dica: 'Raiz quadrada' },
    { rotulo: 'lim', latex: '\\lim_{x \\to 0}', dica: 'Limite' },
    { rotulo: '∫', latex: '\\int_{a}^{b} f(x) \\, dx', dica: 'Integral definida' },
    { rotulo: '∑', latex: '\\sum_{i=1}^{n}', dica: 'Somatório' },
    { rotulo: '∂f/∂x', latex: '\\frac{\\partial f}{\\partial x}', dica: 'Derivada parcial' },
    { rotulo: 'df/dx', latex: '\\frac{df}{dx}', dica: 'Derivada ordinária' }
  ];

  public readonly simbolosOperadores = [
    { rotulo: '∞', latex: '\\infty', dica: 'Infinito' },
    { rotulo: '±', latex: '\\pm', dica: 'Mais ou menos' },
    { rotulo: '≠', latex: '\\neq', dica: 'Diferente' },
    { rotulo: '≤', latex: '\\le', dica: 'Menor ou igual' },
    { rotulo: '≥', latex: '\\ge', dica: 'Maior ou igual' },
    { rotulo: '≈', latex: '\\approx', dica: 'Aproximadamente' },
    { rotulo: '×', latex: '\\times', dica: 'Multiplicação' },
    { rotulo: '⋅', latex: '\\cdot', dica: 'Ponto produto' },
    { rotulo: '∈', latex: '\\in', dica: 'Pertence' },
    { rotulo: '∇', latex: '\\nabla', dica: 'Nabla / Gradiente' }
  ];

  public readonly simbolosGregos = [
    { rotulo: 'α', latex: '\\alpha' },
    { rotulo: 'β', latex: '\\beta' },
    { rotulo: 'θ', latex: '\\theta' },
    { rotulo: 'π', latex: '\\pi' },
    { rotulo: 'λ', latex: '\\lambda' },
    { rotulo: 'σ', latex: '\\sigma' },
    { rotulo: 'ω', latex: '\\omega' },
    { rotulo: 'Δ', latex: '\\Delta' }
  ];

  public readonly simbolosMatrizes = [
    { rotulo: 'Matriz 2x2', latex: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}', dica: 'Matriz 2x2' },
    { rotulo: 'Vetor', latex: '\\vec{v} = \\begin{pmatrix} x \\\\ y \\end{pmatrix}', dica: 'Vetor coluna' },
    { rotulo: 'Equação em Bloco', latex: '$$\nf(x) = ...\n$$', dica: 'Equação destacada' }
  ];

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

  // Placeholders seguros com caracteres {}
  public readonly placeholderMatematica = `Digite sua demonstração passo a passo...

Use $fórmula$ para equações na linha e $$fórmula$$ para equações em bloco.
Exemplo:
Seja a integral:
$$\\int_{0}^{\\infty} e^{-x^2} \\, dx = \\frac{\\sqrt{\\pi}}{2}$$`;

  public readonly placeholderCodigo = `// Escreva aqui o algoritmo ou solução computacional...
// Pressione Tab normalmente para indentação.

public class Solucao {
    public static void main(String[] args) {
        System.out.println("Demonstração");
    }
}`;

  // Estatísticas computadas
  public totalCaracteres = computed(() => this.conteudo().length + this.trechoCodigo().length);
  public totalLinhas = computed(() => {
    const texto = this.modoAtivo() === 'MATEMATICA' ? this.conteudo() : this.trechoCodigo();
    return texto ? texto.split('\n').length : 0;
  });

  // Código com syntax highlighting via PrismJS
  public codigoDestacado = computed(() => {
    const code = this.trechoCodigo();
    const lang = this.linguagemCodigo();
    if (!code) return '';

    try {
      const grammar = Prism.languages[lang] || Prism.languages['clike'] || Prism.languages['javascript'];
      return Prism.highlight(code, grammar, lang);
    } catch {
      return code;
    }
  });

  ngOnInit(): void {
    if (this.conteudoInicial) {
      this.conteudo.set(this.conteudoInicial);
    }
    if (this.codigoInicial) {
      this.trechoCodigo.set(this.codigoInicial);
    }
    if (this.linguagemInicial) {
      this.linguagemCodigo.set(this.linguagemInicial);
    } else if (this.questao?.linguagemCodigo) {
      this.linguagemCodigo.set(this.questao.linguagemCodigo);
    }

    // Se a questão já tiver trecho de código ou linguagem especificada, inicia no modo ALGORITMO
    if (this.codigoInicial || this.questao?.trechoCodigo || this.questao?.linguagemCodigo) {
      this.modoAtivo.set('ALGORITMO');
    }
  }

  ngAfterViewInit(): void {
    this._configurarMathField();
  }

  ngOnDestroy(): void {
    this._mathFieldConfigurado = false;
  }

  private _configurarMathField(): void {
    // Aguarda o DOM renderizar o math-field (pode não existir se modo ALGORITMO)
    setTimeout(() => {
      const mf = this.mathFieldComposer?.nativeElement;
      if (!mf || this._mathFieldConfigurado) return;

      // Desabilita o teclado virtual nativo do MathLive (usamos nossas próprias abas)
      mf.mathVirtualKeyboardPolicy = 'manual';

      // Tema escuro via propriedades inline (complementa o CSS)
      mf.style.setProperty('--_text-font-family', 'var(--font-serif)');

      mf.addEventListener('input', () => {
        if (this._sincronizandoCompositor) return;
        const val = mf.value;
        this.compositorLatex.set(val);
        this.atualizarLinhaAtivaEmTempoReal(val);
      });

      // Intercepta atalhos globais também a partir do mathfield
      mf.addEventListener('keydown', (event: KeyboardEvent) => {
        if (this.tratarKeyDownMatematica(event)) {
          event.preventDefault();
          event.stopPropagation();
        }
      }, { capture: true });

      this._mathFieldConfigurado = true;

      // Inicializa com a expressão da linha ativa
      const linhas = this.conteudo().split('\n');
      if (linhas.length > 0) {
        this.carregarLinhaNoCompositor(linhas[this.linhaAtiva() - 1] || '');
      }
    }, 100);
  }

  public alternarModo(novoModo: 'MATEMATICA' | 'ALGORITMO'): void {
    this.modoAtivo.set(novoModo);
    if (novoModo === 'MATEMATICA') {
      // Reconfigura o math-field quando volta ao modo matemática
      this._mathFieldConfigurado = false;
      this._configurarMathField();
    }
  }

  public toggleEnunciado(): void {
    this.enunciadoAberto.update(aberto => !aberto);
  }

  public inserirDoCompositor(): void {
    this.aplicarCompositorComoInline();
  }

  public inserirDoCompositorBloco(): void {
    this.aplicarCompositorComoBloco();
  }

  public inserirNoCompositor(latex: string): void {
    const mf = this.mathFieldComposer?.nativeElement;
    if (!mf) return;
    mf.executeCommand(['insert', latex, { feedback: true }]);
    mf.focus();
    const val = mf.value;
    this.compositorLatex.set(val);
    this.atualizarLinhaAtivaEmTempoReal(val);
  }

  public limparCompositor(): void {
    const mf = this.mathFieldComposer?.nativeElement;
    if (mf) {
      mf.value = '';
      this.compositorLatex.set('');
      this.atualizarLinhaAtivaEmTempoReal('');
      MathfieldElement.playSound('delete');
      mf.focus();
    }
  }

  public inserirCasesNoCompositor(): void {
    this.inserirNoCompositor('\\begin{cases} #0 & \\text{se } #0 \\\\ #0 & \\text{se } #0 \\end{cases}');
  }

  public inserirSimbolo(simbolo: string): void {
    const el = this.textareaMatematica?.nativeElement;
    if (!el) {
      this.conteudo.update(txt => txt + ' ' + simbolo);
      return;
    }

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const atual = el.value;

    const novoTexto = atual.substring(0, start) + simbolo + atual.substring(end);
    this.conteudo.set(novoTexto);

    // Reposiciona o cursor após a inserção e mantém o foco
    setTimeout(() => {
      el.focus();
      const novoPos = start + simbolo.length;
      el.setSelectionRange(novoPos, novoPos);
    }, 0);
  }

  // =========================================================================
  // GESTÃO DE DOCUMENTO, PÁGINAS E UPLOAD DE IMAGENS
  // =========================================================================

  public alternarModoVisualizacao(modo: 'DOCUMENTO' | 'CORRIDO'): void {
    this.modoVisualizacao.set(modo);
  }

  public proximaPagina(): void {
    if (this.paginaAtualIndex() < this.totalPaginas() - 1) {
      this.paginaAtualIndex.update(i => i + 1);
    }
  }

  public paginaAnterior(): void {
    if (this.paginaAtualIndex() > 0) {
      this.paginaAtualIndex.update(i => i - 1);
    }
  }

  public irParaPagina(index: number): void {
    if (index >= 0 && index < this.totalPaginas()) {
      this.paginaAtualIndex.set(index);
    }
  }

  public inserirQuebraPagina(): void {
    const delimitador = '\n\n<!-- pagebreak -->\n\n';
    this.inserirTextoNoCursor(delimitador);
    setTimeout(() => {
      this.paginaAtualIndex.set(this.totalPaginas() - 1);
    }, 50);
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
    this.dragOver.set(true);
  }

  public onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver.set(false);
  }

  public onDropEditor(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver.set(false);

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
      this.erroUpload.set('Apenas arquivos de imagem sao permitidos.');
      return;
    }

    this.uploadingImagem.set(true);
    this.erroUpload.set('');

    const placeholder = `\n![Carregando: ${file.name}...]()\n`;
    this.inserirTextoNoCursor(placeholder);

    const formData = new FormData();
    formData.append('file', file);

    this.http.post<{ imageUrl: string }>('/api/midia/upload', formData).subscribe({
      next: (res) => {
        this.uploadingImagem.set(false);
        const nomeLimpo = file.name.replace(/\.[^/.]+$/, '');
        const markdownImagem = `\n![${nomeLimpo}](${res.imageUrl})\n`;
        this.conteudo.update(txt => txt.replace(placeholder, markdownImagem));
      },
      error: (err) => {
        this.uploadingImagem.set(false);
        const msg = err?.error?.erro || 'Falha ao processar upload da imagem.';
        this.erroUpload.set(msg);
        this.conteudo.update(txt => txt.replace(placeholder, `\n> Falha ao carregar imagem: ${file.name}\n`));
      }
    });
  }

  public inserirTextoNoCursor(texto: string): void {
    const el = this.textareaMatematica?.nativeElement;
    if (!el) {
      this.conteudo.update(txt => txt + texto);
      return;
    }

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const atual = el.value;

    const novoTexto = atual.substring(0, start) + texto + atual.substring(end);
    this.conteudo.set(novoTexto);

    setTimeout(() => {
      el.focus();
      const novoPos = start + texto.length;
      el.setSelectionRange(novoPos, novoPos);
    }, 0);
  }

  // =========================================================================
  // GESTÃO DE LINHAS, CURSOR E NAVEGAÇÃO INTERLIGADA COM O COMPOSITOR
  // =========================================================================

  /**
   * Captura os atalhos de navegação e inserção a nível global da janela,
   * garantindo funcionamento imediato quer o foco esteja no textarea, no compositor ou botões.
   */
  @HostListener('window:keydown', ['$event'])
  public onWindowKeyDown(event: KeyboardEvent): void {
    if (this.modoAtivo() !== 'MATEMATICA') return;
    this.tratarKeyDownMatematica(event);
  }

  /**
   * Processa os atalhos de teclado principais:
   * - Ctrl + Seta Baixo: Desce linha ativa e carrega no compositor
   * - Ctrl + Seta Cima: Sobe linha ativa e carrega no compositor
   * - Alt + Seta Cima: Pega conteúdo do compositor e insere como inline ($...$) na linha ativa
   * - Alt + Seta Baixo: Pega conteúdo do compositor e insere como bloco ($$...$$) na linha ativa
   */
  public tratarKeyDownMatematica(event: KeyboardEvent): boolean {
    if (this.modoAtivo() !== 'MATEMATICA') return false;

    const isCtrlOrCmd = event.ctrlKey || event.metaKey;
    const isAlt = event.altKey;
    const isDown = event.key === 'ArrowDown' || event.code === 'ArrowDown';
    const isUp = event.key === 'ArrowUp' || event.code === 'ArrowUp';

    // Ctrl + Seta para Baixo -> linha inferior
    if (isCtrlOrCmd && !isAlt && isDown) {
      event.preventDefault();
      event.stopPropagation();
      this.descerLinhaAtiva();
      return true;
    }

    // Ctrl + Seta para Cima -> linha superior
    if (isCtrlOrCmd && !isAlt && isUp) {
      event.preventDefault();
      event.stopPropagation();
      this.subirLinhaAtiva();
      return true;
    }

    // Alt + Seta para Cima -> insere/transforma linha como inline ($...$) com conteúdo do compositor
    if (isAlt && !isCtrlOrCmd && isUp) {
      event.preventDefault();
      event.stopPropagation();
      this.aplicarCompositorComoInline();
      return true;
    }

    // Alt + Seta para Baixo -> insere/transforma linha como bloco ($$...$$) com conteúdo do compositor
    if (isAlt && !isCtrlOrCmd && isDown) {
      event.preventDefault();
      event.stopPropagation();
      this.aplicarCompositorComoBloco();
      return true;
    }

    return false;
  }

  public descerLinhaAtiva(): void {
    const texto = this.conteudo();
    let linhas = texto.split('\n');
    const proximaLinha = this.linhaAtiva() + 1;

    // Se estiver na última linha, cria uma nova linha vazia para continuar a demonstração
    if (proximaLinha > linhas.length) {
      linhas.push('');
      this.conteudo.set(linhas.join('\n'));
    }

    this.navegarParaLinha(proximaLinha);
  }

  public subirLinhaAtiva(): void {
    const proximaLinha = Math.max(1, this.linhaAtiva() - 1);
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
    return trim.replace(/\$/g, '').trim();
  }

  public carregarLinhaNoCompositor(conteudoLinha: string): void {
    const expr = this.extrairExpressaoParaCompositor(conteudoLinha);
    this.compositorLatex.set(expr);
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
    let val = (mf?.value ?? this.compositorLatex() ?? '').trim();
    if (!val) {
      const linhas = this.conteudo().split('\n');
      const linha = linhas[this.linhaAtiva() - 1] || '';
      val = this.extrairExpressaoParaCompositor(linha);
    }
    return val.replace(/\$/g, '').trim();
  }

  public aplicarCompositorComoInline(): void {
    const latex = this.obterLatexDoCompositor();
    const formato = latex ? `$${latex}$` : '$ $';
    this.inserirOuAtualizarLinhaAtiva(formato);
    this.carregarLinhaNoCompositor(formato);
    MathfieldElement.playSound('keypress');
  }

  public aplicarCompositorComoBloco(): void {
    const latex = this.obterLatexDoCompositor();
    const formato = latex ? `$$${latex}$$` : '$$ $$';
    this.inserirOuAtualizarLinhaAtiva(formato);
    this.carregarLinhaNoCompositor(formato);
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
    let linhas = this.conteudo().split('\n');
    const idx = this.linhaAtiva() - 1;

    while (linhas.length <= idx) {
      linhas.push('');
    }

    linhas[idx] = conteudoFormatado;
    this.conteudo.set(linhas.join('\n'));

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

  /**
   * Reflete em tempo real qualquer alteração feita no compositor diretamente
   * na linha destacada do textarea, preservando o formato (bloco ou inline).
   */
  public atualizarLinhaAtivaEmTempoReal(latexCru: string): void {
    const limpo = latexCru.replace(/\$/g, '').trim();
    let linhas = this.conteudo().split('\n');
    const idx = this.linhaAtiva() - 1;
    if (idx < 0) return;

    while (linhas.length <= idx) {
      linhas.push('');
    }

    const linhaAtual = linhas[idx].trim();
    let novaLinha: string;

    if (!limpo) {
      novaLinha = '';
    } else if (linhaAtual.startsWith('$$') && linhaAtual.endsWith('$$')) {
      novaLinha = `$$${limpo}$$`;
    } else if (linhaAtual.startsWith('$') && linhaAtual.endsWith('$')) {
      novaLinha = `$${limpo}$`;
    } else if (linhaAtual === '') {
      novaLinha = `$${limpo}$`;
    } else if (/\$(.+?)\$/.test(linhaAtual)) {
      novaLinha = linhaAtual.replace(/\$(.+?)\$/, `$${limpo}$`);
    } else {
      novaLinha = `$${limpo}$`;
    }

    linhas[idx] = novaLinha;
    this.conteudo.set(linhas.join('\n'));
  }

  public calcularLinhaCursor(texto: string, posCursor: number): number {
    const trechoAteCursor = texto.substring(0, posCursor);
    return (trechoAteCursor.match(/\n/g) || []).length + 1;
  }

  public navegarParaLinha(indiceAlvo: number): void {
    const el = this.textareaMatematica?.nativeElement;
    let linhas = this.conteudo().split('\n');
    if (indiceAlvo < 1) indiceAlvo = 1;

    while (linhas.length < indiceAlvo) {
      linhas.push('');
      this.conteudo.set(linhas.join('\n'));
    }

    this.linhaAtiva.set(indiceAlvo);

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

    const conteudoLinha = linhas[indiceAlvo - 1] || '';
    this.carregarLinhaNoCompositor(conteudoLinha);
    MathfieldElement.playSound('keypress');
  }

  public onInteracaoTextareaMatematica(): void {
    const el = this.textareaMatematica?.nativeElement;
    if (!el) return;
    const linha = this.calcularLinhaCursor(el.value, el.selectionStart);
    if (linha !== this.linhaAtiva()) {
      this.linhaAtiva.set(linha);
      const linhas = this.conteudo().split('\n');
      const conteudoLinha = linhas[linha - 1] || '';
      this.carregarLinhaNoCompositor(conteudoLinha);
    }
  }

  public onInputTextareaMatematica(): void {
    const el = this.textareaMatematica?.nativeElement;
    if (!el) return;
    const linha = this.calcularLinhaCursor(el.value, el.selectionStart);
    this.linhaAtiva.set(linha);
    const linhas = this.conteudo().split('\n');
    const conteudoLinha = linhas[linha - 1] || '';
    const expr = this.extrairExpressaoParaCompositor(conteudoLinha);
    this.compositorLatex.set(expr);
    const mf = this.mathFieldComposer?.nativeElement;
    if (mf && mf.value !== expr) {
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

  public tratarTab(event: KeyboardEvent): void {
    if (event.key === 'Tab') {
      event.preventDefault();
      const el = event.target as HTMLTextAreaElement;
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const espacos = '  '; // 2 espaços de indentação

      const atual = el.value;
      const novoTexto = atual.substring(0, start) + espacos + atual.substring(end);
      this.trechoCodigo.set(novoTexto);

      setTimeout(() => {
        el.selectionStart = el.selectionEnd = start + espacos.length;
      }, 0);
    }
  }

  public sincronizarScroll(origem: HTMLTextAreaElement, gutter: HTMLElement): void {
    gutter.scrollTop = origem.scrollTop;
    this.scrollMatematicaTop.set(origem.scrollTop);
  }

  public minimizarEFechar(): void {
    this.fechar.emit({
      conteudo: this.conteudo(),
      trechoCodigo: this.trechoCodigo(),
      linguagemCodigo: this.linguagemCodigo()
    });
  }

  public submeter(): void {
    const cont = this.conteudo().trim();
    const cod = this.trechoCodigo().trim();

    // Se estiver no modo algoritmo e o usuário só escreveu código, geramos uma descrição padrão se vazia
    let conteudoFinal = cont;
    if (!conteudoFinal && cod) {
      conteudoFinal = `Resolução algorítmica implementada em ${this.linguagemCodigo().toUpperCase()}.`;
    }

    if (!conteudoFinal) {
      alert('Por favor, digite uma explicação teórica, demonstração matemática ou código para a resolução.');
      return;
    }

    this.submetendo.set(true);
    this.publicar.emit({
      conteudo: conteudoFinal,
      trechoCodigo: cod || undefined,
      linguagemCodigo: cod ? this.linguagemCodigo() : undefined
    });
  }
}
