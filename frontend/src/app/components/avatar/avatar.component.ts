import { Component, Input, OnChanges, SimpleChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Usuario } from '../../models/auth.model';

export type AvatarTamanho = 'mini' | 'badge' | 'circulo' | 'lg' | 'xl';

/**
 * AvatarComponent
 *
 * Componente standalone reutilizável para renderização de foto de perfil com fallback de iniciais.
 * Trata automaticamente:
 * 1. Resolução de caminhos relativos de storage ("/midia/imagens/...") para a rota proxy "/api/midia/imagens/...".
 * 2. URLs absolutas (http/https).
 * 3. Fallback visual caso a imagem não exista ou falhe no carregamento (erro de rede/404).
 */
@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './avatar.component.html',
  styleUrl: './avatar.component.css'
})
export class AvatarComponent implements OnChanges {
  @Input() usuario?: Usuario | null;
  @Input() customUrl?: string | null;
  @Input() tamanho: AvatarTamanho = 'circulo';
  @Input() altText?: string;

  public imagemComErro = signal<boolean>(false);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['usuario'] || changes['customUrl']) {
      this.imagemComErro.set(false);
    }
  }

  public get urlAvatar(): string | null {
    if (this.imagemComErro()) {
      return null;
    }

    const raw = this.customUrl || this.usuario?.avatar;
    if (!raw || !raw.trim()) {
      return null;
    }

    const trimmed = raw.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }

    if (trimmed.startsWith('/api/')) {
      return trimmed;
    }

    return trimmed.startsWith('/') ? `/api${trimmed}` : `/api/${trimmed}`;
  }

  public get inicial(): string {
    const nome = this.usuario?.nome || this.usuario?.username;
    if (!nome) return 'U';
    return nome.trim().charAt(0).toUpperCase();
  }

  public get descricaoAlt(): string {
    if (this.altText) return this.altText;
    const nome = this.usuario?.nome || this.usuario?.username;
    return nome ? `Avatar de ${nome}` : 'Foto de perfil';
  }

  public onImgError(): void {
    this.imagemComErro.set(true);
  }
}
