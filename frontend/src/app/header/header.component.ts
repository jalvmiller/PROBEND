import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AvatarComponent } from '../components/avatar/avatar.component';

/**
 * HeaderComponent: Barra de navegação superior global
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

  public logout(): void {
    this.authService.logout();
  }
}
