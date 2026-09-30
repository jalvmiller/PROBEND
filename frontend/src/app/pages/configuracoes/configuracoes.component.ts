import { Component, OnInit, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PerfilService } from '../../services/perfil.service';

@Component({
  selector: 'app-configuracoes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './configuracoes.component.html',
  styleUrl: './configuracoes.component.css'
})
export class ConfiguracoesComponent implements OnInit {
  public readonly authService = inject(AuthService);
  private readonly perfilService = inject(PerfilService);

  // Estados de formulário: Dados Cadastrais
  public nome = signal<string>('');
  public email = signal<string>('');
  public salvandoDados = signal<boolean>(false);
  public mensagemDadosSucesso = signal<string>('');
  public mensagemDadosErro = signal<string>('');

  // Estados de formulário: Alteração de Senha
  public senhaAtual = signal<string>('');
  public novaSenha = signal<string>('');
  public confirmacaoSenha = signal<string>('');
  public salvandoSenha = signal<boolean>(false);
  public mensagemSenhaSucesso = signal<string>('');
  public mensagemSenhaErro = signal<string>('');

  // Preferências
  public temaEscuro = signal<boolean>(true);
  public vimAtivo = signal<boolean>(false);
  public enviandoAvatar = signal<boolean>(false);

  constructor() {
    effect(() => {
      const u = this.authService.currentUser();
      if (u) {
        this.nome.set(u.nome || '');
        this.email.set(u.email || '');
      }
    });
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
    this.mensagemDadosSucesso.set('');
    this.mensagemDadosErro.set('');

    this.authService.uploadAvatar(file).subscribe({
      next: () => {
        this.enviandoAvatar.set(false);
        this.mensagemDadosSucesso.set('Foto de perfil atualizada com sucesso!');
        setTimeout(() => this.mensagemDadosSucesso.set(''), 4000);
      },
      error: () => {
        this.enviandoAvatar.set(false);
        this.mensagemDadosErro.set('Erro ao atualizar foto de perfil.');
        setTimeout(() => this.mensagemDadosErro.set(''), 4000);
      }
    });
  }

  public salvarDados(): void {
    if (!this.nome().trim()) {
      this.mensagemDadosErro.set('O nome não pode ficar em branco.');
      return;
    }
    if (!this.email().trim()) {
      this.mensagemDadosErro.set('O e-mail não pode ficar em branco.');
      return;
    }

    this.salvandoDados.set(true);
    this.mensagemDadosSucesso.set('');
    this.mensagemDadosErro.set('');

    this.perfilService.atualizarDados({
      nome: this.nome().trim(),
      email: this.email().trim().toLowerCase()
    }).subscribe({
      next: () => {
        this.salvandoDados.set(false);
        this.mensagemDadosSucesso.set('Dados cadastrais atualizados com sucesso!');
        setTimeout(() => this.mensagemDadosSucesso.set(''), 4000);
      },
      error: (err) => {
        this.salvandoDados.set(false);
        this.mensagemDadosErro.set(err?.error?.erro || 'Erro ao atualizar dados. Tente novamente.');
      }
    });
  }

  public salvarSenha(): void {
    if (!this.senhaAtual()) {
      this.mensagemSenhaErro.set('Informe sua senha atual.');
      return;
    }
    if (!this.novaSenha() || this.novaSenha().length < 6) {
      this.mensagemSenhaErro.set('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }
    if (this.novaSenha() !== this.confirmacaoSenha()) {
      this.mensagemSenhaErro.set('A confirmação não confere com a nova senha.');
      return;
    }

    this.salvandoSenha.set(true);
    this.mensagemSenhaSucesso.set('');
    this.mensagemSenhaErro.set('');

    this.perfilService.alterarSenha({
      senhaAtual: this.senhaAtual(),
      novaSenha: this.novaSenha(),
      confirmacaoSenha: this.confirmacaoSenha()
    }).subscribe({
      next: (res) => {
        this.salvandoSenha.set(false);
        this.mensagemSenhaSucesso.set(res.mensagem || 'Senha alterada com sucesso!');
        this.senhaAtual.set('');
        this.novaSenha.set('');
        this.confirmacaoSenha.set('');
        setTimeout(() => this.mensagemSenhaSucesso.set(''), 4000);
      },
      error: (err) => {
        this.salvandoSenha.set(false);
        this.mensagemSenhaErro.set(err?.message || err?.error?.erro || 'Erro ao alterar senha.');
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
