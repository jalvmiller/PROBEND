import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarService } from '../../../services/sidebar.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  public readonly sidebarService = inject(SidebarService);
  public readonly authService = inject(AuthService);

  public logout(): void {
    this.sidebarService.fecharMobile();
    this.authService.logout();
  }
}
