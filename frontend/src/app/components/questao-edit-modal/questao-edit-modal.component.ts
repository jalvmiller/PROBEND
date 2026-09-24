import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuestaoService } from '../../services/questao.service';
import { Questao } from '../../models/questao.model';

@Component({
  selector: 'app-questao-edit-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './questao-edit-modal.component.html',
  styleUrl: './questao-edit-modal.component.css'
})
export class QuestaoEditModalComponent implements OnInit, OnChanges {
  @Input({ required: true }) questao!: Questao;
  @Input() isOpen: boolean = false;

  @Output() fechar = new EventEmitter<void>();
  @Output() salvarSucesso = new EventEmitter<Questao>();

  private readonly questaoService = inject(QuestaoService);

  // Form states
  public enunciado = signal<string>('');
  public materia = signal<string>('');
  public assunto = signal<string>('');
  public dificuldade = signal<number>(0);
  public fonte = signal<string>('');
  public trechoCodigo = signal<string>('');
  public linguagemCodigo = signal<string>('');
  public imagemUrl = signal<string>('');

  // Status states
  public salvando = signal<boolean>(false);
  public melhorandoIA = signal<boolean>(false);
  public enviandoImagem = signal<boolean>(false);
  public mensagemFeedback = signal<{ tipo: 'sucesso' | 'erro' | 'info'; texto: string } | null>(null);

  ngOnInit(): void {
    this.sincronizarDados();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['questao'] && this.questao) {
      this.sincronizarDados();
    }
  }

  private sincronizarDados(): void {
    if (!this.questao) return;
    this.enunciado.set(this.questao.enunciado || '');
    this.materia.set(this.questao.materia || '');
    this.assunto.set(this.questao.assunto || '');
    this.dificuldade.set(Number(this.questao.dificuldade) || 0);
    this.fonte.set(this.questao.fonte || '');
    this.trechoCodigo.set(this.questao.trechoCodigo || '');
    this.linguagemCodigo.set(this.questao.linguagemCodigo || '');
    this.imagemUrl.set(this.questao.imagemUrl || '');
    this.mensagemFeedback.set(null);
  }

  public handleMelhorarEnunciadoIA(): void {
    const texto = this.enunciado().trim();
    if (!texto) {
      this.exibirMensagem('erro', 'Digite algum conteúdo no enunciado para a IA aprimorar.');
      return;
    }

    this.melhorandoIA.set(true);
    this.mensagemFeedback.set(null);

    this.questaoService.iaSugerir(
      'Melhore o enunciado desta questão técnica para torná-lo mais claro, corrigindo formulações e aprimorando expressões matemáticas em LaTeX, preservando o rigor do domínio.',
      texto
    ).subscribe({
      next: (sugestao: any) => {
        this.melhorandoIA.set(false);
        if (sugestao && sugestao.enunciado) {
          this.enunciado.set(sugestao.enunciado);
          if (sugestao.materia) this.materia.set(sugestao.materia);
          if (sugestao.assunto) this.assunto.set(sugestao.assunto);
          if (sugestao.dificuldade !== undefined) this.dificuldade.set(Number(sugestao.dificuldade) || 0);
          if (sugestao.trechoCodigo) this.trechoCodigo.set(sugestao.trechoCodigo);
          if (sugestao.linguagemCodigo) this.linguagemCodigo.set(sugestao.linguagemCodigo);
          this.exibirMensagem('sucesso', 'Enunciado aprimorado com sucesso pela IA Gemini!');
        } else {
          this.exibirMensagem('info', 'A IA não retornou alterações para o enunciado atual.');
        }
      },
      error: (err) => {
        this.melhorandoIA.set(false);
        console.error('Erro ao aprimorar com IA:', err);
        this.exibirMensagem('erro', 'Falha ao consultar IA. Verifique se o backend e a chave do Gemini estão configurados.');
      }
    });
  }

  public onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    this.enviandoImagem.set(true);
    this.mensagemFeedback.set(null);

    this.questaoService.uploadImagem(file).subscribe({
      next: (res) => {
        this.imagemUrl.set(res.url);
        this.enviandoImagem.set(false);
        this.exibirMensagem('sucesso', 'Imagem anexada com sucesso!');
      },
      error: (err) => {
        this.enviandoImagem.set(false);
        console.error('Erro no upload de imagem:', err);
        this.exibirMensagem('erro', 'Erro ao fazer upload da imagem.');
      }
    });
  }

  public removerImagem(): void {
    this.imagemUrl.set('');
  }

  public salvar(): void {
    const enun = this.enunciado().trim();
    if (!enun) {
      this.exibirMensagem('erro', 'O enunciado é obrigatório.');
      return;
    }

    this.salvando.set(true);
    this.mensagemFeedback.set(null);

    const payload = {
      titulo: this.questao.titulo || enun.substring(0, 45) + '...',
      enunciado: enun,
      materia: (this.materia() || '').trim() || 'Geral',
      assunto: (this.assunto() || '').trim() || 'Outros',
      dificuldade: Number(this.dificuldade()) || 0,
      fonte: (this.fonte() || '').trim(),
      trechoCodigo: (this.trechoCodigo() || '').trim(),
      linguagemCodigo: (this.linguagemCodigo() || '').trim(),
      imagemUrl: (this.imagemUrl() || '').trim()
    };

    this.questaoService.atualizar(this.questao.id, payload).subscribe({
      next: (questaoAtualizada) => {
        this.salvando.set(false);
        this.salvarSucesso.emit(questaoAtualizada);
        this.fechar.emit();
      },
      error: (err) => {
        this.salvando.set(false);
        console.error('Erro ao atualizar questão:', err);
        this.exibirMensagem('erro', 'Erro ao salvar. Verifique se você é o autor ou se a sessão está ativa.');
      }
    });
  }

  public fecharModal(): void {
    if (!this.salvando()) {
      this.fechar.emit();
    }
  }

  private exibirMensagem(tipo: 'sucesso' | 'erro' | 'info', texto: string): void {
    this.mensagemFeedback.set({ tipo, texto });
  }
}
