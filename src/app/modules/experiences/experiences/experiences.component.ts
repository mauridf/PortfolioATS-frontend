import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';

import { ExperienceService } from 'src/app/core/service/experience.service';
import { Experience, ExperienceRequest } from '../../../models/experience.model';
import { Skill } from '../../../models/skill.model';
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

  // Skills disponíveis
  availableSkills: Skill[] = [];
  selectedSkillIds: string[] = [];

  // Table configuration
  columns: ColumnDefinition[] = [
    { key: 'company', header: 'Empresa', sortable: true, width: '180px' },
    { key: 'position', header: 'Cargo', sortable: true, width: '180px' },
    { key: 'employmentType', header: 'Tipo', sortable: true, width: '100px' },
    { key: 'skills', header: 'Habilidades', sortable: false, width: '150px' },
    { key: 'startDate', header: 'Início', type: 'date', sortable: true, width: '100px' },
    { key: 'endDate', header: 'Término', type: 'date', sortable: true, width: '100px' },
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
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.experienceForm = this.createExperienceForm();
  }

  ngOnInit(): void {
    this.loadExperiences();
    this.loadAvailableSkills();
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
        this.filteredExperiences = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading experiences:', error);
        this.snackBar.open('Erro ao carregar experiências', 'Fechar', { duration: 5000 });
        this.loading = false;
      }
    });
  }

  loadAvailableSkills(): void {
    this.experienceService.getAvailableSkills().subscribe({
      next: (skills) => {
        this.availableSkills = skills || [];
      },
      error: (error) => {
        console.error('Error loading skills:', error);
        this.availableSkills = [];
        
        // Fallback: tenta carregar do perfil se disponível
        this.loadSkillsFromProfile();
      }
    });
  }

  // Método fallback para carregar skills do perfil
  private loadSkillsFromProfile(): void {
    // Você pode implementar um serviço para carregar o perfil completo
    // ou usar um ProfileService se disponível
    console.log('Tentando carregar skills do perfil...');
    // Implementação depende da sua estrutura de serviços
  }

  onSearchChange(searchTerm: string): void {
    this.searchTerm = searchTerm;
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = this.experiences;

    // Aplicar filtro de pesquisa
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(exp =>
        exp.company?.toLowerCase().includes(term) ||
        exp.position?.toLowerCase().includes(term) ||
        exp.employmentType?.toLowerCase().includes(term)
      );
    }

    this.filteredExperiences = filtered;
    this.pageIndex = 0;
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
  }

  openCreateModal(template: TemplateRef<any>): void {
    this.isEditMode = false;
    this.selectedExperience = null;
    this.selectedSkillIds = [];
    this.experienceForm.reset({ 
      isCurrent: false, 
      skillIds: [] 
    });
    
    const dialogRef = this.dialog.open(template, {
      width: '600px',
      maxWidth: '90vw',
      maxHeight: '90vh'
    });

    dialogRef.afterClosed().subscribe(() => {
      this.experienceForm.reset({ isCurrent: false, skillIds: [] });
      this.selectedSkillIds = [];
    });
  }

  openEditModal(template: TemplateRef<any>, experience: Experience): void {
    this.isEditMode = true;
    this.selectedExperience = experience;
    this.selectedSkillIds = experience.skillIds || [];
    
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
      this.selectedSkillIds = [];
    });
  }

  onSkillSelectionChange(skillId: string, event: any): void {
    const isChecked = event.checked;
    
    if (isChecked) {
      // Adicionar skill se não estiver na lista
      if (!this.selectedSkillIds.includes(skillId)) {
        this.selectedSkillIds.push(skillId);
      }
    } else {
      // Remover skill da lista
      this.selectedSkillIds = this.selectedSkillIds.filter(id => id !== skillId);
    }
    
    // Atualizar o form control
    this.experienceForm.patchValue({
      skillIds: this.selectedSkillIds
    });
  }

  isSkillSelected(skillId: string): boolean {
    return this.selectedSkillIds.includes(skillId);
  }

  getSelectedSkills(): Skill[] {
    return this.availableSkills.filter(skill => 
      this.selectedSkillIds.includes(skill.id)
    );
  }

  removeSkill(skillId: string): void {
    this.selectedSkillIds = this.selectedSkillIds.filter(id => id !== skillId);
    this.experienceForm.patchValue({
      skillIds: this.selectedSkillIds
    });
  }

  getSkillByName(skillId: string): Skill | undefined {
    return this.availableSkills.find(skill => skill.id === skillId);
  }

  // Método para navegar para a tela de skills
  onNavigateToSkills(event: Event): void {
    event.preventDefault();
    this.dialog.closeAll();
    this.router.navigate(['/skills']);
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

  getEmploymentTypeColor(type: string): string {
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

  getCategoryColor(category: string | undefined): string {
    if (!category) return '#757575';
    
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

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  getSkillsForExperience(experience: Experience): Skill[] {
    if (!experience || !experience.skillIds || experience.skillIds.length === 0) {
      return [];
    }
    
    // Se já tem skills populadas, retorna elas
    if (experience.skills && experience.skills.length > 0) {
      return experience.skills;
    }
    
    // Caso contrário, mapeia os skillIds para as skills do perfil
    return experience.skillIds
      .map(skillId => this.getSkillById(skillId))
      .filter(skill => skill !== undefined) as Skill[];
  }

  getSkillById(skillId: string): Skill | undefined {
    // Primeiro busca nas skills disponíveis (do modal)
    const availableSkill = this.availableSkills.find(skill => skill.id === skillId);
    if (availableSkill) return availableSkill;
    
    // Se não encontrar, busca nas skills do perfil (se estiverem carregadas)
    // Você pode precisar carregar as skills do perfil separadamente
    return undefined;
  }
}