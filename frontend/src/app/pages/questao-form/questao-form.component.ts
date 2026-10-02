import { Component, OnInit, Input, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { QuestaoService } from '../../services/questao.service';
import { Questao } from '../../models/questao.model';
import { KatexDirective } from '../../directives/katex.directive';
import { CopilotoGeminiComponent } from '../../components/copiloto-gemini/copiloto-gemini.component';
import { EditorComplexoCriacaoComponent } from '../../components/editor-complexo/editor-complexo-criacao/editor-complexo-criacao.component';
import { RespostaEditorComplexo } from '../../components/editor-complexo/editor-complexo.component';

@Component({
  selector: 'app-questao-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, KatexDirective, CopilotoGeminiComponent, EditorComplexoCriacaoComponent],
  templateUrl: './questao-form.component.html',
  styleUrl: './questao-form.component.css',
})
export class QuestaoFormComponent implements OnInit {
  @Input() id?: string;

  private readonly questaoService = inject(QuestaoService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);

  // Form Model unificado
  public form = this.fb.nonNullable.group({
    titulo: [''],
    enunciado: ['', [Validators.required]],
    materia: ['', [Validators.required]],
    assunto: [''],
    dificuldade: [0],
    fonte: [''],
    trechoCodigo: [''],
    linguagemCodigo: [''],
    imagemUrl: ['']
  });

  // Estados de Upload e Salvamento
  public enviandoImagem = signal<boolean>(false);
  public salvando = signal<boolean>(false);
  public erro = signal<string>('');
  
  public editorComplexoAberto = signal<boolean>(false);

  ngOnInit(): void {
    if (this.id) {
      this.carregarParaEdicao(this.id);
    }

    this.route.queryParams.subscribe(params => {
      if (params['editor'] === 'true') {
        this.editorComplexoAberto.set(true);
      }
    });
  }

  public abrirEditorComplexo(): void {
    this.editorComplexoAberto.set(true);
  }

  public aplicarPeloEditor(dados: RespostaEditorComplexo): void {
    this.form.patchValue({
      enunciado: dados.conteudo,
      trechoCodigo: dados.trechoCodigo || '',
      linguagemCodigo: dados.linguagemCodigo || ''
    });
    this.editorComplexoAberto.set(false);
  }

  private carregarParaEdicao(id: string): void {
    this.questaoService.buscarPorId(id).subscribe({
      next: (q) => {
        this.form.patchValue({
          titulo: q.titulo || '',
          enunciado: q.enunciado || '',
          materia: q.materia || '',
          assunto: q.assunto || '',
          dificuldade: Number(q.dificuldade) || 0,
          fonte: q.fonte || '',
          trechoCodigo: q.trechoCodigo || '',
          linguagemCodigo: q.linguagemCodigo || '',
          imagemUrl: q.imagemUrl || ''
        });
      },
      error: () => this.erro.set('Erro ao carregar dados da questao para edicao.'),
    });
  }

  public onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    this.enviandoImagem.set(true);
    this.questaoService.uploadImagem(file).subscribe({
      next: (res) => {
        this.form.patchValue({ imagemUrl: res.url });
        this.enviandoImagem.set(false);
      },
      error: () => {
        alert('Erro ao fazer upload da imagem.');
        this.enviandoImagem.set(false);
      },
    });
  }

  public aplicarSugestaoIA(dados: any): void {
    if (!dados) return;
    this.form.patchValue({
      titulo: dados.titulo ?? this.form.value.titulo,
      enunciado: dados.enunciado ?? this.form.value.enunciado,
      materia: dados.materia ?? this.form.value.materia,
      assunto: dados.assunto ?? this.form.value.assunto,
      dificuldade: dados.dificuldade !== undefined ? Number(dados.dificuldade) : this.form.value.dificuldade,
      trechoCodigo: dados.trechoCodigo ?? this.form.value.trechoCodigo,
      linguagemCodigo: dados.linguagemCodigo ?? this.form.value.linguagemCodigo,
      fonte: dados.fonte ?? this.form.value.fonte
    });
  }

  public onQuestaoPublicadaDireto(q: Questao): void {
    this.router.navigate(['/questoes', q.id]);
  }

  public removerImagem(): void {
    this.form.patchValue({ imagemUrl: '' });
  }

  public salvarQuestao(): void {
    if (this.form.invalid) {
      alert('O enunciado e a materia da questao sao obrigatorios.');
      return;
    }

    this.salvando.set(true);
    const rawValue = this.form.getRawValue();
    const payload = {
      ...rawValue,
      titulo: rawValue.titulo.trim() || rawValue.enunciado.substring(0, 45).trim() + '...',
      materia: rawValue.materia.trim() || 'Geral',
      assunto: rawValue.assunto.trim() || 'Outros',
      dificuldade: Number(rawValue.dificuldade) || 0
    };

    if (this.id) {
      this.questaoService.atualizar(this.id, payload).subscribe({
        next: () => {
          this.salvando.set(false);
          this.router.navigate(['/questoes', this.id]);
        },
        error: () => {
          alert('Erro ao atualizar questao.');
          this.salvando.set(false);
        },
      });
    } else {
      this.questaoService.salvar(payload).subscribe({
        next: (nova) => {
          this.salvando.set(false);
          this.router.navigate(['/questoes', nova.id]);
        },
        error: () => {
          alert('Erro ao cadastrar questao.');
          this.salvando.set(false);
        },
      });
    }
  }
}
