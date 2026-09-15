import { Component, OnInit, Input, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { QuestaoService } from '../../services/questao.service';
import { Dificuldade } from '../../models/questao.model';
import { KatexDirective } from '../../directives/katex.directive';

@Component({
  selector: 'app-questao-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, KatexDirective],
  templateUrl: './questao-form.component.html',
  styleUrl: './questao-form.component.css'
})
export class QuestaoFormComponent implements OnInit {
  @Input() id?: string;

  private readonly questaoService = inject(QuestaoService);
  private readonly router = inject(Router);

  // Form Model
  public titulo = signal<string>('');
  public enunciado = signal<string>('');
  public materia = signal<string>('');
  public assunto = signal<string>('');
  public dificuldade = signal<number>(0);
  public fonte = signal<string>('');
  public trechoCodigo = signal<string>('');
  public linguagemCodigo = signal<string>('');
  public imagemUrl = signal<string>('');

  // Estados de IA e Upload
  public promptIA = signal<string>('');
  public gerandoIA = signal<boolean>(false);
  public enviandoImagem = signal<boolean>(false);
  public salvando = signal<boolean>(false);
  public erro = signal<string>('');

  ngOnInit(): void {
    if (this.id) {
      this.carregarParaEdicao(this.id);
    }
  }

  private carregarParaEdicao(id: string): void {
    this.questaoService.buscarPorId(id).subscribe({
      next: (q) => {
        this.titulo.set(q.titulo || '');
        this.enunciado.set(q.enunciado || '');
        this.materia.set(q.materia || '');
        this.assunto.set(q.assunto || '');
        this.dificuldade.set(Number(q.dificuldade) || 0);
        this.fonte.set(q.fonte || '');
        this.trechoCodigo.set(q.trechoCodigo || '');
        this.linguagemCodigo.set(q.linguagemCodigo || '');
        this.imagemUrl.set(q.imagemUrl || '');
      },
      error: () => this.erro.set('Erro ao carregar dados da questão para edição.')
    });
  }

  public onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    this.enviandoImagem.set(true);
    this.questaoService.uploadImagem(file).subscribe({
      next: (res) => {
        this.imagemUrl.set(res.url);
        this.enviandoImagem.set(false);
      },
      error: () => {
        alert('Erro ao fazer upload da imagem.');
        this.enviandoImagem.set(false);
      }
    });
  }

  public gerarEsbocoIA(): void {
    const prompt = (this.promptIA() || '').trim();
    if (!prompt) {
      alert('Digite uma descrição ou ideia para o Copiloto Gemini.');
      return;
    }

    this.gerandoIA.set(true);
    this.questaoService.iaSugerir(prompt, this.enunciado() || '').subscribe({
      next: (dados) => {
        if (dados) {
          if (dados.titulo) this.titulo.set(dados.titulo);
          if (dados.enunciado) this.enunciado.set(dados.enunciado);
          if (dados.materia) this.materia.set(dados.materia);
          if (dados.assunto) this.assunto.set(dados.assunto);
          if (dados.dificuldade !== undefined) this.dificuldade.set(Number(dados.dificuldade) || 0);
          if (dados.trechoCodigo) this.trechoCodigo.set(dados.trechoCodigo);
          if (dados.linguagemCodigo) this.linguagemCodigo.set(dados.linguagemCodigo);
          if (dados.fonte) this.fonte.set(dados.fonte);
        }
        this.gerandoIA.set(false);
      },
      error: () => {
        alert('Erro ao obter sugestão da IA. Verifique as credenciais da API Gemini.');
        this.gerandoIA.set(false);
      }
    });
  }

  public criarTotalIA(): void {
    const prompt = (this.promptIA() || '').trim();
    if (!prompt) {
      alert('Digite uma descrição ou ideia para o Copiloto Gemini.');
      return;
    }

    this.gerandoIA.set(true);
    this.questaoService.iaCriarTotal(prompt).subscribe({
      next: (q) => {
        this.gerandoIA.set(false);
        this.router.navigate(['/questoes', q.id]);
      },
      error: () => {
        alert('Erro ao publicar questão com IA. Verifique as credenciais da API Gemini.');
        this.gerandoIA.set(false);
      }
    });
  }

  public removerImagem(): void {
    this.imagemUrl.set('');
  }

  public salvarQuestao(): void {
    const tit = (this.titulo() || '').trim();
    const enun = (this.enunciado() || '').trim();
    const mat = (this.materia() || '').trim();

    if (!enun) {
      alert('O enunciado da questão é obrigatório.');
      return;
    }

    this.salvando.set(true);
    const payload = {
      titulo: tit || (enun.substring(0, 45) + '...'),
      enunciado: enun,
      materia: mat || 'Geral',
      assunto: (this.assunto() || '').trim() || 'Outros',
      dificuldade: Number(this.dificuldade()) || 0,
      fonte: (this.fonte() || '').trim(),
      trechoCodigo: (this.trechoCodigo() || '').trim(),
      linguagemCodigo: (this.linguagemCodigo() || '').trim(),
      imagemUrl: (this.imagemUrl() || '').trim()
    };

    if (this.id) {
      this.questaoService.atualizar(this.id, payload).subscribe({
        next: () => {
          this.salvando.set(false);
          this.router.navigate(['/questoes', this.id]);
        },
        error: () => {
          alert('Erro ao atualizar questão.');
          this.salvando.set(false);
        }
      });
    } else {
      this.questaoService.salvar(payload).subscribe({
        next: (nova) => {
          this.salvando.set(false);
          this.router.navigate(['/questoes', nova.id]);
        },
        error: () => {
          alert('Erro ao cadastrar questão.');
          this.salvando.set(false);
        }
      });
    }
  }
}
