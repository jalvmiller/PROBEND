import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})

// Signal = variável reativa
// update = método que atualiza o valor do signal
// set = método que define um novo valor para o signal

export class AppComponent {
  // 1. Variável de estado simples usando Signal
  public titulo = signal('PROBEND - Lab');

  // 2. Um contador numérico reativo
  public contador = signal(0);

  // 3. Uma mensagem de texto dinâmica
  public mensagem = signal('');

  // Métodos que alteram o estado
  public incrementar(): void {
    this.contador.update(valorAtual => valorAtual + 1);
  }

  public decrementar(): void {
    this.contador.update(valorAtual => valorAtual - 1);
  }

  public atualizarMensagem(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    this.mensagem.set(input.value);
  }
}