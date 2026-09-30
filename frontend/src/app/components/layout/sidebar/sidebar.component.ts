import { Component, OnInit, inject, signal, HostListener, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SidebarService } from '../../../services/sidebar.service';
import { AuthService } from '../../../services/auth.service';
import { PerfilService } from '../../../services/perfil.service';
import { KatexDirective } from '../../../directives/katex.directive';
import { AvatarComponent } from '../../avatar/avatar.component';
import { RoleBadgeComponent } from '../../role-badge/role-badge.component';
import { Questao } from '../../../models/questao.model';
import { MinhaResolucao, MeuComentario, PainelSidebar } from '../../../models/perfil.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    KatexDirective,
    AvatarComponent,
    RoleBadgeComponent
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit {
  public readonly sidebarService = inject(SidebarService);
  public readonly authService = inject(AuthService);
  public readonly perfilService = inject(PerfilService);
  private readonly router = inject(Router);

  // Atividades do Usuário
  public questoes = signal<Questao[]>([]);
  public resolucoes = signal<MinhaResolucao[]>([]);
  public comentarios = signal<MeuComentario[]>([]);
  public loadingAtividades = signal<boolean>(false);

  // Controle de expansão do enunciado no card da sidebar
  public cardsExpandidos = signal<Set<number>>(new Set<number>());

  // Preferências Rápidas
  public temaEscuro = signal<boolean>(true);
  public vimAtivo = signal<boolean>(false);

  constructor() {
    // Quando abrir a sidebar ou alternar o painel secundário, recarrega as listas de atividades
    effect(() => {
      const aberta = this.sidebarService.aberta();
      const secundario = this.sidebarService.painelSecundario();
      if (aberta) {
        this.carregarAtividades();
      }
    });
  }

  public get tituloSecundario(): string {
    switch (this.sidebarService.painelSecundario()) {
      case 'questoes': return 'Minhas Questões';
      case 'resolucoes': return 'Minhas Resoluções';
      case 'comentarios': return 'Meus Comentários';
      default: return '';
    }
  }

  public get contadorSecundario(): number {
    switch (this.sidebarService.painelSecundario()) {
      case 'questoes': return this.questoes().length;
      case 'resolucoes': return this.resolucoes().length;
      case 'comentarios': return this.comentarios().length;
      default: return 0;
    }
  }

  ngOnInit(): void {
    const temaSalvo = localStorage.getItem('theme');
    if (temaSalvo) {
      this.temaEscuro.set(temaSalvo === 'dark');
      document.documentElement.setAttribute('data-theme', temaSalvo);
    } else {
      const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
      this.temaEscuro.set(isDark);
    }

    const vimSalvo = localStorage.getItem('vim_mode');
    if (vimSalvo) {
      this.vimAtivo.set(vimSalvo === 'true');
    }
  }

  /**
   * Listener global de teclado: pressionar Escape fecha a janela secundária ou a gaveta inteira
   */
  @HostListener('document:keydown.escape')
  public onEscape(): void {
    if (this.sidebarService.painelSecundario()) {
      this.sidebarService.fecharSecundario();
    } else if (this.sidebarService.aberta()) {
      this.sidebarService.fechar();
    }
  }

  public carregarAtividades(): void {
    this.loadingAtividades.set(true);

    this.perfilService.obterMinhasQuestoes().subscribe({
      next: (q) => this.questoes.set(q || []),
      error: () => this.questoes.set([])
    });

    this.perfilService.obterMinhasResolucoes().subscribe({
      next: (r) => this.resolucoes.set(r || []),
      error: () => this.resolucoes.set([])
    });

    this.perfilService.obterMeusComentarios().subscribe({
      next: (c) => {
        this.comentarios.set(c || []);
        this.loadingAtividades.set(false);
      },
      error: () => {
        this.comentarios.set([]);
        this.loadingAtividades.set(false);
      }
    });
  }

  public navegarPara(painel: PainelSidebar): void {
    this.sidebarService.navegarPara(painel);
  }

  public voltar(): void {
    this.sidebarService.voltarAoMenu();
  }

  public abrirPainel(painel: PainelSidebar): void {
    if (painel === 'menu') {
      this.sidebarService.abrir('menu');
      this.sidebarService.fecharSecundario();
    } else {
      this.sidebarService.abrir('menu');
      this.sidebarService.toggleSecundario(painel as 'questoes' | 'resolucoes' | 'comentarios');
    }
  }

  public alternarTema(): void {
    const novoEstado = !this.temaEscuro();
    this.temaEscuro.set(novoEstado);
    const themeName = novoEstado ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', themeName);
    localStorage.setItem('theme', themeName);
  }

  public alternarVim(): void {
    const novo = !this.vimAtivo();
    this.vimAtivo.set(novo);
    localStorage.setItem('vim_mode', String(novo));
  }

  public toggleExpandirCard(id: number, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.cardsExpandidos.update(set => {
      const novo = new Set(set);
      if (novo.has(id)) {
        novo.delete(id);
      } else {
        novo.add(id);
      }
      return novo;
    });
  }

  public isCardExpandido(id: number): boolean {
    return this.cardsExpandidos().has(id);
  }

  public navegarParaQuestao(questaoId: number): void {
    this.sidebarService.fechar();
    this.router.navigate(['/questoes', questaoId]);
  }

  public navegarParaConfiguracoes(): void {
    this.sidebarService.fechar();
    this.router.navigate(['/configuracoes']);
  }

  public logout(): void {
    this.sidebarService.fechar();
    this.authService.logout();
  }
}
