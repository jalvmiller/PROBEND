import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { SidebarService } from '../services/sidebar.service';
import { AvatarComponent } from '../components/avatar/avatar.component';

/**
 * HeaderComponent: Barra de navegação superior global
 *
 * Demonstra como o Angular consome Signals de um serviço compartilhado diretamente no template.
 * Ao invés do `useAuth()` do React que forçava re-render do componente todo,
 * os Signals do AuthService notificam apenas as expressões vinculadas no HTML.
 */
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, AvatarComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  public readonly authService = inject(AuthService);
  public readonly sidebarService = inject(SidebarService);

  public logout(): void {
    this.authService.logout();
  }
}
