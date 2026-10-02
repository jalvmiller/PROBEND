import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterLink } from '@angular/router';
import { filter } from 'rxjs/operators';
import { TrilhaService } from '../../services/trilha.service';

@Component({
  selector: 'app-trilha-tracker',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './trilha-tracker.component.html',
  styleUrl: './trilha-tracker.component.css'
})
export class TrilhaTrackerComponent implements OnInit {
  public readonly trilhaService = inject(TrilhaService);
  private readonly router = inject(Router);

  public readonly circumference = 2 * Math.PI * 40; // ~251.32
  public readonly questaoIdAtual = signal<number | null>(null);

  public readonly slotAtual = computed(() => {
    const ativa = this.trilhaService.trilhaAtiva();
    const qId = this.questaoIdAtual();
    if (!ativa || !qId) return null;
    return ativa.slots.find(s => s.questaoId === qId) || null;
  });

  // ==========================================
  // REDIMENSIONAMENTO DO CARD (HUD)
  // ==========================================
  public readonly DEFAULT_LARGURA = 384; // 24rem
  public readonly MIN_LARGURA = 280;
  public readonly MAX_LARGURA = 580;
  public readonly STORAGE_LARGURA_KEY = 'probend_trilha_largura';

  public readonly larguraCard = signal<number>(this.DEFAULT_LARGURA);
  public readonly isResizing = signal<boolean>(false);

  public readonly strokeDashoffset = computed(() => {
    const ativa = this.trilhaService.trilhaAtiva();
    if (!ativa || ativa.totalQuestoes === 0) {
      return this.circumference;
    }
    return this.circumference - (ativa.concluidas / ativa.totalQuestoes) * this.circumference;
  });

  constructor() {
    const larguraSalva = localStorage.getItem(this.STORAGE_LARGURA_KEY);
    if (larguraSalva) {
      const num = Number(larguraSalva);
      if (!isNaN(num) && num >= this.MIN_LARGURA && num <= this.MAX_LARGURA) {
        this.larguraCard.set(num);
      }
    }

    this.atualizarQuestaoIdAtual();
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => this.atualizarQuestaoIdAtual());
  }

  public iniciarArrasto(e: MouseEvent): void {
    e.preventDefault();
    e.stopPropagation();
    this.isResizing.set(true);
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';

    const startX = e.clientX;
    const startWidth = this.larguraCard();

    const onMouseMove = (moveEvent: MouseEvent) => {
      // Como o card está ancorado à direita da tela, puxar o cursor para a ESQUERDA
      // (startX - clientX > 0) aumenta a largura do card
      const deltaX = startX - moveEvent.clientX;
      const novaLargura = Math.round(startWidth + deltaX);
      const clamped = Math.min(this.MAX_LARGURA, Math.max(this.MIN_LARGURA, novaLargura));
      this.larguraCard.set(clamped);
    };

    const onMouseUp = () => {
      this.isResizing.set(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      localStorage.setItem(this.STORAGE_LARGURA_KEY, String(this.larguraCard()));
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }

  public iniciarArrastoTouch(e: TouchEvent): void {
    if (!e.touches || e.touches.length === 0) return;
    this.isResizing.set(true);

    const startX = e.touches[0].clientX;
    const startWidth = this.larguraCard();

    const onTouchMove = (moveEvent: TouchEvent) => {
      if (!moveEvent.touches || moveEvent.touches.length === 0) return;
      const deltaX = startX - moveEvent.touches[0].clientX;
      const novaLargura = Math.round(startWidth + deltaX);
      const clamped = Math.min(this.MAX_LARGURA, Math.max(this.MIN_LARGURA, novaLargura));
      this.larguraCard.set(clamped);
    };

    const onTouchEnd = () => {
      this.isResizing.set(false);
      localStorage.setItem(this.STORAGE_LARGURA_KEY, String(this.larguraCard()));
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };

    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onTouchEnd);
  }

  public resetarTamanho(e: Event): void {
    e.stopPropagation();
    this.larguraCard.set(this.DEFAULT_LARGURA);
    localStorage.removeItem(this.STORAGE_LARGURA_KEY);
  }

  public ngOnInit(): void {
    this.trilhaService.carregarTrilhaAtiva().subscribe();
  }

  private atualizarQuestaoIdAtual(): void {
    const match = this.router.url.match(/\/questoes\/(\d+)/);
    if (match) {
      this.questaoIdAtual.set(Number(match[1]));
    } else {
      this.questaoIdAtual.set(null);
    }
  }

  public navegarParaQuestao(questaoId: number): void {
    this.router.navigate(['/questoes', questaoId]);
  }

  public toggleConclusao(event: Event, itemId: number): void {
    event.stopPropagation();
    const ativa = this.trilhaService.trilhaAtiva();
    if (ativa) {
      this.trilhaService.alternarConclusao(ativa.trilhaId, itemId).subscribe();
    }
  }

  public toggleRecolher(): void {
    this.trilhaService.toggleRecolhido();
  }
}
