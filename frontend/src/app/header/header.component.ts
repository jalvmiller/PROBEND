import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  // Signal exclusivo do componente filho
  public nomeApp = signal('PROBEND - Refatoração, testes');
}
