import { Component, OnInit, Input, ViewChild, ElementRef, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { QuestaoService } from '../../services/questao.service';
import { AuthService } from '../../services/auth.service';
import { TrilhaService } from '../../services/trilha.service';
import { Questao, Resolucao, getDificuldadeTexto, getDificuldadeClasse } from '../../models/questao.model';
import { KatexDirective } from '../../directives/katex.directive';
import { ComentarioModalComponent } from '../../components/comentario-modal/comentario-modal.component';
import { EditorComplexoResolucaoComponent } from '../../components/editor-complexo/editor-complexo-resolucao/editor-complexo-resolucao.component';
import { RespostaEditorComplexo } from '../../components/editor-complexo/editor-complexo.component';
import { AvatarComponent } from '../../components/avatar/avatar.component';

@Component({
  selector: 'app-questao-detalhes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    KatexDirective,
    ComentarioModalComponent,
    EditorComplexoResolucaoComponent,
    AvatarComponent
  ],
  templateUrl: './questao-detalhes.component.html',
  styleUrl: './questao-detalhes.component.css'
})
export class QuestaoDetalhesComponent implements OnInit {
  @Input() id!: string;
  @ViewChild('splitContainer') splitContainer?: ElementRef<HTMLElement>;

  private readonly questaoService = inject(QuestaoService);
  private readonly route = inject(ActivatedRoute);
  public readonly authService = inject(AuthService);
  public readonly trilhaService = inject(TrilhaService);

  public readonly getDificuldadeTexto = getDificuldadeTexto;
  public readonly getDificuldadeClasse = getDificuldadeClasse;

  // Splitter Central Arrastavel
  public leftWidthPct = signal<number>(52);
  public rightWidthPct = computed(() => 100 - this.leftWidthPct());
  public isResizing = signal<boolean>(false);

  private readonly MIN_LEFT_PCT = 28;
  private readonly MAX_LEFT_PCT = 72;
  private readonly SPLIT_STORAGE_KEY = 'probend_split_left_pct';

  public iniciarArrasto(e: MouseEvent): void {
    e.preventDefault();
    this.isResizing.set(true);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const target = e.currentTarget as HTMLElement;
    const container = target.closest('.split-container') as HTMLElement || this.splitContainer?.nativeElement;

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!container) return;
      const rect = container.getBoundingClientRect();
      if (rect.width <= 0) return;
      const rawPct = ((moveEvent.clientX - rect.left) / rect.width) * 100;
      const clamped = Math.min(this.MAX_LEFT_PCT, Math.max(this.MIN_LEFT_PCT, rawPct));
      this.leftWidthPct.set(clamped);
    };

    const onMouseUp = () => {
      this.isResizing.set(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      localStorage.setItem(this.SPLIT_STORAGE_KEY, String(this.leftWidthPct()));
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }

  public iniciarArrastoTouch(e: TouchEvent): void {
    this.isResizing.set(true);
    document.body.style.userSelect = 'none';

    const target = e.currentTarget as HTMLElement;
    const container = target.closest('.split-container') as HTMLElement || this.splitContainer?.nativeElement;

    const onTouchMove = (moveEvent: TouchEvent) => {
      if (!container) return;
      const rect = container.getBoundingClientRect();
      if (rect.width <= 0) return;
      const touch = moveEvent.touches[0];
      const rawPct = ((touch.clientX - rect.left) / rect.width) * 100;
      const clamped = Math.min(this.MAX_LEFT_PCT, Math.max(this.MIN_LEFT_PCT, rawPct));
      this.leftWidthPct.set(clamped);
    };

    const onTouchEnd = () => {
      this.isResizing.set(false);
      document.body.style.userSelect = '';
      localStorage.setItem(this.SPLIT_STORAGE_KEY, String(this.leftWidthPct()));
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };

    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onTouchEnd);
  }

  // Navegacao de Abas do Painel Esquerdo
  public alternarAbaEsquerda(aba: 'enunciado' | 'resolucoes'): void {
    this.abaAtivaEsquerda.set(aba);
  }
  public abaAtivaEsquerda = signal<'enunciado' | 'resolucoes'>('enunciado');

  // Ordenacao das Resolucoes
  public ordenacaoResolucoes = signal<'upvotes' | 'recentes'>('upvotes');

  public readonly resolucoesOrdenadas = computed(() => {
    const lista = [...this.resolucoes()];
    if (this.ordenacaoResolucoes() === 'upvotes') {
      return lista.sort((a, b) => {
        const upA = a.upvotesCount ?? a.upvotes ?? 0;
        const upB = b.upvotesCount ?? b.upvotes ?? 0;
        return upB - upA;
      });
    } else {
      return lista.sort((a, b) => {
        const dataA = new Date(a.dataCriacao || a.criadoEm || 0).getTime();
        const dataB = new Date(b.dataCriacao || b.criadoEm || 0).getTime();
        return dataB - dataA;
      });
    }
  });

  // Estados principais da Questao e Resolucoes
  public questao = signal<Questao | null>(null);
  public resolucoes = signal<Resolucao[]>([]);
  public loading = signal<boolean>(true);
  public erro = signal<string>('');

  // Upvotes
  public isUpvotedQuestao = signal<boolean>(false);
  public upvotesCount = signal<number>(0);
  public meusUpvotesResolucoes = signal<number[]>([]);

  // Formulario de submissao do workspace
  public novaResolucao = signal<string>('');
  public codigoResolucao = signal<string>('');
  public linguagemResolucao = signal<string>('java');
  public mostrarCampoCodigo = signal<boolean>(false);
  public selectedPdfFile = signal<File | null>(null);
  public submetendo = signal<boolean>(false);
  public editorComplexoAberto = signal<boolean>(false);

  // Modal de comentarios
  public modalResolucaoId = signal<number | null>(null);
  public modalAutorNome = signal<string>('');

  // Verifica se o usuario autenticado e o autor da questao
  public isAutor = computed(() => {
    const q = this.questao();
    const u = this.authService.currentUser();
    return !!(q && u && q.autor && q.autor.id === u.id);
  });

  // ==========================================
  // CONTEXTO DA TRILHA DE ESTUDOS ATIVA
  // ==========================================
  public alternandoTrilha = signal<boolean>(false);

  public readonly slotTrilhaAtiva = computed(() => {
    const ativa = this.trilhaService.trilhaAtiva();
    const q = this.questao();
    if (!ativa || !q) return null;
    return ativa.slots.find(s => s.questaoId === q.id) || null;
  });

  public readonly proximoSlotTrilha = computed(() => {
    const ativa = this.trilhaService.trilhaAtiva();
    const atual = this.slotTrilhaAtiva();
    if (!ativa || !atual) return null;
    const idx = ativa.slots.findIndex(s => s.itemId === atual.itemId);
    return idx >= 0 && idx < ativa.slots.length - 1 ? ativa.slots[idx + 1] : null;
  });

  public readonly anteriorSlotTrilha = computed(() => {
    const ativa = this.trilhaService.trilhaAtiva();
    const atual = this.slotTrilhaAtiva();
    if (!ativa || !atual) return null;
    const idx = ativa.slots.findIndex(s => s.itemId === atual.itemId);
    return idx > 0 ? ativa.slots[idx - 1] : null;
  });

  public alternarConclusaoTrilha(): void {
    const ativa = this.trilhaService.trilhaAtiva();
    const slot = this.slotTrilhaAtiva();
    if (!ativa || !slot || this.alternandoTrilha()) return;

    this.alternandoTrilha.set(true);
    this.trilhaService.alternarConclusao(ativa.trilhaId, slot.itemId).subscribe({
      next: () => this.alternandoTrilha.set(false),
      error: (err) => {
        console.error('Falha ao alternar conclusão na trilha:', err);
        this.alternandoTrilha.set(false);
      }
    });
  }

  private idAtualCarregado: string | null = null;

  ngOnInit(): void {
    const savedPct = localStorage.getItem(this.SPLIT_STORAGE_KEY);
    if (savedPct) {
      this.leftWidthPct.set(Number(savedPct));
    }

    if (this.authService.isAuthenticated() && !this.trilhaService.trilhaAtiva()) {
      this.trilhaService.carregarTrilhaAtiva().subscribe();
    }

    // Escuta alterações dinâmicas no parâmetro :id da rota (ex: navegação pelo Quest Tracker ou Sidebar)
    this.route.paramMap.subscribe(params => {
      const routeId = params.get('id') || this.id;
      if (routeId && routeId !== this.idAtualCarregado) {
        this.idAtualCarregado = routeId;
        this.id = routeId;
        this.carregarDadosGlobais(routeId);
      }
    });
  }

  private carregarDadosGlobais(id: string): void {
    this.loading.set(true);
    this.erro.set('');
    this.novaResolucao.set('');
    this.codigoResolucao.set('');
    this.mostrarCampoCodigo.set(false);
    this.selectedPdfFile.set(null);
    this.editorComplexoAberto.set(false);
    this.modalResolucaoId.set(null);
    this.isUpvotedQuestao.set(false);
    this.abaAtivaEsquerda.set('enunciado');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    this.questaoService.buscarPorId(id).subscribe({
      next: (q) => {
        this.questao.set(q);
        this.upvotesCount.set(q.upvotesCount ?? q.upvotes ?? 0);
        this.loading.set(false);
      },
      error: () => {
        this.erro.set('Não foi possível carregar os detalhes da questão.');
        this.loading.set(false);
      }
    });

    this.questaoService.listarResolucoes(id).subscribe({
      next: (resList) => {
        this.resolucoes.set(resList || []);
      },
      error: (err) => console.error('Erro ao carregar resolucoes:', err)
    });

    if (this.authService.isAuthenticated()) {
      this.questaoService.getMeusUpvotes().subscribe({
        next: (upvoteIds) => {
          this.isUpvotedQuestao.set(upvoteIds.includes(Number(id)));
        }
      });

      this.questaoService.getMeusUpvotesResolucoes().subscribe({
        next: (upvoteResIds) => {
          this.meusUpvotesResolucoes.set(upvoteResIds || []);
        }
      });
    }
  }

  public darUpvoteQuestao(): void {
    if (!this.authService.isAuthenticated()) {
      alert('Voce precisa estar logado para dar upvote.');
      return;
    }

    const q = this.questao();
    if (!q) return;

    this.questaoService.upvote(q.id).subscribe({
      next: (resp) => {
        if (resp && typeof resp.upvotes === 'number') {
          this.upvotesCount.set(resp.upvotes);
          this.isUpvotedQuestao.set(resp.upvoted);
        } else {
          const atual = this.isUpvotedQuestao();
          this.isUpvotedQuestao.set(!atual);
          this.upvotesCount.update(c => atual ? Math.max(0, c - 1) : c + 1);
        }
      },
      error: () => alert('Erro ao registrar upvote.')
    });
  }

  public alternarStatusSolucionada(): void {
    const q = this.questao();
    if (!q || !this.isAutor()) return;

    const novoStatus = !q.solucionada;
    this.questaoService.alternarSolucionada(q.id, novoStatus).subscribe({
      next: (atualizada) => {
        this.questao.update(atual => atual ? { ...atual, solucionada: atualizada.solucionada } : null);
      },
      error: () => alert('Erro ao alterar status da questao.')
    });
  }

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
    this.questaoService.enviarResolucao(this.id, {
      conteudo: texto || 'Resolucao em anexo (PDF).',
      trechoCodigo: this.codigoResolucao().trim() || undefined,
      linguagemCodigo: this.codigoResolucao().trim() ? this.linguagemResolucao() : undefined,
      arquivoPdfUrl: arquivoPdfUrl
    }).subscribe({
      next: (nova) => {
        this.resolucoes.update(atuais => [nova, ...atuais]);
        this.novaResolucao.set('');
        this.codigoResolucao.set('');
        this.selectedPdfFile.set(null);
        this.submetendo.set(false);
        // Ao publicar, comuta para a aba de resolucoes para o usuario ver sua demonstracao
        this.abaAtivaEsquerda.set('resolucoes');
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
    this.questaoService.enviarResolucao(this.id, {
      conteudo: dados.conteudo || 'Resolucao em anexo (PDF).',
      trechoCodigo: dados.trechoCodigo,
      linguagemCodigo: dados.linguagemCodigo,
      arquivoPdfUrl: arquivoPdfUrl
    }).subscribe({
      next: (nova) => {
        this.resolucoes.update(atuais => [nova, ...atuais]);
        this.novaResolucao.set('');
        this.codigoResolucao.set('');
        this.editorComplexoAberto.set(false);
        this.submetendo.set(false);
        this.abaAtivaEsquerda.set('resolucoes');
      },
      error: () => {
        alert('Erro ao enviar resolucao pelo editor. Tente novamente.');
        this.submetendo.set(false);
      }
    });
  }

  public darUpvoteResolucao(res: Resolucao): void {
    if (!this.authService.isAuthenticated()) {
      alert('Voce precisa estar logado para dar upvote em resolucoes.');
      return;
    }

    this.questaoService.upvoteResolucao(res.id).subscribe({
      next: (resp) => {
        this.resolucoes.update(lista =>
          lista.map(r => {
            if (r.id === res.id) {
              const novoUpvotes = resp?.upvotes ?? (this.isResolucaoUpvoted(r.id) ? (r.upvotesCount || 1) - 1 : (r.upvotesCount || 0) + 1);
              return { ...r, upvotesCount: novoUpvotes, upvotes: novoUpvotes };
            }
            return r;
          })
        );

        this.meusUpvotesResolucoes.update(ids => {
          if (ids.includes(res.id)) {
            return ids.filter(id => id !== res.id);
          } else {
            return [...ids, res.id];
          }
        });
      }
    });
  }

  public isResolucaoUpvoted(resolucaoId: number): boolean {
    return this.meusUpvotesResolucoes().includes(resolucaoId);
  }

  public abrirModalComentarios(res: Resolucao): void {
    this.modalResolucaoId.set(res.id);
    this.modalAutorNome.set(res.autor?.nome || res.autor?.username || 'Membro do Lab');
  }

  public fecharModalComentarios(): void {
    const id = this.modalResolucaoId();
    if (id) {
      this.questaoService.listarComentarios(id).subscribe({
        next: (coms) => {
          this.resolucoes.update(lista =>
            lista.map(r => r.id === id ? { ...r, qtdComentarios: coms.length } : r)
          );
        }
      });
    }
    this.modalResolucaoId.set(null);
  }

  public alterarOrdenacao(ord: 'upvotes' | 'recentes'): void {
    this.ordenacaoResolucoes.set(ord);
  }

  public getTagsArray(tags: any): string[] {
    if (!tags) return [];
    return tags.map((t: any) => typeof t === 'string' ? t : t.nome);
  }
}
