import { Component, EventEmitter, Input, Output, ViewChild, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CodeMirrorEditorComponent } from '../code-mirror-editor/code-mirror-editor.component';
import { IconComponent } from '../../icon/icon.component';

export interface DocumentacaoLink {
  rotulo: string;
  url: string;
  subtitulo: string;
}

@Component({
  selector: 'app-editor-code-pane',
  standalone: true,
  imports: [CommonModule, CodeMirrorEditorComponent, IconComponent],
  templateUrl: './editor-code-pane.component.html',
  styleUrl: './editor-code-pane.component.css'
})
export class EditorCodePaneComponent {
  @Input() trechoCodigo: string = '';
  @Input() linguagemCodigo: string = 'java';
  @Input() placeholderCodigo: string = '';

  @Output() trechoCodigoChange = new EventEmitter<string>();

  @ViewChild('cmEditor') cmEditor?: CodeMirrorEditorComponent;

  // Estado dos popovers / menus da action bar
  public menuDocsAberto = signal<boolean>(false);
  public modalAtalhosAberto = signal<boolean>(false);

  // Nome formatado para exibição do badge
  public nomeLinguagemFormatado = computed(() => {
    const lang = (this.linguagemCodigo || 'java').toLowerCase();
    const mapa: Record<string, string> = {
      java: 'Java',
      python: 'Python',
      cpp: 'C++',
      csharp: 'C#',
      c: 'C',
      javascript: 'JavaScript',
      typescript: 'TypeScript',
      sql: 'SQL',
      rust: 'Rust',
      go: 'Go'
    };
    return mapa[lang] || lang.toUpperCase();
  });

  // Links dinâmicos de documentação para a linguagem selecionada
  public linksDocumentacao = computed<DocumentacaoLink[]>(() => {
    const lang = (this.linguagemCodigo || 'java').toLowerCase();
    switch (lang) {
      case 'java':
        return [
          { rotulo: 'W3Schools (Tutoriais & Exemplos)', url: 'https://www.w3schools.com/java/', subtitulo: 'Guia prático passo a passo' },
          { rotulo: 'DevDocs.io (API Rápida)', url: 'https://devdocs.io/openjdk~21/', subtitulo: 'Referência rápida da JDK' },
          { rotulo: 'Oracle Docs Oficial', url: 'https://docs.oracle.com/en/java/', subtitulo: 'Documentação canônica Java' }
        ];
      case 'python':
        return [
          { rotulo: 'W3Schools (Tutoriais & Exemplos)', url: 'https://www.w3schools.com/python/', subtitulo: 'Guia prático para iniciantes' },
          { rotulo: 'DevDocs.io (API Rápida)', url: 'https://devdocs.io/python~3.12/', subtitulo: 'Referência rápida de bibliotecas' },
          { rotulo: 'Python Docs Oficial', url: 'https://docs.python.org/3/', subtitulo: 'Documentação canônica Python' }
        ];
      case 'cpp':
      case 'c':
        return [
          { rotulo: 'W3Schools (Tutoriais & Exemplos)', url: 'https://www.w3schools.com/cpp/', subtitulo: 'Sintaxe e fundamentos de C++' },
          { rotulo: 'DevDocs.io (API Rápida)', url: 'https://devdocs.io/cpp/', subtitulo: 'Referência completa STL e headers' },
          { rotulo: 'cppreference.com Oficial', url: 'https://en.cppreference.com/', subtitulo: 'Padrão canônico da comunidade C++' }
        ];
      case 'csharp':
        return [
          { rotulo: 'W3Schools (Tutoriais & Exemplos)', url: 'https://www.w3schools.com/cs/', subtitulo: 'Guia essencial de C#' },
          { rotulo: 'DevDocs.io (API Rápida)', url: 'https://devdocs.io/csharp/', subtitulo: 'Pesquisa rápida de tipos e namespaces' },
          { rotulo: 'Microsoft Learn Docs', url: 'https://learn.microsoft.com/dotnet/csharp/', subtitulo: 'Documentação oficial .NET' }
        ];
      case 'javascript':
        return [
          { rotulo: 'W3Schools (Tutoriais & Exemplos)', url: 'https://www.w3schools.com/js/', subtitulo: 'Sintaxe e métodos fundamentais' },
          { rotulo: 'MDN Web Docs (Oficial)', url: 'https://developer.mozilla.org/pt-BR/docs/Web/JavaScript', subtitulo: 'Maior enciclopédia web do mundo' },
          { rotulo: 'DevDocs.io (API Rápida)', url: 'https://devdocs.io/javascript/', subtitulo: 'Referência veloz offline-ready' }
        ];
      case 'typescript':
        return [
          { rotulo: 'W3Schools (Tutoriais & Exemplos)', url: 'https://www.w3schools.com/typescript/', subtitulo: 'Guia de tipagem estática' },
          { rotulo: 'TypeScript Handbook Oficial', url: 'https://www.typescriptlang.org/docs/', subtitulo: 'Manual canônico da Microsoft' },
          { rotulo: 'DevDocs.io (API Rápida)', url: 'https://devdocs.io/typescript/', subtitulo: 'Referência de tipos utilitários' }
        ];
      case 'sql':
        return [
          { rotulo: 'W3Schools (Tutoriais & Exemplos)', url: 'https://www.w3schools.com/sql/', subtitulo: 'Queries, JOINs e agregações' },
          { rotulo: 'DevDocs.io (PostgreSQL / MySQL)', url: 'https://devdocs.io/postgresql~16/', subtitulo: 'Documentação estruturada SQL' }
        ];
      case 'rust':
        return [
          { rotulo: 'The Rust Book Oficial', url: 'https://doc.rust-lang.org/book/', subtitulo: 'O clássico livro de aprendizado Rust' },
          { rotulo: 'DevDocs.io (Standard Library)', url: 'https://devdocs.io/rust/', subtitulo: 'Documentação da lib standard' }
        ];
      case 'go':
        return [
          { rotulo: 'W3Schools (Tutoriais & Exemplos)', url: 'https://www.w3schools.com/go/', subtitulo: 'Fundamentos de Golang' },
          { rotulo: 'Go Documentation Oficial', url: 'https://go.dev/doc/', subtitulo: 'Especificação canônica de Go' },
          { rotulo: 'DevDocs.io (API Rápida)', url: 'https://devdocs.io/go/', subtitulo: 'Pacotes e interfaces padrão' }
        ];
      default:
        return [
          { rotulo: 'DevDocs.io (Referência Técnica)', url: 'https://devdocs.io/', subtitulo: 'Pesquisa veloz de documentações' }
        ];
    }
  });

  public alternarMenuDocs(): void {
    this.menuDocsAberto.update(aberto => !aberto);
    if (this.menuDocsAberto()) {
      this.modalAtalhosAberto.set(false);
    }
  }

  public fecharMenuDocs(): void {
    this.menuDocsAberto.set(false);
  }

  public alternarModalAtalhos(): void {
    this.modalAtalhosAberto.update(aberto => !aberto);
    if (this.modalAtalhosAberto()) {
      this.menuDocsAberto.set(false);
    }
  }

  public fecharModalAtalhos(): void {
    this.modalAtalhosAberto.set(false);
  }

  public acionarDesfazer(): void {
    this.cmEditor?.desfazer();
  }

  public acionarRefazer(): void {
    this.cmEditor?.refazer();
  }
}
