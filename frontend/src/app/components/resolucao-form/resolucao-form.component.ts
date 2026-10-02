import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { QuestaoService } from '../../services/questao.service';
import { AuthService } from '../../services/auth.service';
import { Questao, Resolucao } from '../../models/questao.model';
import { EditorComplexoResolucaoComponent } from '../editor-complexo/editor-complexo-resolucao/editor-complexo-resolucao.component';
import { RespostaEditorComplexo } from '../editor-complexo/editor-complexo.component';

@Component({
  selector: 'app-resolucao-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, EditorComplexoResolucaoComponent],
  templateUrl: './resolucao-form.component.html',
  styleUrl: './resolucao-form.component.css'
})
export class ResolucaoFormComponent {
  @Input({ required: true }) questao!: Questao;
  @Output() resolucaoPublicada = new EventEmitter<Resolucao>();

  private readonly questaoService = inject(QuestaoService);
  public readonly authService = inject(AuthService);

  public novaResolucao = signal<string>('');
  public codigoResolucao = signal<string>('');
  public linguagemResolucao = signal<string>('java');
  public mostrarCampoCodigo = signal<boolean>(false);
  public selectedPdfFile = signal<File | null>(null);
  public submetendo = signal<boolean>(false);
  public editorComplexoAberto = signal<boolean>(false);

  public onPdfSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (file.type === 'application/pdf') {
        this.selectedPdfFile.set(file);
      } else {
        alert('Por favor, selecione um arquivo PDF valido.');
      }
    }
  }

  public removerArquivoPdf(): void {
    this.selectedPdfFile.set(null);
  }

  public submeterResolucao(): void {
    const texto = (this.novaResolucao() || '').trim();
    const pdfFile = this.selectedPdfFile();
    
    if (!texto && !pdfFile || this.submetendo()) return;

    if (!this.authService.isAuthenticated()) {
      alert('Voce precisa estar logado para submeter uma demonstracao.');
      return;
    }

    this.submetendo.set(true);

    if (pdfFile) {
      this.questaoService.uploadArquivoPdf(pdfFile).subscribe({
        next: (resp) => {
          this.finalizarSubmissao(texto, resp.url);
        },
        error: () => {
          alert('Erro ao fazer upload do PDF. Tente novamente.');
          this.submetendo.set(false);
        }
      });
    } else {
      this.finalizarSubmissao(texto);
    }
  }

  private finalizarSubmissao(texto: string, arquivoPdfUrl?: string): void {
    this.questaoService.enviarResolucao(this.questao.id, {
      conteudo: texto || 'Resolucao em anexo (PDF).',
      trechoCodigo: this.codigoResolucao().trim() || undefined,
      linguagemCodigo: this.codigoResolucao().trim() ? this.linguagemResolucao() : undefined,
      arquivoPdfUrl: arquivoPdfUrl
    }).subscribe({
      next: (nova) => {
        this.limparFormulario();
        this.resolucaoPublicada.emit(nova);
      },
      error: () => {
        alert('Erro ao enviar resolucao. Tente novamente.');
        this.submetendo.set(false);
      }
    });
  }

  public abrirEditor(): void {
    if (!this.authService.isAuthenticated()) {
      alert('Voce precisa estar logado para abrir o editor e submeter uma resolucao.');
      return;
    }
    this.editorComplexoAberto.set(true);
  }

  public fecharEditorComplexo(dados: RespostaEditorComplexo): void {
    if (dados) {
      this.novaResolucao.set(dados.conteudo || '');
      this.codigoResolucao.set(dados.trechoCodigo || '');
      if (dados.linguagemCodigo) {
        this.linguagemResolucao.set(dados.linguagemCodigo);
      }
    }
    this.editorComplexoAberto.set(false);
  }

  public publicarPeloEditor(dados: RespostaEditorComplexo): void {
    if (!dados?.conteudo?.trim() && !dados?.arquivoPdf) return;

    this.submetendo.set(true);

    if (dados.arquivoPdf) {
      this.questaoService.uploadArquivoPdf(dados.arquivoPdf).subscribe({
        next: (resp) => {
          this.finalizarSubmissaoEditor(dados, resp.url);
        },
        error: () => {
          alert('Erro ao fazer upload do PDF pelo editor.');
          this.submetendo.set(false);
        }
      });
    } else {
      this.finalizarSubmissaoEditor(dados);
    }
  }

  private finalizarSubmissaoEditor(dados: RespostaEditorComplexo, arquivoPdfUrl?: string): void {
    this.questaoService.enviarResolucao(this.questao.id, {
      conteudo: dados.conteudo || 'Resolucao em anexo (PDF).',
      trechoCodigo: dados.trechoCodigo,
      linguagemCodigo: dados.linguagemCodigo,
      arquivoPdfUrl: arquivoPdfUrl
    }).subscribe({
      next: (nova) => {
        this.editorComplexoAberto.set(false);
        this.limparFormulario();
        this.resolucaoPublicada.emit(nova);
      },
      error: () => {
        alert('Erro ao enviar resolucao pelo editor. Tente novamente.');
        this.submetendo.set(false);
      }
    });
  }

  private limparFormulario(): void {
    this.novaResolucao.set('');
    this.codigoResolucao.set('');
    this.selectedPdfFile.set(null);
    this.submetendo.set(false);
  }
}
