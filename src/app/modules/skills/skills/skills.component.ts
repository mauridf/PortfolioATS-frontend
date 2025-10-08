import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PageEvent } from '@angular/material/paginator';
import { SkillService } from 'src/app/core/service/skill.service';
import { Skill, SkillRequest } from '../../../models/skill.model';
import { ColumnDefinition } from 'src/app/shared/data-table/data-table.component';

@Component({
  selector: 'app-skills',
  templateUrl: './skills.component.html',
  styleUrls: ['./skills.component.scss']
})
export class SkillsComponent implements OnInit {
  skills: Skill[] = [];
  filteredSkills: Skill[] = [];
  loading = false;
  searchTerm = '';
  selectedCategory = 'all';

  // Table configuration
  columns: ColumnDefinition[] = [
    { key: 'name', header: 'Habilidade', sortable: true, width: '200px' },
    { key: 'category', header: 'Categoria', sortable: true, width: '150px' },
    { key: 'level', header: 'Nível', sortable: true, width: '120px' },
    { key: 'yearsOfExperience', header: 'Anos Exp.', type: 'text', sortable: true, width: '100px' }
  ];

  // Pagination
  pageSize = 10;
  pageIndex = 0;

  // Modal
  skillForm: FormGroup;
  isEditMode = false;
  selectedSkill: Skill | null = null;

  // Categorias pré-definidas
  categories = [
    'Backend',
    'Frontend',
    'Banco de Dados',
    'Cloud & DevOps',
    'Arquitetura & Padrões',
    'Ferramentas & Outras Tecnologias',
    'Mobile',
    'Testes & QA',
    'Segurança',
    'Business & Soft Skills',
    'Sistemas Legados Desktop & Client-Server'
  ];

  // Níveis de habilidade
  skillLevels = [
    'Iniciante',
    'Intermediário',
    'Avançado',
    'Especialista'
  ];

  // Anos de experiência
  yearsOptions = Array.from({ length: 21 }, (_, i) => i); // 0 a 20 anos

  constructor(
    private skillService: SkillService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.skillForm = this.createSkillForm();
  }

  ngOnInit(): void {
    this.loadSkills();
  }

  createSkillForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      category: ['', Validators.required],
      level: ['Intermediário', Validators.required],
      yearsOfExperience: [0, [Validators.required, Validators.min(0), Validators.max(50)]]
    });
  }

  loadSkills(): void {
    this.loading = true;
    this.skillService.getAllSkills().subscribe({
      next: (data) => {
        this.skills = data || [];
        this.filteredSkills = [...this.skills];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading skills:', error);
        this.snackBar.open('Erro ao carregar habilidades', 'Fechar', { duration: 5000 });
        this.skills = [];
        this.filteredSkills = [];
        this.loading = false;
      }
    });
  }

  // Adicionar método para criar skill vazia para preview
  private getEmptySkill(): Skill {
    return {
      id: '',
      name: '',
      category: '',
      level: 'Intermediário',
      yearsOfExperience: 0
    };
  }

  onSearchChange(searchTerm: string): void {
    this.searchTerm = searchTerm;
    this.applyFilters();
  }

  onCategoryChange(category: string): void {
    this.selectedCategory = category;
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = this.skills;

    // Aplicar filtro de categoria
    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter(skill => 
        skill.category === this.selectedCategory
      );
    }

    // Aplicar filtro de pesquisa
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(skill =>
        skill.name.toLowerCase().includes(term) ||
        skill.category.toLowerCase().includes(term) ||
        skill.level.toLowerCase().includes(term)
      );
    }

    this.filteredSkills = filtered;
    this.pageIndex = 0;
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
  }

  openCreateModal(template: TemplateRef<any>): void {
    this.isEditMode = false;
    this.selectedSkill = null;
    this.skillForm.reset({
      level: 'Intermediário',
      yearsOfExperience: 0
    });
    
    const dialogRef = this.dialog.open(template, {
      width: '500px',
      maxWidth: '90vw',
      maxHeight: '90vh'
    });

    dialogRef.afterClosed().subscribe(() => {
      this.skillForm.reset({
        level: 'Intermediário',
        yearsOfExperience: 0
      });
    });
  }

  openEditModal(template: TemplateRef<any>, skill: Skill): void {
    this.isEditMode = true;
    this.selectedSkill = skill;

    this.skillForm.patchValue({
      name: skill.name,
      category: skill.category,
      level: skill.level,
      yearsOfExperience: skill.yearsOfExperience
    });

    const dialogRef = this.dialog.open(template, {
      width: '500px',
      maxWidth: '90vw',
      maxHeight: '90vh'
    });

    dialogRef.afterClosed().subscribe(() => {
      this.skillForm.reset({
        level: 'Intermediário',
        yearsOfExperience: 0
      });
    });
  }

  saveSkill(): void {
    if (this.skillForm.valid) {
      const formValue = this.skillForm.value;
      const skillData: SkillRequest = {
        name: formValue.name.trim(),
        category: formValue.category,
        level: formValue.level,
        yearsOfExperience: formValue.yearsOfExperience
      };

      const operation = this.isEditMode && this.selectedSkill
        ? this.skillService.updateSkill(this.selectedSkill.id, skillData)
        : this.skillService.createSkill(skillData);

      operation.subscribe({
        next: () => {
          this.snackBar.open(
            `Habilidade ${this.isEditMode ? 'atualizada' : 'criada'} com sucesso!`,
            'Fechar',
            { duration: 3000 }
          );
          this.dialog.closeAll();
          this.loadSkills();
        },
        error: (error) => {
          console.error('Error saving skill:', error);
          this.snackBar.open(
            `Erro ao ${this.isEditMode ? 'atualizar' : 'criar'} habilidade`,
            'Fechar',
            { duration: 5000 }
          );
        }
      });
    } else {
      this.markFormGroupTouched(this.skillForm);
    }
  }

  confirmDelete(skill: Skill): void {
    const confirmation = confirm(`Tem certeza que deseja excluir a habilidade "${skill.name}"?`);
    
    if (confirmation) {
      this.skillService.deleteSkill(skill.id).subscribe({
        next: () => {
          this.snackBar.open('Habilidade excluída com sucesso!', 'Fechar', { duration: 3000 });
          this.loadSkills();
        },
        error: (error) => {
          console.error('Error deleting skill:', error);
          this.snackBar.open('Erro ao excluir habilidade', 'Fechar', { duration: 5000 });
        }
      });
    }
  }

  getCategoryColor(category: string): string {
    const colors: { [key: string]: string } = {
      'Backend': '#4CAF50',
      'Frontend': '#2196F3', 
      'Banco de Dados': '#FF9800',
      'Cloud & DevOps': '#9C27B0',
      'Arquitetura & Padrões': '#E91E63',
      'Ferramentas & Outras Tecnologias': '#607D8B',
      'Mobile': '#00BCD4',
      'Testes & QA': '#FF5722',
      'Segurança': '#795548',
      'Business & Soft Skills': '#3F51B5',
      'Sistemas Legados Desktop & Client-Server': '#8B4513'
    };
    return colors[category] || '#757575';
  }

  getLevelColor(level: string): string {
    const colors: { [key: string]: string } = {
      'Iniciante': '#F44336',
      'Intermediário': '#FF9800',
      'Avançado': '#4CAF50',
      'Especialista': '#2196F3'
    };
    return colors[level] || '#757575';
  }

  getLevelIcon(level: string): string {
    const icons: { [key: string]: string } = {
      'Iniciante': 'school',
      'Intermediário': 'trending_up',
      'Avançado': 'star',
      'Especialista': 'workspace_premium'
    };
    return icons[level] || 'help';
  }

  getCategoryStats(): { category: string, count: number }[] {
    const stats: { [key: string]: number } = {};
    
    this.categories.forEach(category => {
      stats[category] = this.skills.filter(skill => skill.category === category).length;
    });

    return Object.entries(stats)
      .map(([category, count]) => ({ category, count }))
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