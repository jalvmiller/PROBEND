import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Usuario } from '../../models/auth.model';

@Component({
  selector: 'app-role-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './role-badge.component.html',
  styleUrl: './role-badge.component.css'
})
export class RoleBadgeComponent {
  @Input() usuario?: Usuario | null;

  public get isAdmin(): boolean {
    return !!this.usuario?.administrador;
  }

  public get isEspecialista(): boolean {
    return !this.isAdmin && !!this.usuario?.especialista;
  }

  public get isComum(): boolean {
    return !this.isAdmin && !this.isEspecialista;
  }
}
