import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PageEvent } from '@angular/material/paginator';

import { ExperienceService } from 'src/app/core/service/experience.service';
import { Experience, ExperienceRequest } from '../../../models/experience.model';
import { ColumnDefinition } from 'src/app/shared/data-table/data-table.component';

@Component({
  selector: 'app-experiences',
  templateUrl: './experiences.component.html',
  styleUrls: ['./experiences.component.scss']
})
export class ExperiencesComponent implements OnInit {
  experiences: Experience[] = [];
  filteredExperiences: Experience[] = [];
  loading = false;
  searchTerm = '';

  // Table configuration
  columns: ColumnDefinition[] = [
    { key: 'company', header: 'Empresa', sortable: true, width: '200px' },
    { key: 'position', header: 'Cargo', sortable: true, width: '200px' },
    { key: 'employmentType', header: 'Tipo', sortable: true, width: '120px' },
    { key: 'startDate', header: 'Início', type: 'date', sortable: true, width: '120px' },
    { key: 'endDate', header: 'Término', type: 'date', sortable: true, width: '120px' },
    { key: 'isCurrent', header: 'Atual', type: 'boolean', sortable: true, width: '80px' }
  ];

  // Pagination
  pageSize = 10;
  pageIndex = 0;

  // Modal
  experienceForm: FormGroup;
  isEditMode = false;
  selectedExperience: Experience | null = null;

  // Employment types
  employmentTypes = [
    'CLT',
    'PJ',
    'Freelancer',
    'Estágio',
    'Trainee',
    'Voluntário'
  ];

  constructor(
    private experienceService: ExperienceService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.experienceForm = this.createExperienceForm();
  }

  ngOnInit(): void {
    this.loadExperiences();
  }

  createExperienceForm(): FormGroup {
    return this.fb.group({
      company: ['', [Validators.required, Validators.minLength(2)]],
      position: ['', [Validators.required, Validators.minLength(2)]],
      employmentType: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: [''],
      isCurrent: [false],
      description: ['', [Validators.required, Validators.minLength(10)]],
      skillIds: [[]]
    });
  }

  loadExperiences(): void {
    this.loading = true;
    this.experienceService.getAllExperiences().subscribe({
      next: (data) => {
        this.experiences = data || [];
        this.filteredExperiences = [...this.experiences];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading experiences:', error);
        this.snackBar.open('Erro ao carregar experiências', 'Fechar', { duration: 5000 });
        this.experiences = [];
        this.filteredExperiences = [];
        this.loading = false;
      }
    });
  }

  onSearchChange(searchTerm: string): void {
    this.searchTerm = searchTerm;
    if (!this.experiences || this.experiences.length === 0) {
      this.filteredExperiences = [];
      return;
    }
    
    this.filteredExperiences = this.experiences.filter(exp => {
      if (!exp) return false;
      
      const companyMatch = exp.company?.toLowerCase().includes(this.searchTerm.toLowerCase()) || false;
      const positionMatch = exp.position?.toLowerCase().includes(this.searchTerm.toLowerCase()) || false;
      const typeMatch = exp.employmentType?.toLowerCase().includes(this.searchTerm.toLowerCase()) || false;
      
      return companyMatch || positionMatch || typeMatch;
    });
    this.pageIndex = 0;
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
  }

  openCreateModal(template: TemplateRef<any>): void {
    this.isEditMode = false;
    this.selectedExperience = null;
    this.experienceForm.reset({ isCurrent: false, skillIds: [] });
    
    const dialogRef = this.dialog.open(template, {
      width: '600px',
      maxWidth: '90vw',
      maxHeight: '90vh'
    });

    dialogRef.afterClosed().subscribe(() => {
      this.experienceForm.reset({ isCurrent: false, skillIds: [] });
    });
  }

  openEditModal(template: TemplateRef<any>, experience: Experience): void {
    this.isEditMode = true;
    this.selectedExperience = experience;
    
    // Format dates for form
    const startDate = new Date(experience.startDate);
    const endDate = experience.endDate ? new Date(experience.endDate) : null;

    this.experienceForm.patchValue({
      company: experience.company,
      position: experience.position,
      employmentType: experience.employmentType,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate ? endDate.toISOString().split('T')[0] : '',
      isCurrent: experience.isCurrent,
      description: experience.description,
      skillIds: experience.skillIds
    });

    const dialogRef = this.dialog.open(template, {
      width: '600px',
      maxWidth: '90vw',
      maxHeight: '90vh'
    });

    dialogRef.afterClosed().subscribe(() => {
      this.experienceForm.reset({ isCurrent: false, skillIds: [] });
    });
  }

  onIsCurrentChange(): void {
    if (this.experienceForm.get('isCurrent')?.value) {
      this.experienceForm.get('endDate')?.setValue('');
      this.experienceForm.get('endDate')?.disable();
    } else {
      this.experienceForm.get('endDate')?.enable();
    }
  }

  saveExperience(): void {
    if (this.experienceForm.valid) {
      const formValue = this.experienceForm.value;
      const experienceData: ExperienceRequest = {
        company: formValue.company,
        position: formValue.position,
        employmentType: formValue.employmentType,
        startDate: new Date(formValue.startDate).toISOString(),
        endDate: formValue.endDate ? new Date(formValue.endDate).toISOString() : undefined,
        isCurrent: formValue.isCurrent,
        description: formValue.description,
        skillIds: formValue.skillIds || []
      };

      const operation = this.isEditMode && this.selectedExperience
        ? this.experienceService.updateExperience(this.selectedExperience.id, experienceData)
        : this.experienceService.createExperience(experienceData);

      operation.subscribe({
        next: () => {
          this.snackBar.open(
            `Experiência ${this.isEditMode ? 'atualizada' : 'criada'} com sucesso!`,
            'Fechar',
            { duration: 3000 }
          );
          this.dialog.closeAll();
          this.loadExperiences();
        },
        error: (error) => {
          console.error('Error saving experience:', error);
          this.snackBar.open(
            `Erro ao ${this.isEditMode ? 'atualizar' : 'criar'} experiência`,
            'Fechar',
            { duration: 5000 }
          );
        }
      });
    } else {
      this.markFormGroupTouched(this.experienceForm);
    }
  }

  confirmDelete(experience: Experience): void {
    const confirmation = confirm(`Tem certeza que deseja excluir a experiência na ${experience.company}?`);
    
    if (confirmation) {
      this.experienceService.deleteExperience(experience.id).subscribe({
        next: () => {
          this.snackBar.open('Experiência excluída com sucesso!', 'Fechar', { duration: 3000 });
          this.loadExperiences();
        },
        error: (error) => {
          console.error('Error deleting experience:', error);
          this.snackBar.open('Erro ao excluir experiência', 'Fechar', { duration: 5000 });
        }
      });
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  getEmploymentTypeColor(type: string): string {
    if (!type) return '#757575';
    
    const colors: { [key: string]: string } = {
      'CLT': '#4CAF50',
      'PJ': '#2196F3',
      'Freelancer': '#FF9800',
      'Estágio': '#9C27B0',
      'Trainee': '#E91E63',
      'Voluntário': '#607D8B'
    };
    return colors[type] || '#757575';
  }
}