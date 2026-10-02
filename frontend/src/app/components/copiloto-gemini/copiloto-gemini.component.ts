import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuestaoService } from '../../services/questao.service';
import { Questao } from '../../models/questao.model';

@Component({
  selector: 'app-copiloto-gemini',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './copiloto-gemini.component.html',
  styleUrl: './copiloto-gemini.component.css',
})
export class CopilotoGeminiComponent {
  @Input() rascunhoAtual: string = '';

  @Output() sugestaoGerada = new EventEmitter<any>();
  @Output() publicadaDireto = new EventEmitter<Questao>();

  private readonly questaoService = inject(QuestaoService);

  // Estados locais do Copiloto
  public copilotoAberto = signal<boolean>(false);
  public promptIA = signal<string>('');
  public gerandoIA = signal<boolean>(false);

  public toggleCopiloto(): void {
    this.copilotoAberto.update((aberto) => !aberto);
  }

  public fecharCopiloto(): void {
    if (!this.gerandoIA()) {
      this.copilotoAberto.set(false);
    }
  }

  public gerarEsbocoIA(): void {
    const prompt = (this.promptIA() || '').trim();
    if (!prompt) {
      alert('Digite uma descrição ou ideia para o Copiloto Gemini.');
      return;
    }

    this.gerandoIA.set(true);
    this.questaoService.iaSugerir(prompt, this.rascunhoAtual || '').subscribe({
      next: (dados) => {
        if (dados) {
          this.sugestaoGerada.emit(dados);
        }
        this.gerandoIA.set(false);
      },
      error: () => {
        alert('Erro ao obter sugestão da IA. Verifique as credenciais da API Gemini.');
        this.gerandoIA.set(false);
      },
    });
  }

  public criarTotalIA(): void {
    const prompt = (this.promptIA() || '').trim();
    if (!prompt) {
      alert('Digite uma descrição ou ideia para o Copiloto Gemini.');
      return;
    }

    this.gerandoIA.set(true);
    this.questaoService.iaCriarTotal(prompt).subscribe({
      next: (q) => {
        this.gerandoIA.set(false);
        this.publicadaDireto.emit(q);
      },
      error: () => {
        alert('Erro ao publicar questão com IA. Verifique as credenciais da API Gemini.');
        this.gerandoIA.set(false);
      },
    });
  }
}
