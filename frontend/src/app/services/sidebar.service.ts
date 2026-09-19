import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  // A sidebar inicia colapsada por padrão conforme especificado
  public readonly colapsada = signal<boolean>(true);
  public readonly mobileAberta = signal<boolean>(false);

  public alternarColapso(): void {
    this.colapsada.update(v => !v);
  }

  public toggleMobile(): void {
    this.mobileAberta.update(v => !v);
  }

  public fecharMobile(): void {
    this.mobileAberta.set(false);
  }
}
