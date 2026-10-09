import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
  computed,
  signal,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { EditorHeaderComponent } from './editor-header/editor-header.component';
import { EditorEnunciadoDrawerComponent } from './editor-enunciado-drawer/editor-enunciado-drawer.component';
import { EditorMathPaneComponent } from './editor-math-pane/editor-math-pane.component';
import { EditorDocumentoPreviewComponent } from './editor-documento-preview/editor-documento-preview.component';
import { EditorCodePaneComponent } from './editor-code-pane/editor-code-pane.component';
import { EditorCodePreviewComponent } from './editor-code-preview/editor-code-preview.component';
import { EditorGuiaModalComponent } from './editor-guia-modal/editor-guia-modal.component';

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

export interface RespostaEditorComplexo {
  conteudo: string;
  trechoCodigo?: string;
  linguagemCodigo?: string;
  arquivoPdf?: File;
}

@Component({
  selector: 'app-editor-complexo',
  standalone: true,
  imports: [
    CommonModule,
    EditorHeaderComponent,
    EditorEnunciadoDrawerComponent,
    EditorMathPaneComponent,
    EditorDocumentoPreviewComponent,
    EditorCodePaneComponent,
    EditorCodePreviewComponent,
    EditorGuiaModalComponent
  ],
  templateUrl: './editor-complexo.component.html',
  styleUrl: './editor-complexo.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class EditorComplexoComponent implements OnInit {
  @Input() titulo: string = '';
  @Input() subtitulo: string = '';
  @Input() badgeModo: string = 'EDITOR';
  @Input() placeholderMatematicaText: string = '';
  @Input() placeholderCodigoText: string = '';
  @Input() mostrarVerEnunciado: boolean = false;
  @Input() enunciadoOriginal: string = '';
  @Input() codigoOriginal: string = '';
  @Input() textoBotaoAcao: string = 'Submeter';
  
  @Input() conteudoInicial: string = '';
  @Input() codigoInicial: string = '';
  @Input() linguagemInicial: string = 'java';
  @Input() forcarModoAlgoritmo: boolean = false;

  @Output() fechar = new EventEmitter<RespostaEditorComplexo>();
  @Output() publicar = new EventEmitter<RespostaEditorComplexo>();

  @ViewChild('mathPane') mathPane?: EditorMathPaneComponent;

  private readonly authService = inject(AuthService);

  @Input() autorNome?: string;

  public autorExibicao = computed(() => {
    if (this.autorNome && this.autorNome.trim()) {
      return this.autorNome.trim();
    }
    const user = this.authService.currentUser();
    return user?.nome || user?.username || 'Autor';
  });

  // Modal de Guia de Uso
  public modalGuiaAberto = signal<boolean>(false);
  public abrirModalGuia(): void { this.modalGuiaAberto.set(true); }
  public fecharModalGuia(): void { this.modalGuiaAberto.set(false); }

  // Modos de Edição
  public modoAtivo = signal<'MATEMATICA' | 'ALGORITMO'>('MATEMATICA');

  // Modo de Visualização do Preview: Documento Paginado x Página Corrida
  public modoVisualizacao = signal<'DOCUMENTO' | 'CORRIDO'>('DOCUMENTO');
  public paginaAtualIndex = signal<number>(0);
  public selectedPdfFile = signal<File | null>(null);

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

  public sincronizarPaginaComCursor(posCursor: number): void {
    const texto = this.conteudo();
    const textoAntes = texto.substring(0, posCursor);
    const paginaCursor = (textoAntes.match(/<!--\s*pagebreak\s*-->/gi) || []).length;
    const maxPagina = Math.max(this.totalPaginas() - 1, 0);
    const paginaAlvo = Math.min(paginaCursor, maxPagina);
    if (this.paginaAtualIndex() !== paginaAlvo) {
      this.paginaAtualIndex.set(paginaAlvo);
    }
  }

  public sincronizarPaginaComLinha(linha: number): void {
    const texto = this.conteudo();
    const linhas = texto.split('\n');
    const linhasAntes = linhas.slice(0, Math.max(0, linha));
    const textoAntes = linhasAntes.join('\n');
    const paginaCursor = (textoAntes.match(/<!--\s*pagebreak\s*-->/gi) || []).length;
    const maxPagina = Math.max(this.totalPaginas() - 1, 0);
    const paginaAlvo = Math.min(paginaCursor, maxPagina);
    if (this.paginaAtualIndex() !== paginaAlvo) {
      this.paginaAtualIndex.set(paginaAlvo);
    }
  }

  // Drawer de Enunciado
  public enunciadoAberto = signal<boolean>(false);

  // Estado de Submissão
  public submetendo = signal<boolean>(false);

  // Placeholders e Texto Exemplo Inicial
  public readonly textoExemploPadrao = `Digite sua demonstração passo a passo...

Use $fórmula$ para equações na linha e $$fórmula$$ para equações em bloco.
Exemplo:
Seja a integral:
$$\\int_{0}^{\\infty} e^{-x^2} \\, dx = \\frac{\\sqrt{\\pi}}{2}$$`;

  public placeholderMatematica = computed(() => {
    return this.placeholderMatematicaText || 'Digite sua demonstração matemática em Markdown e LaTeX ($...$ ou $$...$$)...';
  });

  public placeholderCodigo = computed(() => {
    return this.placeholderCodigoText || `// Escreva aqui o algoritmo ou solução computacional...
// Pressione Tab normalmente para indentação.`;
  });

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
    if (this.conteudoInicial && this.conteudoInicial.trim()) {
      this.conteudo.set(this.conteudoInicial);
    } else {
      this.conteudo.set(this.textoExemploPadrao);
    }
    if (this.codigoInicial) {
      this.trechoCodigo.set(this.codigoInicial);
    }
    if (this.linguagemInicial) {
      this.linguagemCodigo.set(this.linguagemInicial);
    }

    if (this.forcarModoAlgoritmo || this.codigoInicial) {
      this.modoAtivo.set('ALGORITMO');
    }
  }

  public alternarModo(novoModo: 'MATEMATICA' | 'ALGORITMO'): void {
    this.modoAtivo.set(novoModo);
    if (novoModo === 'MATEMATICA') {
      setTimeout(() => {
        this.mathPane?.configurarMathFieldPublico();
      }, 50);
    }
  }

  public toggleEnunciado(): void {
    this.enunciadoAberto.update(aberto => !aberto);
  }

  public inserirQuebraPagina(): void {
    const delimitador = '\n\n<!-- pagebreak -->\n\n';
    this.mathPane?.inserirTextoNoCursor(delimitador);
  }

  public minimizarEFechar(): void {
    this.fechar.emit({
      conteudo: this.conteudo(),
      trechoCodigo: this.trechoCodigo(),
      linguagemCodigo: this.linguagemCodigo(),
      arquivoPdf: this.selectedPdfFile() || undefined
    });
  }

  public onPdfSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (file.type === 'application/pdf') {
        this.selectedPdfFile.set(file);
      } else {
        alert('Por favor, selecione um arquivo PDF válido.');
      }
    }
  }

  public removerArquivoPdf(): void {
    this.selectedPdfFile.set(null);
  }

  public submeter(): void {
    const cont = this.conteudo().trim();
    const cod = this.trechoCodigo().trim();
    const pdfFile = this.selectedPdfFile();

    // Se estiver no modo algoritmo e o usuário só escreveu código, geramos uma descrição padrão se vazia
    let conteudoFinal = cont;
    if (!conteudoFinal && cod) {
      conteudoFinal = `Resolução algorítmica implementada em ${this.linguagemCodigo().toUpperCase()}.`;
    }

    if (!conteudoFinal && !pdfFile) {
      alert('Por favor, digite uma explicação teórica, demonstração matemática, código, ou anexe um PDF para a resolução.');
      return;
    }

    this.submetendo.set(true);
    this.publicar.emit({
      conteudo: conteudoFinal || 'Resolução em anexo (PDF).',
      trechoCodigo: cod || undefined,
      linguagemCodigo: cod ? this.linguagemCodigo() : undefined,
      arquivoPdf: pdfFile || undefined
    });
  }
}
