import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { EditorState, Compartment, Extension } from '@codemirror/state';
import { EditorView, keymap, highlightActiveLine, highlightActiveLineGutter, lineNumbers, placeholder as cmPlaceholder } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap, indentWithTab, undo, redo } from '@codemirror/commands';
import { bracketMatching, indentOnInput } from '@codemirror/language';
import { oneDark } from '@codemirror/theme-one-dark';

import { java } from '@codemirror/lang-java';
import { python } from '@codemirror/lang-python';
import { cpp } from '@codemirror/lang-cpp';
import { javascript } from '@codemirror/lang-javascript';
import { sql } from '@codemirror/lang-sql';
import { rust } from '@codemirror/lang-rust';
import { go } from '@codemirror/lang-go';

@Component({
  selector: 'app-code-mirror-editor',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div #editorHost class="codemirror-host"></div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }

    .codemirror-host {
      width: 100%;
      height: 100%;
    }

    :host ::ng-deep .cm-editor {
      height: 100%;
      font-family: var(--font-mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace);
      font-size: 0.95rem;
      background-color: var(--bg-surface-raised, #161b22) !important;
    }

    :host ::ng-deep .cm-scroller {
      overflow: auto;
      font-family: inherit;
      line-height: 1.6;
    }

    :host ::ng-deep .cm-gutters {
      background-color: var(--bg-surface-raised, #161b22) !important;
      border-right: 1px solid var(--border-default, #30363d);
      color: var(--text-muted, #8b949e);
      font-family: var(--font-mono, monospace);
      font-size: 0.85rem;
      padding-right: 4px;
    }

    :host ::ng-deep .cm-activeLineGutter {
      background-color: rgba(245, 158, 11, 0.12) !important;
      color: var(--accent-amber, #f59e0b) !important;
      font-weight: 700;
    }

    :host ::ng-deep .cm-activeLine {
      background-color: rgba(245, 158, 11, 0.05) !important;
    }

    :host ::ng-deep .cm-cursor {
      border-left-color: var(--accent-amber, #f59e0b) !important;
      border-left-width: 2px !important;
    }

    :host ::ng-deep .cm-placeholder {
      color: var(--text-muted, #8b949e) !important;
      font-style: italic;
    }
  `]
})
export class CodeMirrorEditorComponent implements OnInit, OnChanges, OnDestroy {
  @Input() value: string = '';
  @Input() language: string = 'java';
  @Input() placeholderText: string = '';

  @Output() valueChange = new EventEmitter<string>();

  @ViewChild('editorHost', { static: true }) editorHost!: ElementRef<HTMLDivElement>;

  private editorView?: EditorView;
  private languageCompartment = new Compartment();
  private placeholderCompartment = new Compartment();
  private ignoreNextDocChange = false;

  ngOnInit(): void {
    this.initEditor();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.editorView) return;

    if (changes['language'] && !changes['language'].firstChange) {
      this.atualizarLinguagem(this.language);
    }

    if (changes['placeholderText'] && !changes['placeholderText'].firstChange) {
      this.atualizarPlaceholder(this.placeholderText);
    }

    if (changes['value'] && !changes['value'].firstChange) {
      const currentDoc = this.editorView.state.doc.toString();
      if (this.value !== currentDoc && !this.ignoreNextDocChange) {
        this.editorView.dispatch({
          changes: { from: 0, to: currentDoc.length, insert: this.value || '' }
        });
      }
    }
  }

  ngOnDestroy(): void {
    if (this.editorView) {
      this.editorView.destroy();
    }
  }

  /** Ação acionada pela action bar: Desfazer */
  public desfazer(): void {
    if (this.editorView) {
      undo(this.editorView);
      this.editorView.focus();
    }
  }

  /** Ação acionada pela action bar: Refazer */
  public refazer(): void {
    if (this.editorView) {
      redo(this.editorView);
      this.editorView.focus();
    }
  }

  private initEditor(): void {
    const startState = EditorState.create({
      doc: this.value || '',
      extensions: [
        lineNumbers(),
        highlightActiveLineGutter(),
        highlightActiveLine(),
        history(),
        bracketMatching(),
        indentOnInput(),
        EditorView.lineWrapping,
        keymap.of([
          indentWithTab,
          ...defaultKeymap,
          ...historyKeymap
        ]),
        oneDark,
        this.languageCompartment.of(this.obterExtensaoLinguagem(this.language)),
        this.placeholderCompartment.of(cmPlaceholder(this.placeholderText || '')),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            const novoValor = update.state.doc.toString();
            this.ignoreNextDocChange = true;
            this.valueChange.emit(novoValor);
            setTimeout(() => {
              this.ignoreNextDocChange = false;
            }, 0);
          }
        })
      ]
    });

    this.editorView = new EditorView({
      state: startState,
      parent: this.editorHost.nativeElement
    });
  }

  private atualizarLinguagem(lang: string): void {
    if (!this.editorView) return;
    this.editorView.dispatch({
      effects: this.languageCompartment.reconfigure(this.obterExtensaoLinguagem(lang))
    });
  }

  private atualizarPlaceholder(ph: string): void {
    if (!this.editorView) return;
    this.editorView.dispatch({
      effects: this.placeholderCompartment.reconfigure(cmPlaceholder(ph || ''))
    });
  }

  private obterExtensaoLinguagem(lang: string): Extension {
    switch (lang?.toLowerCase()) {
      case 'java':
        return java();
      case 'python':
        return python();
      case 'cpp':
      case 'c':
      case 'csharp':
        return cpp();
      case 'javascript':
        return javascript();
      case 'typescript':
        return javascript({ typescript: true });
      case 'sql':
        return sql();
      case 'rust':
        return rust();
      case 'go':
        return go();
      default:
        return java();
    }
  }
}
