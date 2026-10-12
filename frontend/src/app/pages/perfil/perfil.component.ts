import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { PerfilService } from '../../services/perfil.service';
import { Questao } from '../../models/questao.model';
import { MinhaResolucao, MeuComentario } from '../../models/perfil.model';
import { AvatarComponent } from '../../components/avatar/avatar.component';
import { RoleBadgeComponent } from '../../components/role-badge/role-badge.component';
import { IconComponent } from '../../components/icon/icon.component';
import { KatexDirective } from '../../directives/katex.directive';

export type AbaPerfil = 'questoes' | 'resolucoes' | 'comentarios';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    AvatarComponent,
    RoleBadgeComponent,
    IconComponent,
    KatexDirective,
  ],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css',
})
export class PerfilComponent implements OnInit {
  public auth = inject(AuthService);
  public perfilService = inject(PerfilService);
  public router = inject(Router);

  public abaAtiva = signal<AbaPerfil>('questoes');
  public questoes = signal<Questao[]>([]);
  public resolucoes = signal<MinhaResolucao[]>([]);
  public comentarios = signal<MeuComentario[]>([]);
  public carregando = signal<boolean>(true);
  public cardsExpandidos = signal<Set<number>>(new Set<number>());

  ngOnInit(): void {
    this.carregarDadosPerfil();
  }

  public carregarDadosPerfil(): void {
    this.carregando.set(true);

    forkJoin({
      questoes: this.perfilService.obterMinhasQuestoes(),
      resolucoes: this.perfilService.obterMinhasResolucoes(),
      comentarios: this.perfilService.obterMeusComentarios(),
    }).subscribe({
      next: ({ questoes, resolucoes, comentarios }) => {
        this.questoes.set(questoes || []);
        this.resolucoes.set(resolucoes || []);
        this.comentarios.set(comentarios || []);
        this.carregando.set(false);
      },
      error: () => {
        this.carregando.set(false);
      },
    });
  }

  public selecionarAba(aba: AbaPerfil): void {
    this.abaAtiva.set(aba);
  }

  public toggleExpandirCard(id: number, event?: Event): void {
    if (event) event.stopPropagation();
    this.cardsExpandidos.update((set) => {
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
    this.router.navigate(['/questoes', questaoId]);
  }
}
