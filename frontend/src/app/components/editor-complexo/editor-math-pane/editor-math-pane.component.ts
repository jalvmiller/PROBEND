import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
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

// Configura o carregamento de fontes e sons oficiais do MathLive via CDN
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
  @ViewChild('inputArquivoImagem') inputArquivoImagem?: ElementRef<HTMLInputElement>;

  private readonly http = inject(HttpClient);

  // Controle da gaveta do Teclado/Compositor MathLive
  public gavetaMathLiveAberta = signal<boolean>(false);
  public compositorLatex: string = '';
  private _mathFieldConfigurado = false;

  // Upload e drag & drop de imagens
  public uploadingImagem = false;
  public erroUpload = '';
  public dragOver = false;

  // Abas do compositor matemático
  public readonly abasCompositor = [
    { id: 'basico', rotulo: 'Básico', icone: '∑' },
    { id: 'calculo', rotulo: 'Cálculo', icone: '∫' },
    { id: 'gregas', rotulo: 'Letras Gregas', icone: 'α' },
    { id: 'matrizes', rotulo: 'Matrizes', icone: '⊞' }
  ] as const;
  public abaCompositorAtiva: string = 'basico';

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
    { visual: '∉', latex: '\\notin', dica: 'Não pertence' },
    { visual: '⊂', latex: '\\subset', dica: 'Subconjunto' },
    { visual: '∪', latex: '\\cup', dica: 'União' },
    { visual: '∩', latex: '\\cap', dica: 'Interseção' },
    { visual: '∀', latex: '\\forall', dica: 'Para todo' },
    { visual: '∃', latex: '\\exists', dica: 'Existe' },
    { visual: '⇒', latex: '\\implies', dica: 'Implica' },
    { visual: '⇔', latex: '\\iff', dica: 'Se e somente se' }
  ];

  public readonly teclasCalculo = [
    { visual: '∫ f(x) dx', latex: '\\int #0 \\, dx', dica: 'Integral indefinida', largo: true },
    { visual: '∫ₐᵇ f(x) dx', latex: '\\int_{#0}^{#0} #0 \\, dx', dica: 'Integral definida', largo: true },
    { visual: '∬', latex: '\\iint_{#0}', dica: 'Integral dupla' },
    { visual: '∭', latex: '\\iiint_{#0}', dica: 'Integral tripla' },
    { visual: '∮', latex: '\\oint_{#0}', dica: 'Integral de linha' },
    { visual: '∑ᵢ₌₁ⁿ', latex: '\\sum_{i=1}^{n} #0', dica: 'Somatório', largo: true },
    { visual: '∏ᵢ₌₁ⁿ', latex: '\\prod_{i=1}^{n} #0', dica: 'Produtório', largo: true },
    { visual: 'lim(x→x₀)', latex: '\\lim_{x \\to #0} #0', dica: 'Limite', largo: true },
    { visual: 'lim(x→∞)', latex: '\\lim_{x \\to \\infty} #0', dica: 'Limite no infinito', largo: true },
    { visual: 'df/dx', latex: '\\frac{df}{dx}', dica: 'Derivada simples' },
    { visual: 'd/dx', latex: '\\frac{d}{dx}\\left(#0\\right)', dica: 'Operador diferencial' },
    { visual: '∂f/∂x', latex: '\\frac{\\partial #0}{\\partial #0}', dica: 'Derivada parcial' },
    { visual: '∇', latex: '\\nabla', dica: 'Nabla / Gradiente' },
    { visual: '∇²', latex: '\\nabla^2', dica: 'Laplaciano' },
    { visual: 'f\'(x)', latex: 'f\'(#0)', dica: 'Linha (derivada)' },
    { visual: 'f\'\'(x)', latex: 'f\'\'(#0)', dica: 'Duas linhas' }
  ];

  public readonly teclasGregas = [
    { visual: 'α', latex: '\\alpha', dica: 'Alfa' },
    { visual: 'β', latex: '\\beta', dica: 'Beta' },
    { visual: 'γ', latex: '\\gamma', dica: 'Gama' },
    { visual: 'δ', latex: '\\delta', dica: 'Delta' },
    { visual: 'ε', latex: '\\varepsilon', dica: 'Épsilon' },
    { visual: 'ζ', latex: '\\zeta', dica: 'Zeta' },
    { visual: 'η', latex: '\\eta', dica: 'Eta' },
    { visual: 'θ', latex: '\\theta', dica: 'Teta' },
    { visual: 'ι', latex: '\\iota', dica: 'Iota' },
    { visual: 'κ', latex: '\\kappa', dica: 'Capa' },
    { visual: 'λ', latex: '\\lambda', dica: 'Lambda' },
    { visual: 'μ', latex: '\\mu', dica: 'Miu / Micro' },
    { visual: 'ν', latex: '\\nu', dica: 'Niu' },
    { visual: 'ξ', latex: '\\xi', dica: 'Csi' },
    { visual: 'π', latex: '\\pi', dica: 'Pi' },
    { visual: 'ρ', latex: '\\rho', dica: 'Rô' },
    { visual: 'σ', latex: '\\sigma', dica: 'Sigma' },
    { visual: 'τ', latex: '\\tau', dica: 'Tau' },
    { visual: 'υ', latex: '\\upsilon', dica: 'Ípsilon' },
    { visual: 'φ', latex: '\\varphi', dica: 'Fi' },
    { visual: 'χ', latex: '\\chi', dica: 'Qui' },
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

  ngOnInit(): void {}

  ngAfterViewInit(): void {}

  ngOnDestroy(): void {
    this._mathFieldConfigurado = false;
  }

  public alternarGavetaMathLive(): void {
    const novo = !this.gavetaMathLiveAberta();
    this.gavetaMathLiveAberta.set(novo);
    if (novo) {
      setTimeout(() => this.configurarMathFieldPublico(), 60);
    }
  }

  public configurarMathFieldPublico(): void {
    const mf = this.mathFieldComposer?.nativeElement;
    if (!mf) return;

    if (!this._mathFieldConfigurado) {
      mf.mathVirtualKeyboardPolicy = 'manual';
      mf.style.setProperty('--_text-font-family', 'var(--font-serif)');

      mf.addEventListener('input', () => {
        this.compositorLatex = mf.value;
      });

      this._mathFieldConfigurado = true;
    }
    mf.focus();
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

  public aplicarCompositorComoInline(): void {
    const mf = this.mathFieldComposer?.nativeElement;
    const latex = (mf?.value ?? this.compositorLatex ?? '').trim();
    if (!latex) return;
    this.inserirTextoNoCursor(`$${latex}$`);
    this.gavetaMathLiveAberta.set(false);
  }

  public aplicarCompositorComoBloco(): void {
    const mf = this.mathFieldComposer?.nativeElement;
    const latex = (mf?.value ?? this.compositorLatex ?? '').trim();
    if (!latex) return;
    this.inserirTextoNoCursor(`\n$$\n${latex}\n$$\n`);
    this.gavetaMathLiveAberta.set(false);
  }

  public onConteudoChange(novoTexto: string): void {
    this.conteudo = novoTexto;
    this.conteudoChange.emit(novoTexto);
    const el = this.textareaMatematica?.nativeElement;
    if (el) {
      const pos = el.selectionStart ?? 0;
      this.cursorAlterado.emit(pos);
    }
  }

  public onInteracaoTextareaMatematica(): void {
    const el = this.textareaMatematica?.nativeElement;
    if (!el) return;
    const pos = el.selectionStart ?? 0;
    this.cursorAlterado.emit(pos);
  }

  public tratarKeydown(event: KeyboardEvent): void {
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
      this.erroUpload = 'Apenas arquivos de imagem são permitidos.';
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
