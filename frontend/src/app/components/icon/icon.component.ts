import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './icon.component.html',
  styleUrl: './icon.component.css'
})
export class IconComponent {
  @Input() name: string = '';
  @Input() size: number | string = 18;
  @Input() color: string = 'currentColor';
  @Input() fill: string = 'none';
  @Input() strokeWidth: number | string = 2;
}
