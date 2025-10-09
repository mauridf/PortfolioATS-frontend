import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ProfileService } from '../../../core/service/profile.service';
import { Profile, ProfileRequest } from '../../../models/profile.model';
import { PdfService } from 'src/app/core/service/pdf.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  profile!: Profile;
  loading = false;
  editing = false;
  profileForm: FormGroup;
  generatingPdf = false;

  // Estatísticas
  profileCompleteness = 0;
  missingFields: string[] = [];

  constructor(
    private profileService: ProfileService,
    private pdfService: PdfService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.profileForm = this.createProfileForm();
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  createProfileForm(): FormGroup {
    return this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: [{ value: '', disabled: true }], // Email não é editável
      phone: ['', [Validators.required, Validators.minLength(10)]],
      location: ['', [Validators.required, Validators.minLength(3)]],
      professionalSummary: ['', [Validators.required, Validators.minLength(50)]]
    });
  }

  loadProfile(): void {
    this.loading = true;
    this.profileService.getProfile().subscribe({
      next: (data) => {
        this.profile = data;
        this.updateFormWithProfileData();
        this.calculateProfileMetrics();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        this.snackBar.open('Erro ao carregar perfil', 'Fechar', { duration: 5000 });
        this.loading = false;
      }
    });
  }

  updateFormWithProfileData(): void {
    this.profileForm.patchValue({
      fullName: this.profile.fullName || '',
      email: this.profile.email || '',
      phone: this.profile.phone || '',
      location: this.profile.location || '',
      professionalSummary: this.profile.professionalSummary || ''
    });
  }

  calculateProfileMetrics(): void {
    this.profileCompleteness = this.profileService.calculateProfileCompleteness(this.profile);
    this.missingFields = this.profileService.getMissingRequiredFields(this.profile);
  }

  toggleEdit(): void {
    this.editing = !this.editing;
    if (!this.editing) {
      this.updateFormWithProfileData();
    }
  }

  saveProfile(): void {
    if (this.profileForm.valid) {
      this.loading = true;
      const profileData: ProfileRequest = this.profileForm.getRawValue();

      this.profileService.updateProfile(profileData).subscribe({
        next: (updatedProfile) => {
          this.profile = updatedProfile;
          this.editing = false;
          this.calculateProfileMetrics();
          this.loading = false;
          this.snackBar.open('Perfil atualizado com sucesso!', 'Fechar', { duration: 3000 });
        },
        error: (error) => {
          console.error('Error updating profile:', error);
          this.snackBar.open('Erro ao atualizar perfil', 'Fechar', { duration: 5000 });
          this.loading = false;
        }
      });
    } else {
      this.markFormGroupTouched(this.profileForm);
    }
  }

  cancelEdit(): void {
    this.editing = false;
    this.updateFormWithProfileData();
  }

  navigateToSection(section: string): void {
    this.router.navigate([`/${section}`]);
  }

  getProgressColor(percentage: number): string {
    if (percentage >= 80) return '#4CAF50';
    if (percentage >= 60) return '#FF9800';
    return '#F44336';
  }

  getCompletionMessage(): string {
    if (this.profileCompleteness >= 90) return 'Perfil Excelente!';
    if (this.profileCompleteness >= 70) return 'Perfil Bom';
    if (this.profileCompleteness >= 50) return 'Perfil em Andamento';
    return 'Perfil Incompleto';
  }

  // NOVO MÉTODO PARA GERAR PDF
  async generatePdf(): Promise<void> {
    this.generatingPdf = true;
    try {
      await this.pdfService.generateATSCV();
      this.snackBar.open('Currículo gerado com sucesso!', 'Fechar', { duration: 3000 });
    } catch (error) {
      console.error('Error generating PDF:', error);
      this.snackBar.open('Erro ao gerar currículo', 'Fechar', { duration: 5000 });
    } finally {
      this.generatingPdf = false;
    }
  }
  
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }
}