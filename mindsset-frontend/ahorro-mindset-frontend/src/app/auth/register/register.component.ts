import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

function passwordMatchValidator(control: AbstractControl) {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  if (password && confirmPassword && password !== confirmPassword) {
    control.get('confirmPassword')?.setErrors({ mismatch: true });
  }
  return null;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],

  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  showPassword = signal(false);
  showConfirm = signal(false);
  isLoading = signal(false);
  errorMessage = signal('');

  form = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    apellidos: ['', [Validators.required, Validators.minLength(2)]],
    correo: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required]
  }, { validators: passwordMatchValidator });

  get nombre()          { return this.form.get('nombre')!; }
  get apellidos()       { return this.form.get('apellidos')!; }
  get correo()          { return this.form.get('correo')!; }
  get password()        { return this.form.get('password')!; }
  get confirmPassword() { return this.form.get('confirmPassword')!; }

  readonly features = [
    { icon: '📊', text: 'Visualiza tu progreso en tiempo real' },
    { icon: '🎯', text: 'Establece metas mensuales de ahorro' },
    { icon: '🔒', text: 'Tus datos, 100% seguros y privados' },
  ];

  togglePassword(): void {
    this.showPassword.update(value => !value);
  }

  toggleConfirmPassword(): void {
    this.showConfirm.update(value => !value);
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isLoading.set(true);
    this.errorMessage.set('');
    const { nombre, apellidos, correo, password } = this.form.value;
    this.authService.register({ nombre: nombre!, apellidos: apellidos!, correo: correo!, password: password! })
      .subscribe({
        next: (res) => {
          this.isLoading.set(false);
          if (res.success) this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(err?.error?.message || 'Error al registrar. Intenta de nuevo.');
        }
      });
  }
}
