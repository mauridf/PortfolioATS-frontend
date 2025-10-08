import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PageEvent } from '@angular/material/paginator';
import { LanguageService } from 'src/app/core/service/language.service';
import { Language, LanguageRequest } from '../../../models/language.model';
import { ColumnDefinition } from 'src/app/shared/data-table/data-table.component';

@Component({
  selector: 'app-languages',
  templateUrl: './languages.component.html',
  styleUrls: ['./languages.component.scss']
})
export class LanguagesComponent implements OnInit {
  languages: Language[] = [];
  filteredLanguages: Language[] = [];
  loading = false;
  searchTerm = '';
  selectedProficiency = 'all';

  // Table configuration
  columns: ColumnDefinition[] = [
    { key: 'name', header: 'Idioma', sortable: true, width: '150px' },
    { key: 'proficiency', header: 'Proficiência', sortable: true, width: '200px' },
    { key: 'level', header: 'Nível', sortable: false, width: '180px' }
  ];

  // Pagination
  pageSize = 10;
  pageIndex = 0;

  // Modal
  languageForm: FormGroup;
  isEditMode = false;
  selectedLanguage: Language | null = null;

  // Níveis de proficiência
  proficiencies = [
    'Básico',
    'Intermediário',
    'Avançado',
    'Fluente',
    'Nativo'
  ];

  constructor(
    private languageService: LanguageService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.languageForm = this.createLanguageForm();
  }

  ngOnInit(): void {
    this.loadLanguages();
  }

  createLanguageForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      proficiency: ['', Validators.required]
    });
  }

  loadLanguages(): void {
    this.loading = true;
    this.languageService.getAllLanguages().subscribe({
      next: (data) => {
        this.languages = data || [];
        this.filteredLanguages = [...this.languages];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading languages:', error);
        this.snackBar.open('Erro ao carregar idiomas', 'Fechar', { duration: 5000 });
        this.languages = [];
        this.filteredLanguages = [];
        this.loading = false;
      }
    });
  }

  onSearchChange(searchTerm: string): void {
    this.searchTerm = searchTerm;
    this.applyFilters();
  }

  onProficiencyChange(proficiency: string): void {
    this.selectedProficiency = proficiency;
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = this.languages;

    // Aplicar filtro de proficiência
    if (this.selectedProficiency !== 'all') {
      filtered = filtered.filter(language => 
        language?.proficiency === this.selectedProficiency
      );
    }

    // Aplicar filtro de pesquisa
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(language =>
        language?.name?.toLowerCase().includes(term) ||
        language?.proficiency?.toLowerCase().includes(term)
      );
    }

    this.filteredLanguages = filtered;
    this.pageIndex = 0;
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
  }

  openCreateModal(template: TemplateRef<any>): void {
    this.isEditMode = false;
    this.selectedLanguage = null;
    this.languageForm.reset();
    
    const dialogRef = this.dialog.open(template, {
      width: '500px',
      maxWidth: '90vw',
      maxHeight: '90vh'
    });

    dialogRef.afterClosed().subscribe(() => {
      this.languageForm.reset();
    });
  }

  openEditModal(template: TemplateRef<any>, language: Language): void {
    this.isEditMode = true;
    this.selectedLanguage = language;

    this.languageForm.patchValue({
      name: language.name,
      proficiency: language.proficiency
    });

    const dialogRef = this.dialog.open(template, {
      width: '500px',
      maxWidth: '90vw',
      maxHeight: '90vh'
    });

    dialogRef.afterClosed().subscribe(() => {
      this.languageForm.reset();
    });
  }

  saveLanguage(): void {
    if (this.languageForm.valid) {
      const formValue = this.languageForm.value;
      const languageData: LanguageRequest = {
        name: formValue.name.trim(),
        proficiency: formValue.proficiency
      };

      const operation = this.isEditMode && this.selectedLanguage
        ? this.languageService.updateLanguage(this.selectedLanguage.id, languageData)
        : this.languageService.createLanguage(languageData);

      operation.subscribe({
        next: () => {
          this.snackBar.open(
            `Idioma ${this.isEditMode ? 'atualizado' : 'criado'} com sucesso!`,
            'Fechar',
            { duration: 3000 }
          );
          this.dialog.closeAll();
          this.loadLanguages();
        },
        error: (error) => {
          console.error('Error saving language:', error);
          this.snackBar.open(
            `Erro ao ${this.isEditMode ? 'atualizar' : 'criar'} idioma`,
            'Fechar',
            { duration: 5000 }
          );
        }
      });
    } else {
      this.markFormGroupTouched(this.languageForm);
    }
  }

  confirmDelete(language: Language): void {
    const confirmation = confirm(`Tem certeza que deseja excluir o idioma "${language.name}"?`);
    
    if (confirmation) {
      this.languageService.deleteLanguage(language.id).subscribe({
        next: () => {
          this.snackBar.open('Idioma excluído com sucesso!', 'Fechar', { duration: 3000 });
          this.loadLanguages();
        },
        error: (error) => {
          console.error('Error deleting language:', error);
          this.snackBar.open('Erro ao excluir idioma', 'Fechar', { duration: 5000 });
        }
      });
    }
  }

  getProficiencyColor(proficiency: string): string {
    if (!proficiency) return '#757575';
    
    const colors: { [key: string]: string } = {
      'Básico': '#F44336',
      'Intermediário': '#FF9800',
      'Avançado': '#4CAF50',
      'Fluente': '#2196F3',
      'Nativo': '#9C27B0'
    };
    return colors[proficiency] || '#757575';
  }

  getProficiencyIcon(proficiency: string): string {
    if (!proficiency) return 'help';
    
    const icons: { [key: string]: string } = {
      'Básico': 'sentiment_dissatisfied',
      'Intermediário': 'sentiment_neutral',
      'Avançado': 'sentiment_satisfied',
      'Fluente': 'mood',
      'Nativo': 'favorite'
    };
    return icons[proficiency] || 'help';
  }

  getProficiencyLevel(proficiency: string): number {
    if (!proficiency) return 0;
    
    const levels: { [key: string]: number } = {
      'Básico': 25,
      'Intermediário': 50,
      'Avançado': 75,
      'Fluente': 90,
      'Nativo': 100
    };
    return levels[proficiency] || 0;
  }

  getProficiencyStats(): { proficiency: string, count: number }[] {
    const stats: { [key: string]: number } = {};
    
    this.proficiencies.forEach(proficiency => {
      stats[proficiency] = this.languages.filter(language => language?.proficiency === proficiency).length;
    });

    return Object.entries(stats)
      .map(([proficiency, count]) => ({ proficiency, count }))
      .filter(stat => stat.count > 0)
      .sort((a, b) => b.count - a.count);
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }
}