import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from 'src/app/core/service/auth.service';
import { LoginRequest, RegisterRequest } from '../../models/user.model';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  selectedTab = 0;
  loading = false;

  loginForm: FormGroup;
  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.createLoginForm();
    this.registerForm = this.createRegisterForm();
  }

  ngOnInit(): void {
    // Se já estiver autenticado, redireciona para dashboard
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  private createLoginForm(): FormGroup {
    return this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  private createRegisterForm(): FormGroup {
    return this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  private passwordMatchValidator(g: FormGroup) {
    const password = g.get('password')?.value;
    const confirmPassword = g.get('confirmPassword')?.value;
    
    return password === confirmPassword ? null : { mismatch: true };
  }

  onLogin(): void {
    if (this.loginForm.valid) {
      this.loading = true;
      const loginData: LoginRequest = this.loginForm.value;

      this.authService.login(loginData).subscribe({
        next: (response) => {
          this.loading = false;
          this.snackBar.open(`Bem-vindo, ${response.user.fullName}!`, 'Fechar', { 
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.loading = false;
          const errorMessage = error.error?.message || 
                             error.error?.errors?.[0] || 
                             'Erro ao fazer login. Tente novamente.';
          
          this.snackBar.open(errorMessage, 'Fechar', { 
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    } else {
      this.markFormGroupTouched(this.loginForm);
    }
  }

  onRegister(): void {
    if (this.registerForm.valid) {
      this.loading = true;
      const registerData: RegisterRequest = this.registerForm.value;

      this.authService.register(registerData).subscribe({
        next: (response) => {
          this.loading = false;
          this.snackBar.open(`Conta criada com sucesso! Bem-vindo, ${response.user.fullName}!`, 'Fechar', { 
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.loading = false;
          const errorMessage = error.error?.message || 
                             error.error?.errors?.[0] || 
                             'Erro ao cadastrar. Tente novamente.';
          
          this.snackBar.open(errorMessage, 'Fechar', { 
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    } else {
      this.markFormGroupTouched(this.registerForm);
    }
  }

  onTabChange(event: any): void {
    this.selectedTab = event.index;
    // Limpa os forms ao trocar de tab
    this.loginForm.reset();
    this.registerForm.reset();
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }
}