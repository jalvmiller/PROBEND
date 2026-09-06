import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-configuracoes',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './configuracoes.component.html',
  styleUrl: './configuracoes.component.css'
})
export class ConfiguracoesComponent implements OnInit {
  public readonly authService = inject(AuthService);

  public temaEscuro = signal<boolean>(true);
  public enviandoAvatar = signal<boolean>(false);
  public mensagemSucesso = signal<string>('');
  public mensagemErro = signal<string>('');
  public vimAtivo = signal<boolean>(false);

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

  public onAvatarFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    this.enviandoAvatar.set(true);
    this.mensagemSucesso.set('');
    this.mensagemErro.set('');

    this.authService.uploadAvatar(file).subscribe({
      next: () => {
        this.enviandoAvatar.set(false);
        this.mensagemSucesso.set('Foto de perfil atualizada com sucesso!');
        setTimeout(() => this.mensagemSucesso.set(''), 4000);
      },
      error: () => {
        this.enviandoAvatar.set(false);
        this.mensagemErro.set('Erro ao atualizar foto de perfil.');
        setTimeout(() => this.mensagemErro.set(''), 4000);
      }
    });
  }

  public obterRoleLabel(): string {
    const u = this.authService.currentUser();
    if (u?.administrador) return 'Administrador';
    if (u?.especialista) return 'Especialista';
    return 'Estudante / Membro';
  }

  public getAvatarUrl(): string | null {
    const avatar = this.authService.currentUser()?.avatar;
    if (!avatar) return null;
    if (avatar.startsWith('http://') || avatar.startsWith('https://')) return avatar;
    return avatar.startsWith('/api') ? avatar : `/api${avatar.startsWith('/') ? '' : '/'}${avatar}`;
  }
}
