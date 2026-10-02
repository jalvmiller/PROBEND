import { Directive, ElementRef, Output, EventEmitter, HostListener, Input, Renderer2, inject, OnInit } from '@angular/core';

@Directive({
  selector: '[appSplitResizer]',
  standalone: true
})
export class SplitResizerDirective implements OnInit {
  @Input() containerSelector = '.split-container';
  @Input() minLeftPct = 28;
  @Input() maxLeftPct = 72;
  @Input() storageKey = 'probend_split_left_pct';
  @Input() defaultPct = 52;
  
  @Output() resizePct = new EventEmitter<number>();
  @Output() resizeStart = new EventEmitter<void>();
  @Output() resizeEnd = new EventEmitter<void>();

  private readonly el = inject(ElementRef);
  private readonly renderer = inject(Renderer2);

  private isDragging = false;
  private unlistenMouseMove?: () => void;
  private unlistenMouseUp?: () => void;

  ngOnInit() {
    const saved = localStorage.getItem(this.storageKey);
    const initial = saved ? Number(saved) : this.defaultPct;
    this.resizePct.emit(initial);
  }

  @HostListener('mousedown', ['$event'])
  onMouseDown(e: MouseEvent): void {
    e.preventDefault();
    this.isDragging = true;
    this.resizeStart.emit();

    this.renderer.setStyle(document.body, 'cursor', 'col-resize');
    this.renderer.setStyle(document.body, 'userSelect', 'none');

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
    
    this.renderer.removeStyle(document.body, 'cursor');
    this.renderer.removeStyle(document.body, 'userSelect');
    
    if (this.unlistenMouseMove) {
        this.unlistenMouseMove();
    }
    if (this.unlistenMouseUp) {
        this.unlistenMouseUp();
    }

    this.resizeEnd.emit();
  }
}
