import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

/**
 * RegisterComponent: Tela de cadastro de novos usuários com Reactive Forms e Signals
 */
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  public isSubmitting = signal<boolean>(false);
  public showPassword = signal<boolean>(false);
  public errorMessage = signal<string>('');

  public registerForm = this.fb.group({
    nome: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    username: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  public alternarVisibilidadeSenha(): void {
    this.showPassword.update(visivel => !visivel);
  }

  public onSubmit(): void {
    if (this.registerForm.invalid || this.isSubmitting()) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    const dados = {
      nome: this.registerForm.value.nome!.trim(),
      email: this.registerForm.value.email!.trim(),
      username: this.registerForm.value.username!.trim(),
      password: this.registerForm.value.password!
    };

    this.authService.register(dados).subscribe({
      next: () => {
        // Efetua login automaticamente após o cadastro bem-sucedido
        this.authService.login({
          username: dados.username,
          password: dados.password
        }).subscribe({
          next: () => {
            this.isSubmitting.set(false);
            this.router.navigate(['/']);
          },
          error: () => {
            this.isSubmitting.set(false);
            this.router.navigate(['/login']);
          }
        });
      },
      error: (err) => {
        this.isSubmitting.set(false);
        const msg = err.error?.erro || err.error?.message || 'Erro ao realizar o cadastro. Verifique os dados informados.';
        this.errorMessage.set(msg);
      }
    });
  }
}
