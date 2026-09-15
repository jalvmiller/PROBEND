import { Component, OnInit, Input, ViewChild, ElementRef, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { QuestaoService } from '../../services/questao.service';
import { AuthService } from '../../services/auth.service';
import { Questao, Resolucao, getDificuldadeTexto, getDificuldadeClasse } from '../../models/questao.model';
import { KatexDirective } from '../../directives/katex.directive';
import { ComentarioModalComponent } from './comentario-modal/comentario-modal.component';

@Component({
  selector: 'app-questao-detalhes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, KatexDirective, ComentarioModalComponent],
  templateUrl: './questao-detalhes.component.html',
  styleUrl: './questao-detalhes.component.css'
})
export class QuestaoDetalhesComponent implements OnInit {
  // O Angular preenche este @Input automaticamente com o :id da URL
  @Input() id!: string;
  @ViewChild('splitContainer') splitContainer?: ElementRef<HTMLElement>;

  private readonly questaoService = inject(QuestaoService);
  private readonly route = inject(ActivatedRoute);
  public readonly authService = inject(AuthService);

  public readonly getDificuldadeTexto = getDificuldadeTexto;
  public readonly getDificuldadeClasse = getDificuldadeClasse;

  // Janelas Resizable (Divisor Arrastável)
  public leftWidthPct = signal<number>(58);
  public rightWidthPct = computed(() => 100 - this.leftWidthPct());
  public isResizing = signal<boolean>(false);
  public janelasModificadas = signal<boolean>(false);

  private readonly MIN_LEFT_PCT = 25;
  private readonly MAX_LEFT_PCT = 75;
  private readonly SPLIT_STORAGE_KEY = 'probend_split_left_pct';
  private readonly JANELAS_MOD_KEY = 'probend_janelas_modificadas';

  // Estados reativos
  public questao = signal<Questao | null>(null);
  public resolucoes = signal<Resolucao[]>([]);
  public loading = signal<boolean>(true);
  public erro = signal<string>('');

  // Upvotes
  public isUpvotedQuestao = signal<boolean>(false);
  public upvotesCount = signal<number>(0);
  public meusUpvotesResolucoes = signal<number[]>([]);

  // Formulário de submissão de resolução
  public novaResolucao = signal<string>('');
  public submetendo = signal<boolean>(false);

  // Modal de comentários
  public modalResolucaoId = signal<number | null>(null);
  public modalAutorNome = signal<string>('');

  // Verifica se o usuário autenticado é o autor da questão
  public isAutor = computed(() => {
    const q = this.questao();
    const u = this.authService.currentUser();
    if (!q?.autor || !u) return false;
    return q.autor.id === u.id || q.autor.username === u.username;
  });

  ngOnInit(): void {
    const savedPct = localStorage.getItem(this.SPLIT_STORAGE_KEY);
    if (savedPct) {
      const num = Number(savedPct);
      if (!isNaN(num) && num >= this.MIN_LEFT_PCT && num <= this.MAX_LEFT_PCT) {
        this.leftWidthPct.set(num);
        this.janelasModificadas.set(true);
      }
    }

    if (localStorage.getItem(this.JANELAS_MOD_KEY) === 'true') {
      this.janelasModificadas.set(true);
    }

    this.route.paramMap.subscribe(params => {
      const routeId = this.id || params.get('id');
      if (routeId) {
        this.carregarDados(routeId);
      }
    });
  }

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
      this.janelasModificadas.set(true);
    };

    const onMouseUp = () => {
      this.isResizing.set(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      localStorage.setItem(this.SPLIT_STORAGE_KEY, String(this.leftWidthPct()));
      localStorage.setItem(this.JANELAS_MOD_KEY, 'true');
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }

  public iniciarArrastoTouch(e: TouchEvent): void {
    if (!e.touches || e.touches.length === 0) return;
    this.isResizing.set(true);

    const target = e.currentTarget as HTMLElement;
    const container = target.closest('.split-container') as HTMLElement || this.splitContainer?.nativeElement;

    const onTouchMove = (moveEvent: TouchEvent) => {
      if (!container || !moveEvent.touches || moveEvent.touches.length === 0) return;
      const touch = moveEvent.touches[0];
      const rect = container.getBoundingClientRect();
      if (rect.width <= 0) return;
      const rawPct = ((touch.clientX - rect.left) / rect.width) * 100;
      const clamped = Math.min(this.MAX_LEFT_PCT, Math.max(this.MIN_LEFT_PCT, rawPct));
      this.leftWidthPct.set(clamped);
      this.janelasModificadas.set(true);
    };

    const onTouchEnd = () => {
      this.isResizing.set(false);
      localStorage.setItem(this.SPLIT_STORAGE_KEY, String(this.leftWidthPct()));
      localStorage.setItem(this.JANELAS_MOD_KEY, 'true');
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchEnd);
    };

    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);
    window.addEventListener('touchcancel', onTouchEnd);
  }

  public iniciarResizeJanela(
    e: MouseEvent | TouchEvent,
    handle: 'br' | 'bl' | 'tr' | 'tl' | 'b' | 'r' | 'l' | 't',
    janelaEl: HTMLElement
  ): void {
    e.preventDefault();
    e.stopPropagation();

    const clientX = 'touches' in e && e.touches.length > 0 ? e.touches[0].clientX : (e as MouseEvent).clientX;
    const clientY = 'touches' in e && e.touches.length > 0 ? e.touches[0].clientY : (e as MouseEvent).clientY;

    const startX = clientX;
    const startY = clientY;
    const rect = janelaEl.getBoundingClientRect();
    const parentEl = (janelaEl.parentElement as HTMLElement) || document.body;
    const parentRect = parentEl.getBoundingClientRect();

    const fixedLeft = rect.left;
    const fixedRight = rect.right;
    const fixedTop = rect.top;
    const fixedBottom = rect.bottom;

    // Altura máxima baseada no conteúdo real para não permitir esticar além do conteúdo (impede o vazio)
    const scrollContainer = (janelaEl.querySelector('.janela-conteudo-scroll') as HTMLElement) || janelaEl;
    const minWidth = 240;
    const minHeight = 140;
    const contentMaxHeight = Math.max(minHeight, scrollContainer.scrollHeight + 4);

    const isRightHandle = handle === 'r' || handle === 'br' || handle === 'tr';
    const isLeftHandle = handle === 'l' || handle === 'bl' || handle === 'tl';
    const isBottomHandle = handle === 'b' || handle === 'br' || handle === 'bl';
    const isTopHandle = handle === 't' || handle === 'tr' || handle === 'tl';

    const cursorMap: Record<string, string> = {
      br: 'se-resize',
      bl: 'sw-resize',
      tr: 'ne-resize',
      tl: 'nw-resize',
      b: 's-resize',
      r: 'e-resize',
      l: 'w-resize',
      t: 'n-resize'
    };

    document.body.style.cursor = cursorMap[handle] || 'se-resize';
    document.body.style.userSelect = 'none';
    janelaEl.classList.add('janela-redimensionando');

    const onMove = (moveEvent: MouseEvent | TouchEvent) => {
      const curX = 'touches' in moveEvent && moveEvent.touches.length > 0
        ? moveEvent.touches[0].clientX
        : (moveEvent as MouseEvent).clientX;
      const curY = 'touches' in moveEvent && moveEvent.touches.length > 0
        ? moveEvent.touches[0].clientY
        : (moveEvent as MouseEvent).clientY;

      // 1. Redimensionamento pela DIREITA: lado esquerdo estritamente fixo, borda direita move-se até o limite do pai
      if (isRightHandle) {
        const clampedRight = Math.min(parentRect.right, Math.max(fixedLeft + minWidth, curX));
        const newWidth = clampedRight - fixedLeft;
        if (clampedRight >= parentRect.right - 2 && parseFloat(janelaEl.style.marginLeft || '0') <= 0) {
          janelaEl.style.width = '';
        } else {
          janelaEl.style.width = `${newWidth}px`;
        }
        this.janelasModificadas.set(true);
      }

      // 2. Redimensionamento pela ESQUERDA: borda direita ESTRITAMENTE FIXA (fixedRight), lado esquerdo move-se
      // Impossibilita matematicamente qualquer overflow à direita
      if (isLeftHandle) {
        const clampedLeft = Math.max(parentRect.left, Math.min(fixedRight - minWidth, curX));
        const newWidth = fixedRight - clampedLeft;
        const newMarginLeft = clampedLeft - parentRect.left;

        if (clampedLeft <= parentRect.left + 2 && fixedRight >= parentRect.right - 2) {
          janelaEl.style.width = '';
          janelaEl.style.marginLeft = '';
        } else {
          janelaEl.style.width = `${newWidth}px`;
          janelaEl.style.marginLeft = newMarginLeft > 0 ? `${newMarginLeft}px` : '';
        }
        this.janelasModificadas.set(true);
      }

      // 3. Redimensionamento por BAIXO: topo estritamente fixo, base move-se até a altura real do conteúdo
      if (isBottomHandle) {
        const clampedBottom = Math.min(fixedTop + contentMaxHeight, Math.max(fixedTop + minHeight, curY));
        const newHeight = clampedBottom - fixedTop;
        if (newHeight >= contentMaxHeight - 2) {
          janelaEl.style.height = '';
        } else {
          janelaEl.style.height = `${newHeight}px`;
        }
        this.janelasModificadas.set(true);
      }

      // 4. Redimensionamento por CIMA: base estritamente fixa, topo move-se
      if (isTopHandle) {
        const clampedTop = Math.max(fixedBottom - contentMaxHeight, Math.min(fixedBottom - minHeight, curY));
        const newHeight = fixedBottom - clampedTop;
        if (newHeight >= contentMaxHeight - 2) {
          janelaEl.style.height = '';
        } else {
          janelaEl.style.height = `${newHeight}px`;
        }
        this.janelasModificadas.set(true);
      }
    };

    const onEnd = () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      janelaEl.classList.remove('janela-redimensionando');
      localStorage.setItem(this.JANELAS_MOD_KEY, 'true');

      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
      window.removeEventListener('touchcancel', onEnd);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd);
    window.addEventListener('touchcancel', onEnd);
  }

  public resetarJanela(janelaEl: HTMLElement): void {
    janelaEl.style.width = '';
    janelaEl.style.height = '';
    janelaEl.style.maxWidth = '';
    janelaEl.style.maxHeight = '';
    janelaEl.style.marginLeft = '';
  }

  public desfazerAlteracoesJanelas(): void {
    const elementos = document.querySelectorAll('.resizable-window');
    elementos.forEach((el) => {
      const htmlEl = el as HTMLElement;
      htmlEl.style.width = '';
      htmlEl.style.height = '';
      htmlEl.style.maxWidth = '';
      htmlEl.style.maxHeight = '';
      htmlEl.style.marginLeft = '';
    });

    // Restaura o divisor central ao valor padrão de 58%
    this.leftWidthPct.set(58);
    localStorage.removeItem(this.SPLIT_STORAGE_KEY);
    localStorage.removeItem(this.JANELAS_MOD_KEY);
    this.janelasModificadas.set(false);
  }

  public fecharAlertaRollback(): void {
    this.janelasModificadas.set(false);
  }

  public carregarDados(id: string): void {
    this.loading.set(true);
    this.erro.set('');

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

    // Carrega a lista de resoluções
    this.questaoService.listarResolucoes(id).subscribe({
      next: (resList) => {
        this.resolucoes.set(resList || []);
      },
      error: (err) => console.error('Erro ao carregar resoluções:', err)
    });

    // Se estiver autenticado, carrega upvotes do usuário
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
      alert('Você precisa estar logado para dar upvote.');
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
          // Alterna otimista se retorno for void
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
      error: () => alert('Erro ao alterar status da questão.')
    });
  }

  public submeterResolucao(): void {
    const texto = (this.novaResolucao() || '').trim();
    if (!texto || this.submetendo()) return;

    if (!this.authService.isAuthenticated()) {
      alert('Você precisa estar logado para submeter uma demonstração.');
      return;
    }

    this.submetendo.set(true);
    this.questaoService.enviarResolucao(this.id, { conteudo: texto }).subscribe({
      next: (nova) => {
        this.resolucoes.update(atuais => [nova, ...atuais]);
        this.novaResolucao.set('');
        this.submetendo.set(false);
      },
      error: () => {
        alert('Erro ao enviar resolução. Tente novamente.');
        this.submetendo.set(false);
      }
    });
  }

  public darUpvoteResolucao(res: Resolucao): void {
    if (!this.authService.isAuthenticated()) {
      alert('Você precisa estar logado para dar upvote em resoluções.');
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

  public isUpvotedResolucao(resolucaoId: number): boolean {
    return this.isResolucaoUpvoted(resolucaoId);
  }

  public abrirModalComentarios(res: Resolucao): void {
    this.modalResolucaoId.set(res.id);
    this.modalAutorNome.set(res.autor?.nome || res.autor?.username || 'Membro do Lab');
  }

  public fecharModalComentarios(): void {
    const id = this.modalResolucaoId();
    if (id) {
      // Atualiza a quantidade de comentários da resolução
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

  public getTagsArray(tags: any): string[] {
    if (!tags) return [];
    return tags.map((t: any) => typeof t === 'string' ? t : t.nome);
  }
}
