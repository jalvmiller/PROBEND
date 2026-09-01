import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

/**
 * LoginComponent — Componente Standalone da tela de login
 *
 * Comparativo React ➔ Angular:
 * - Em React: Criávamos estados com `useState('user')` e fazíamos inputs manuais `onChange={(e) => setUsername(e.target.value)}`.
 * - Em Angular: Usamos **Reactive Forms** (`FormBuilder` / `FormGroup`). O controle de estado, validação síncrona
 *   e estado do formulário (`valid`, `touched`, `dirty`) são gerenciados de forma robusta e tipada pelo Angular.
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // Signals para estados visuais locais
  public isSubmitting = signal<boolean>(false);
  public showPassword = signal<boolean>(false);
  public errorMessage = signal<string>('');

  // Formulário Reativo tipado com valores iniciais para demonstração
  public loginForm = this.fb.group({
    username: ['user', [Validators.required]],
    password: ['user123', [Validators.required, Validators.minLength(6)]]
  });

  public alternarVisibilidadeSenha(): void {
    this.showPassword.update(visivel => !visivel);
  }

  public onSubmit(): void {
    if (this.loginForm.invalid || this.isSubmitting()) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    const credenciais = {
      username: this.loginForm.value.username!.trim(),
      password: this.loginForm.value.password!
    };

    this.authService.login(credenciais).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        const msg = err.error?.erro || 'Usuário ou senha incorretos.';
        this.errorMessage.set(msg);
      }
    });
  }

  public entrarComoVisitante(): void {
    if (this.isSubmitting()) return;
    this.isSubmitting.set(true);
    this.errorMessage.set('');

    this.authService.visitorSession().subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        const msg = err.error?.erro || 'Não foi possível iniciar a sessão de visitante.';
        this.errorMessage.set(msg);
      }
    });
  }
}
