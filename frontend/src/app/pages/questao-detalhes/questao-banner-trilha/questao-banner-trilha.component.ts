import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../../components/icon/icon.component';

@Component({
  selector: 'app-questao-banner-trilha',
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent],
  templateUrl: './questao-banner-trilha.component.html',
  styleUrl: './questao-banner-trilha.component.css'
})
export class QuestaoBannerTrilhaComponent {
  @Input() slotTrilha: any = null;
  @Input() trilhaAtiva: any = null;
  @Input() anteriorSlot: any = null;
  @Input() proximoSlot: any = null;
  @Input() alternandoTrilha: boolean = false;

  @Output() alternarConclusao = new EventEmitter<void>();
}
