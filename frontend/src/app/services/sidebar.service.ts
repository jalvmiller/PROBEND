import { Injectable, signal } from '@angular/core';
import { PainelSidebar, PainelSecundario } from '../models/perfil.model';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  /**
   * Estado de abertura do Overlay Drawer da Sidebar (Eixo Z = 1000)
   */
  public readonly aberta = signal<boolean>(false);

  /**
   * Painel atualmente ativo dentro da Sidebar principal:
   * 'menu' | 'questoes' | 'resolucoes' | 'comentarios'
   */
  public readonly painelAtivo = signal<PainelSidebar>('menu');

  /**
   * Janela secundária que se expande para a direita (Cascading Flyout):
   * 'questoes' | 'resolucoes' | 'comentarios' | null
   */
  public readonly painelSecundario = signal<PainelSecundario>(null);

  // Mantido para compatibilidade com eventuais referências existentes
  public readonly colapsada = signal<boolean>(true);
  public readonly mobileAberta = this.aberta;

  public abrir(painel: PainelSidebar = 'menu'): void {
    this.painelAtivo.set(painel);
    this.aberta.set(true);
    this.colapsada.set(false);
  }

  public fechar(): void {
    this.aberta.set(false);
    this.colapsada.set(true);
    this.painelSecundario.set(null);
  }

  public toggle(painel?: PainelSidebar): void {
    if (this.aberta()) {
      this.fechar();
    } else {
      this.abrir(painel || 'menu');
    }
  }

  /**
   * Abre ou recolhe a janela secundária à direita para o painel selecionado
   */
  public toggleSecundario(painel: 'questoes' | 'resolucoes' | 'comentarios'): void {
    if (this.painelSecundario() === painel) {
      this.painelSecundario.set(null);
    } else {
      this.aberta.set(true);
      this.colapsada.set(false);
      this.painelSecundario.set(painel);
    }
  }

  public fecharSecundario(): void {
    this.painelSecundario.set(null);
  }

  public navegarPara(painel: PainelSidebar): void {
    this.painelAtivo.set(painel);
  }

  public voltarAoMenu(): void {
    this.painelAtivo.set('menu');
  }

  // Métodos retrocompatíveis com implementações anteriores
  public alternarColapso(): void {
    this.toggle();
  }

  public toggleMobile(): void {
    this.toggle();
  }

  public fecharMobile(): void {
    this.fechar();
  }
}
