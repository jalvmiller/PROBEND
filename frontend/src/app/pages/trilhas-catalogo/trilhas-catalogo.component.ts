import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TrilhaService } from '../../services/trilha.service';
import { AuthService } from '../../services/auth.service';
import { TrilhaResumo, ItemTrilha } from '../../models/trilha.model';
import { AvatarComponent } from '../../components/avatar/avatar.component';
import { KatexDirective } from '../../directives/katex.directive';

@Component({
  selector: 'app-trilhas-catalogo',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    RouterLink,
    FormsModule,
    AvatarComponent,
    KatexDirective
  ],
  templateUrl: './trilhas-catalogo.component.html',
  styleUrl: './trilhas-catalogo.component.css'
})
export class TrilhasCatalogoComponent implements OnInit {
  public readonly trilhaService = inject(TrilhaService);
  public readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // Estados Reativos
  public readonly trilhas = signal<TrilhaResumo[]>([]);
  public readonly carregando = signal<boolean>(true);
  public readonly filtroAba = signal<'todas' | 'minhas' | 'comunidade'>('todas');
  public readonly termoBusca = signal<string>('');

  // Gaveta Lateral de Detalhes (Slide-over Drawer)
  public readonly gavetaAberta = signal<boolean>(false);
  public readonly trilhaDetalhes = signal<TrilhaResumo | null>(null);
  public readonly carregandoDetalhes = signal<boolean>(false);

  // Ações em andamento
  public readonly idEmAcao = signal<number | null>(null);

  // Contadores dinâmicos
  public readonly totalMinhas = computed(() => {
    const usuarioAtual = this.authService.currentUser();
    if (!usuarioAtual) return 0;
    return this.trilhas().filter(t => this.isAutor(t)).length;
  });

  public readonly totalComunidade = computed(() => {
    return this.trilhas().filter(t => t.publica && !this.isAutor(t)).length;
  });

  // Lista Filtrada
  public readonly trilhasFiltradas = computed(() => {
    const lista = this.trilhas();
    const aba = this.filtroAba();
    const busca = this.termoBusca().trim().toLowerCase();

    return lista.filter(trilha => {
      // 1. Filtro de Abas
      if (aba === 'minhas' && !this.isAutor(trilha)) {
        return false;
      }
      if (aba === 'comunidade' && (!trilha.publica || this.isAutor(trilha))) {
        return false;
      }

      // 2. Filtro de Busca Textual
      if (busca) {
        const tituloMatch = trilha.titulo?.toLowerCase().includes(busca);
        const descMatch = trilha.descricao?.toLowerCase().includes(busca);
        const autorMatch = trilha.autor?.nome?.toLowerCase().includes(busca) ||
                           trilha.autor?.username?.toLowerCase().includes(busca);
        return tituloMatch || descMatch || autorMatch;
      }

      return true;
    });
  });

  ngOnInit(): void {
    this.carregarCatalogo();
  }

  public carregarCatalogo(): void {
    this.carregando.set(true);
    this.trilhaService.listarTodas().subscribe({
      next: (dados) => {
        this.trilhas.set(dados || []);
        this.carregando.set(false);
      },
      error: () => {
        this.trilhas.set([]);
        this.carregando.set(false);
      }
    });
  }

  public mudarAba(aba: 'todas' | 'minhas' | 'comunidade'): void {
    this.filtroAba.set(aba);
  }

  public isAutor(trilha: TrilhaResumo): boolean {
    const usuario = this.authService.currentUser();
    if (!usuario || !trilha.autor) return false;
    return trilha.autor.username === usuario.username ||
           (usuario.id !== undefined && trilha.autor.id === usuario.id);
  }

  public isTrilhaAtiva(trilha: TrilhaResumo): boolean {
    const ativa = this.trilhaService.trilhaAtiva();
    return !!ativa && ativa.trilhaId === trilha.id;
  }

  public getProgressoPercentual(trilha: TrilhaResumo): number {
    if (!trilha.totalQuestoes || trilha.totalQuestoes === 0) return 0;
    const concluidas = trilha.concluidas ?? 0;
    return Math.min(100, Math.round((concluidas / trilha.totalQuestoes) * 100));
  }

  // Controle da Gaveta Lateral
  public abrirDetalhes(trilha: TrilhaResumo, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.carregandoDetalhes.set(true);
    this.trilhaDetalhes.set(trilha);
    this.gavetaAberta.set(true);

    this.trilhaService.buscarPorId(trilha.id).subscribe({
      next: (completa) => {
        this.trilhaDetalhes.set(completa);
        this.carregandoDetalhes.set(false);
      },
      error: () => {
        this.carregandoDetalhes.set(false);
      }
    });
  }

  public fecharDetalhes(): void {
    this.gavetaAberta.set(false);
  }

  // Ações de Ativação
  public ativarTrilha(trilhaId: number, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.idEmAcao.set(trilhaId);
    this.trilhaService.ativarTrilha(trilhaId).subscribe({
      next: () => {
        this.idEmAcao.set(null);
        // Atualiza a listagem local
        this.carregarCatalogo();
      },
      error: () => {
        this.idEmAcao.set(null);
      }
    });
  }

  public desativarTrilha(trilhaId: number, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.idEmAcao.set(trilhaId);
    this.trilhaService.desativarTrilha(trilhaId).subscribe({
      next: () => {
        this.idEmAcao.set(null);
        this.carregarCatalogo();
      },
      error: () => {
        this.idEmAcao.set(null);
      }
    });
  }

  public excluirTrilha(trilhaId: number, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    const confirma = window.confirm('Deseja realmente excluir esta trilha? Essa ação não pode ser desfeita.');
    if (!confirma) return;

    this.idEmAcao.set(trilhaId);
    this.trilhaService.removerTrilha(trilhaId).subscribe({
      next: () => {
        this.idEmAcao.set(null);
        if (this.trilhaDetalhes()?.id === trilhaId) {
          this.fecharDetalhes();
        }
        this.carregarCatalogo();
        this.trilhaService.carregarTrilhaAtiva().subscribe();
      },
      error: () => {
        this.idEmAcao.set(null);
      }
    });
  }

  public navegarParaQuestao(questaoId: number, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.fecharDetalhes();
    this.router.navigate(['/questoes', questaoId]);
  }

  public getDificuldadeTexto(dif?: number): string {
    switch (dif) {
      case 1: return 'Fácil';
      case 2: return 'Médio';
      case 3: return 'Difícil';
      default: return 'Geral';
    }
  }

  public getDificuldadeClasse(dif?: number): string {
    switch (dif) {
      case 1: return 'dif-facil';
      case 2: return 'dif-media';
      case 3: return 'dif-dificil';
      default: return 'dif-geral';
    }
  }

  public getTrilhaTag(trilha: TrilhaResumo): string {
    if (trilha.itens && trilha.itens.length > 0 && trilha.itens[0].materia) {
      return trilha.itens[0].materia.toUpperCase();
    }
    if (trilha.titulo && trilha.titulo.includes('—')) {
      const parte = trilha.titulo.split('—')[0].trim();
      if (parte.length <= 16) return parte.toUpperCase();
    }
    if (trilha.titulo && trilha.titulo.includes('-')) {
      const parte = trilha.titulo.split('-')[0].trim();
      if (parte.length <= 16) return parte.toUpperCase();
    }
    return 'ESTUDO';
  }
}
