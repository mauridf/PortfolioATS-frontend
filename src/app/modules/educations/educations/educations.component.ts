import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PageEvent } from '@angular/material/paginator';
import { EducationService } from 'src/app/core/service/education.service';
import { Education, EducationRequest } from '../../../models/education.model';
import { ColumnDefinition } from 'src/app/shared/data-table/data-table.component';

@Component({
  selector: 'app-educations',
  templateUrl: './educations.component.html',
  styleUrls: ['./educations.component.scss']
})
export class EducationsComponent implements OnInit {
  educations: Education[] = []; // CORRIGIDO: mudado de 'skills' para 'educations'
  filteredEducations: Education[] = [];
  loading = false;
  searchTerm = '';
  selectedDegree = 'all';

  // Table configuration
  columns: ColumnDefinition[] = [
    { key: 'institution', header: 'Instituição', sortable: true, width: '200px' },
    { key: 'degree', header: 'Grau', sortable: true, width: '150px' },
    { key: 'fieldOfStudy', header: 'Área de Estudo', sortable: true, width: '180px' },
    { key: 'period', header: 'Período', sortable: false, width: '150px' },
    { key: 'status', header: 'Status', sortable: true, width: '120px' }
  ];

  // Pagination
  pageSize = 10;
  pageIndex = 0;

  // Modal
  educationForm: FormGroup;
  isEditMode = false;
  selectedEducation: Education | null = null;

  // Graus pré-definidos
  degrees = [
    'Ensino Médio',
    'Técnico',
    'Tecnólogo',
    'Bacharelado',
    'Licenciatura',
    'Pós-Graduação',
    'Mestrado',
    'Doutorado',
    'MBA',
    'Curso Livre',
    'Certificação'
  ];

  constructor(
    private educationService: EducationService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.educationForm = this.createEducationForm();
  }

  ngOnInit(): void {
    this.loadEducations();
  }

  createEducationForm(): FormGroup {
    return this.fb.group({
      institution: ['', [Validators.required, Validators.minLength(2)]],
      degree: ['', Validators.required],
      fieldOfStudy: ['', [Validators.required, Validators.minLength(2)]],
      startDate: ['', Validators.required],
      endDate: [''],
      isCompleted: [false],
      description: ['']
    });
  }

  loadEducations(): void {
    this.loading = true;
    this.educationService.getAllEducations().subscribe({
      next: (data) => {
        this.educations = data || [];
        this.filteredEducations = [...this.educations];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading educations:', error);
        this.snackBar.open('Erro ao carregar formações', 'Fechar', { duration: 5000 });
        this.educations = [];
        this.filteredEducations = [];
        this.loading = false;
      }
    });
  }

  onSearchChange(searchTerm: string): void {
    this.searchTerm = searchTerm;
    this.applyFilters();
  }

  onDegreeChange(degree: string): void {
    this.selectedDegree = degree;
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = this.educations;

    // Aplicar filtro de grau
    if (this.selectedDegree !== 'all') {
      filtered = filtered.filter(education => 
        education?.degree === this.selectedDegree
      );
    }

    // Aplicar filtro de pesquisa
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(education =>
        education?.institution?.toLowerCase().includes(term) ||
        education?.degree?.toLowerCase().includes(term) ||
        education?.fieldOfStudy?.toLowerCase().includes(term) ||
        education?.description?.toLowerCase().includes(term)
      );
    }

    this.filteredEducations = filtered;
    this.pageIndex = 0;
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
  }

  openCreateModal(template: TemplateRef<any>): void {
    this.isEditMode = false;
    this.selectedEducation = null;
    this.educationForm.reset({
      isCompleted: false
    });
    
    const dialogRef = this.dialog.open(template, {
      width: '600px',
      maxWidth: '90vw',
      maxHeight: '90vh'
    });

    dialogRef.afterClosed().subscribe(() => {
      this.educationForm.reset({
        isCompleted: false
      });
    });
  }

  openEditModal(template: TemplateRef<any>, education: Education): void {
    this.isEditMode = true;
    this.selectedEducation = education;

    this.educationForm.patchValue({
      institution: education.institution,
      degree: education.degree,
      fieldOfStudy: education.fieldOfStudy,
      startDate: education.startDate,
      endDate: education.endDate,
      isCompleted: education.isCompleted,
      description: education.description
    });

    const dialogRef = this.dialog.open(template, {
      width: '600px',
      maxWidth: '90vw',
      maxHeight: '90vh'
    });

    dialogRef.afterClosed().subscribe(() => {
      this.educationForm.reset({
        isCompleted: false
      });
    });
  }

  saveEducation(): void {
    if (this.educationForm.valid) {
      const formValue = this.educationForm.value;
      const educationData: EducationRequest = {
        institution: formValue.institution.trim(),
        degree: formValue.degree,
        fieldOfStudy: formValue.fieldOfStudy.trim(),
        startDate: formValue.startDate,
        endDate: formValue.isCompleted ? formValue.endDate : null,
        isCompleted: formValue.isCompleted,
        description: formValue.description?.trim()
      };

      const operation = this.isEditMode && this.selectedEducation
        ? this.educationService.updateEducation(this.selectedEducation.id, educationData)
        : this.educationService.createEducation(educationData);

      operation.subscribe({
        next: () => {
          this.snackBar.open(
            `Formação ${this.isEditMode ? 'atualizada' : 'criada'} com sucesso!`,
            'Fechar',
            { duration: 3000 }
          );
          this.dialog.closeAll();
          this.loadEducations();
        },
        error: (error) => {
          console.error('Error saving education:', error);
          this.snackBar.open(
            `Erro ao ${this.isEditMode ? 'atualizar' : 'criar'} formação`,
            'Fechar',
            { duration: 5000 }
          );
        }
      });
    } else {
      this.markFormGroupTouched(this.educationForm);
    }
  }

  confirmDelete(education: Education): void {
    const confirmation = confirm(`Tem certeza que deseja excluir a formação "${education.institution} - ${education.fieldOfStudy}"?`);
    
    if (confirmation) {
      this.educationService.deleteEducation(education.id).subscribe({
        next: () => {
          this.snackBar.open('Formação excluída com sucesso!', 'Fechar', { duration: 3000 });
          this.loadEducations();
        },
        error: (error) => {
          console.error('Error deleting education:', error);
          this.snackBar.open('Erro ao excluir formação', 'Fechar', { duration: 5000 });
        }
      });
    }
  }

  getDegreeColor(degree: string): string {
    const colors: { [key: string]: string } = {
      'Ensino Médio': '#4CAF50',
      'Técnico': '#2196F3',
      'Tecnólogo': '#FF9800',
      'Bacharelado': '#9C27B0',
      'Licenciatura': '#E91E63',
      'Pós-Graduação': '#607D8B',
      'Mestrado': '#00BCD4',
      'Doutorado': '#FF5722',
      'MBA': '#795548',
      'Curso Livre': '#3F51B5',
      'Certificação': '#8B4513'
    };
    return colors[degree] || '#757575';
  }

  getStatusColor(isCompleted: boolean): string {
    return isCompleted ? '#4CAF50' : '#FF9800';
  }

  getStatusIcon(isCompleted: boolean): string {
    return isCompleted ? 'check_circle' : 'schedule';
  }

  getPeriodDisplay(education: Education): string {
    if (!education) {
      return 'Período não informado';
    }

    try {
      const startDate = new Date(education.startDate);
      if (isNaN(startDate.getTime())) {
        return 'Data inválida';
      }

      const startYear = startDate.getFullYear();
      
      if (!education.endDate) {
        return `${startYear} - Presente`;
      }

      const endDate = new Date(education.endDate);
      if (isNaN(endDate.getTime())) {
        return `${startYear} - Data inválida`;
      }

      const endYear = endDate.getFullYear();
      return `${startYear} - ${endYear}`;
    } catch (error) {
      console.error('Error formatting period:', error);
      return 'Erro ao formatar período';
    }
  }

  getDegreeStats(): { degree: string, count: number }[] {
    const stats: { [key: string]: number } = {};
    
    this.degrees.forEach(degree => {
      stats[degree] = this.educations.filter(education => education?.degree === degree).length;
    });

    return Object.entries(stats)
      .map(([degree, count]) => ({ degree, count }))
      .filter(stat => stat.count > 0)
      .sort((a, b) => b.count - a.count);
  }

  onCompletedChange(): void {
    const isCompleted = this.educationForm.get('isCompleted')?.value;
    const endDateControl = this.educationForm.get('endDate');
    
    if (isCompleted) {
      endDateControl?.setValidators(Validators.required);
    } else {
      endDateControl?.clearValidators();
      endDateControl?.setValue(null);
    }
    endDateControl?.updateValueAndValidity();
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }
}