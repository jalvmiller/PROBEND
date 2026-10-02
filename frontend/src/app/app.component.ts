import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { HeaderComponent } from './components/layout/header/header.component';
import { SidebarComponent } from './components/layout/sidebar/sidebar.component';
import { TrilhaTrackerComponent } from './components/trilha-tracker/trilha-tracker.component';
import { AuthService } from './services/auth.service';
import { SidebarService } from './services/sidebar.service';
import { TrilhaService } from './services/trilha.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, SidebarComponent, TrilhaTrackerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  public readonly authService = inject(AuthService);
  public readonly sidebarService = inject(SidebarService);
  public readonly trilhaService = inject(TrilhaService);
  public readonly router = inject(Router);

  get isAuthRoute(): boolean {
    return this.router.url.startsWith('/login') || this.router.url.startsWith('/register');
  }

  public ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.trilhaService.carregarTrilhaAtiva().subscribe();
    }
  }
}