import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PageEvent } from '@angular/material/paginator';
import { CertificationService } from 'src/app/core/service/certification.service';
import { Certification, CertificationRequest } from '../../../models/certification.model';
import { ColumnDefinition } from 'src/app/shared/data-table/data-table.component';

@Component({
  selector: 'app-certifications',
  templateUrl: './certifications.component.html',
  styleUrls: ['./certifications.component.scss']
})
export class CertificationsComponent implements OnInit {
  certifications: Certification[] = [];
  filteredCertifications: Certification[] = [];
  loading = false;
  searchTerm = '';
  selectedStatus = 'all';

  // Table configuration
  columns: ColumnDefinition[] = [
    { key: 'name', header: 'Certificação', sortable: true, width: '200px' },
    { key: 'issuingOrganization', header: 'Organização', sortable: true, width: '180px' },
    { key: 'issueDate', header: 'Data Emissão', sortable: true, width: '130px' },
    { key: 'expirationDate', header: 'Validade', sortable: true, width: '130px' },
    { key: 'status', header: 'Status', sortable: true, width: '120px' }
  ];

  // Pagination
  pageSize = 10;
  pageIndex = 0;

  // Modal
  certificationForm: FormGroup;
  isEditMode = false;
  selectedCertification: Certification | null = null;

  constructor(
    private certificationService: CertificationService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.certificationForm = this.createCertificationForm();
  }

  ngOnInit(): void {
    this.loadCertifications();
  }

  createCertificationForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      issuingOrganization: ['', [Validators.required, Validators.minLength(2)]],
      issueDate: ['', Validators.required],
      expirationDate: [''],
      credentialId: [''],
      credentialUrl: ['']
    });
  }

  loadCertifications(): void {
    this.loading = true;
    this.certificationService.getAllCertifications().subscribe({
      next: (data) => {
        this.certifications = data || [];
        this.filteredCertifications = [...this.certifications];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading certifications:', error);
        this.snackBar.open('Erro ao carregar certificações', 'Fechar', { duration: 5000 });
        this.certifications = [];
        this.filteredCertifications = [];
        this.loading = false;
      }
    });
  }

  onSearchChange(searchTerm: string): void {
    this.searchTerm = searchTerm;
    this.applyFilters();
  }

  onStatusChange(status: string): void {
    this.selectedStatus = status;
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = this.certifications;

    // Aplicar filtro de status
    if (this.selectedStatus !== 'all') {
      if (this.selectedStatus === 'active') {
        filtered = filtered.filter(certification => this.isCertificationActive(certification));
      } else if (this.selectedStatus === 'expired') {
        filtered = filtered.filter(certification => this.isCertificationExpired(certification));
      } else if (this.selectedStatus === 'no_expiration') {
        filtered = filtered.filter(certification => !certification?.expirationDate);
      }
    }

    // Aplicar filtro de pesquisa
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(certification =>
        certification?.name?.toLowerCase().includes(term) ||
        certification?.issuingOrganization?.toLowerCase().includes(term) ||
        certification?.credentialId?.toLowerCase().includes(term)
      );
    }

    this.filteredCertifications = filtered;
    this.pageIndex = 0;
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
  }

  openCreateModal(template: TemplateRef<any>): void {
    this.isEditMode = false;
    this.selectedCertification = null;
    this.certificationForm.reset();
    
    const dialogRef = this.dialog.open(template, {
      width: '600px',
      maxWidth: '90vw',
      maxHeight: '90vh'
    });

    dialogRef.afterClosed().subscribe(() => {
      this.certificationForm.reset();
    });
  }

  openEditModal(template: TemplateRef<any>, certification: Certification): void {
    this.isEditMode = true;
    this.selectedCertification = certification;

    this.certificationForm.patchValue({
      name: certification.name,
      issuingOrganization: certification.issuingOrganization,
      issueDate: certification.issueDate,
      expirationDate: certification.expirationDate,
      credentialId: certification.credentialId,
      credentialUrl: certification.credentialUrl
    });

    const dialogRef = this.dialog.open(template, {
      width: '600px',
      maxWidth: '90vw',
      maxHeight: '90vh'
    });

    dialogRef.afterClosed().subscribe(() => {
      this.certificationForm.reset();
    });
  }

  saveCertification(): void {
    if (this.certificationForm.valid) {
      const formValue = this.certificationForm.value;
      const certificationData: CertificationRequest = {
        name: formValue.name.trim(),
        issuingOrganization: formValue.issuingOrganization.trim(),
        issueDate: formValue.issueDate,
        expirationDate: formValue.expirationDate || null,
        credentialId: formValue.credentialId?.trim(),
        credentialUrl: formValue.credentialUrl?.trim()
      };

      const operation = this.isEditMode && this.selectedCertification
        ? this.certificationService.updateCertification(this.selectedCertification.id, certificationData)
        : this.certificationService.createCertification(certificationData);

      operation.subscribe({
        next: () => {
          this.snackBar.open(
            `Certificação ${this.isEditMode ? 'atualizada' : 'criada'} com sucesso!`,
            'Fechar',
            { duration: 3000 }
          );
          this.dialog.closeAll();
          this.loadCertifications();
        },
        error: (error) => {
          console.error('Error saving certification:', error);
          this.snackBar.open(
            `Erro ao ${this.isEditMode ? 'atualizar' : 'criar'} certificação`,
            'Fechar',
            { duration: 5000 }
          );
        }
      });
    } else {
      this.markFormGroupTouched(this.certificationForm);
    }
  }

  confirmDelete(certification: Certification): void {
    const confirmation = confirm(`Tem certeza que deseja excluir a certificação "${certification.name}"?`);
    
    if (confirmation) {
      this.certificationService.deleteCertification(certification.id).subscribe({
        next: () => {
          this.snackBar.open('Certificação excluída com sucesso!', 'Fechar', { duration: 3000 });
          this.loadCertifications();
        },
        error: (error) => {
          console.error('Error deleting certification:', error);
          this.snackBar.open('Erro ao excluir certificação', 'Fechar', { duration: 5000 });
        }
      });
    }
  }

  isCertificationActive(certification: Certification): boolean {
    if (!certification || !certification.expirationDate) return true;
    return new Date(certification.expirationDate) > new Date();
  }

  isCertificationExpired(certification: Certification): boolean {
    if (!certification || !certification.expirationDate) return false;
    return new Date(certification.expirationDate) <= new Date();
  }

  getStatusColor(certification: Certification): string {
    if (!certification) return '#757575'; // Cinza para undefined
    
    if (!certification.expirationDate) return '#2196F3'; // Azul para sem expiração
    return this.isCertificationActive(certification) ? '#4CAF50' : '#F44336'; // Verde para ativo, Vermelho para expirado
  }

  getStatusIcon(certification: Certification): string {
    if (!certification) return 'help'; // Ícone de ajuda para undefined
    
    if (!certification.expirationDate) return 'infinite';
    return this.isCertificationActive(certification) ? 'check_circle' : 'warning';
  }

  getStatusText(certification: Certification): string {
    if (!certification) return 'Não informado';
    
    if (!certification.expirationDate) return 'Sem Expiração';
    return this.isCertificationActive(certification) ? 'Ativa' : 'Expirada';
  }

  getDaysUntilExpiration(certification: Certification): number {
    if (!certification || !certification.expirationDate) return Infinity;
    
    try {
      const today = new Date();
      const expiration = new Date(certification.expirationDate);
      const diffTime = expiration.getTime() - today.getTime();
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } catch (error) {
      console.error('Error calculating days until expiration:', error);
      return Infinity;
    }
  }

  getExpirationBadge(certification: Certification): string {
    if (!certification) return 'Informação não disponível';
    
    if (!certification.expirationDate) return 'Sem expiração';
    
    try {
      const days = this.getDaysUntilExpiration(certification);
      if (days < 0) return `Expirada há ${Math.abs(days)} dias`;
      if (days === 0) return 'Expira hoje';
      if (days <= 30) return `Expira em ${days} dias`;
      return `Válida até ${new Date(certification.expirationDate).toLocaleDateString('pt-BR')}`;
    } catch (error) {
      console.error('Error generating expiration badge:', error);
      return 'Data inválida';
    }
  }

  getStatusStats(): { status: string, count: number, color: string }[] {
    const stats = [
      { status: 'active', count: 0, color: '#4CAF50' },
      { status: 'expired', count: 0, color: '#F44336' },
      { status: 'no_expiration', count: 0, color: '#2196F3' }
    ];

    this.certifications.forEach(certification => {
      if (!certification) return;
      
      if (!certification.expirationDate) {
        stats[2].count++;
      } else if (this.isCertificationActive(certification)) {
        stats[0].count++;
      } else {
        stats[1].count++;
      }
    });

    return stats.filter(stat => stat.count > 0);
  }

  openCredentialUrl(url: string): void {
    if (url) {
      window.open(url, '_blank');
    }
  }

  // Métodos auxiliares para o preview
  getPreviewStatusColor(): string {
    const expirationDate = this.certificationForm.get('expirationDate')?.value;
    if (!expirationDate) return '#2196F3';
    
    try {
      const expDate = new Date(expirationDate);
      const today = new Date();
      return expDate > today ? '#4CAF50' : '#F44336';
    } catch (error) {
      return '#757575';
    }
  }

  getPreviewStatusIcon(): string {
    const expirationDate = this.certificationForm.get('expirationDate')?.value;
    if (!expirationDate) return 'infinite';
    
    try {
      const expDate = new Date(expirationDate);
      const today = new Date();
      return expDate > today ? 'check_circle' : 'warning';
    } catch (error) {
      return 'help';
    }
  }

  getPreviewStatusText(): string {
    const expirationDate = this.certificationForm.get('expirationDate')?.value;
    if (!expirationDate) return 'Sem Expiração';
    
    try {
      const expDate = new Date(expirationDate);
      const today = new Date();
      return expDate > today ? 'Ativa' : 'Expirada';
    } catch (error) {
      return 'Status desconhecido';
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }
}