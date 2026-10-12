import { Directive, ElementRef, Output, EventEmitter, HostListener, Input, Renderer2, inject, OnDestroy } from '@angular/core';

/**
 * Diretiva de divisor arrastável (splitter).
 *
 * Responsabilidade única: transformar o movimento do mouse em uma porcentagem (0–100)
 * relativa à largura do container pai. Quem usa a diretiva decide o que fazer com o valor
 * (guardar num signal, persistir no localStorage, etc.).
 */
@Directive({
  selector: '[appSplitResizer]',
  standalone: true
})
export class SplitResizerDirective implements OnDestroy {
  /** Seletor CSS do container cuja largura serve de referência para o cálculo. */
  @Input() containerSelector = '.split-container';
  @Input() minLeftPct = 28;
  @Input() maxLeftPct = 72;

  @Output() resizePct = new EventEmitter<number>();
  @Output() resizeStart = new EventEmitter<void>();
  @Output() resizeEnd = new EventEmitter<void>();

  private readonly el = inject(ElementRef);
  private readonly renderer = inject(Renderer2);

  private isDragging = false;
  private unlistenMouseMove?: () => void;
  private unlistenMouseUp?: () => void;

  @HostListener('mousedown', ['$event'])
  onMouseDown(e: MouseEvent): void {
    e.preventDefault();
    this.isDragging = true;
    this.resizeStart.emit();

    // Evita seleção de texto e mantém o cursor de redimensionamento durante todo o arraste
    this.renderer.setStyle(document.body, 'cursor', 'col-resize');
    this.renderer.setStyle(document.body, 'userSelect', 'none');

    // Escutamos na window (e não no divisor) porque o mouse sai do divisor durante o arraste
    this.unlistenMouseMove = this.renderer.listen('window', 'mousemove', (moveEvent: MouseEvent) => this.onMouseMove(moveEvent));
    this.unlistenMouseUp = this.renderer.listen('window', 'mouseup', () => this.onMouseUp());
  }

  private onMouseMove(e: MouseEvent): void {
    if (!this.isDragging) return;

    const target = this.el.nativeElement as HTMLElement;
    const container = target.closest(this.containerSelector) as HTMLElement;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    if (rect.width <= 0) return;

    const rawPct = ((e.clientX - rect.left) / rect.width) * 100;
    const clamped = Math.min(this.maxLeftPct, Math.max(this.minLeftPct, rawPct));

    this.resizePct.emit(clamped);
  }

  private onMouseUp(): void {
    if (!this.isDragging) return;
    this.isDragging = false;
    this.limparListeners();
    this.resizeEnd.emit();
  }

  /** Garante que nenhum listener fique "pendurado" na window se o componente sumir no meio do arraste. */
  ngOnDestroy(): void {
    this.limparListeners();
  }

  private limparListeners(): void {
    this.renderer.removeStyle(document.body, 'cursor');
    this.renderer.removeStyle(document.body, 'userSelect');
    this.unlistenMouseMove?.();
    this.unlistenMouseUp?.();
    this.unlistenMouseMove = undefined;
    this.unlistenMouseUp = undefined;
  }
}
