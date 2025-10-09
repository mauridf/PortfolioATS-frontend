import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PageEvent } from '@angular/material/paginator';
import { SocialLinkService } from 'src/app/core/service/social-link.service';
import { SocialLink, SocialLinkRequest } from '../../../models/social-link.model';
import { ColumnDefinition } from 'src/app/shared/data-table/data-table.component';

@Component({
  selector: 'app-social-links',
  templateUrl: './social-links.component.html',
  styleUrls: ['./social-links.component.scss']
})
export class SocialLinksComponent implements OnInit {
  socialLinks: SocialLink[] = [];
  filteredSocialLinks: SocialLink[] = [];
  loading = false;
  searchTerm = '';
  selectedPlatform = 'all';

  // Table configuration - REMOVIDA A COLUNA "actions"
  columns: ColumnDefinition[] = [
    { key: 'platform', header: 'Plataforma', sortable: true, width: '150px' },
    { key: 'username', header: 'Usuário', sortable: true, width: '150px' },
    { key: 'url', header: 'URL', sortable: true, width: '200px' }
    // A coluna de ações será adicionada automaticamente pelo data-table
  ];

  // Pagination
  pageSize = 10;
  pageIndex = 0;

  // Modal
  socialLinkForm: FormGroup;
  isEditMode = false;
  selectedSocialLink: SocialLink | null = null;

  // Plataformas pré-definidas
  platforms = [
    'GitHub',
    'LinkedIn',
    'Twitter',
    'Instagram',
    'Facebook',
    'YouTube',
    'Twitch',
    'Discord',
    'Stack Overflow',
    'GitLab',
    'Bitbucket',
    'Dribbble',
    'Behance',
    'Medium',
    'Dev.to',
    'Portfolio',
    'Site Pessoal',
    'Blog'
  ];

  constructor(
    private socialLinkService: SocialLinkService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.socialLinkForm = this.createSocialLinkForm();
  }

  ngOnInit(): void {
    this.loadSocialLinks();
  }

  createSocialLinkForm(): FormGroup {
    return this.fb.group({
      platform: ['', Validators.required],
      url: ['', [Validators.required, Validators.pattern('https?://.+')]],
      username: ['']
    });
  }

  loadSocialLinks(): void {
    this.loading = true;
    this.socialLinkService.getAllSocialLinks().subscribe({
      next: (data) => {
        this.socialLinks = data || [];
        this.filteredSocialLinks = [...this.socialLinks];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading social links:', error);
        this.snackBar.open('Erro ao carregar redes sociais', 'Fechar', { duration: 5000 });
        this.socialLinks = [];
        this.filteredSocialLinks = [];
        this.loading = false;
      }
    });
  }

  onSearchChange(searchTerm: string): void {
    this.searchTerm = searchTerm;
    this.applyFilters();
  }

  onPlatformChange(platform: string): void {
    this.selectedPlatform = platform;
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = this.socialLinks;

    // Aplicar filtro de plataforma
    if (this.selectedPlatform !== 'all') {
      filtered = filtered.filter(link => 
        link?.platform === this.selectedPlatform
      );
    }

    // Aplicar filtro de pesquisa
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(link =>
        link?.platform?.toLowerCase().includes(term) ||
        link?.username?.toLowerCase().includes(term) ||
        link?.url?.toLowerCase().includes(term)
      );
    }

    this.filteredSocialLinks = filtered;
    this.pageIndex = 0;
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
  }

  openCreateModal(template: TemplateRef<any>): void {
    this.isEditMode = false;
    this.selectedSocialLink = null;
    this.socialLinkForm.reset();
    
    const dialogRef = this.dialog.open(template, {
      width: '500px',
      maxWidth: '90vw',
      maxHeight: '90vh'
    });

    dialogRef.afterClosed().subscribe(() => {
      this.socialLinkForm.reset();
    });
  }

  openEditModal(template: TemplateRef<any>, socialLink: SocialLink): void {
    this.isEditMode = true;
    this.selectedSocialLink = socialLink;

    this.socialLinkForm.patchValue({
      platform: socialLink.platform,
      url: socialLink.url,
      username: socialLink.username
    });

    const dialogRef = this.dialog.open(template, {
      width: '500px',
      maxWidth: '90vw',
      maxHeight: '90vh'
    });

    dialogRef.afterClosed().subscribe(() => {
      this.socialLinkForm.reset();
    });
  }

  saveSocialLink(): void {
    if (this.socialLinkForm.valid) {
      const formValue = this.socialLinkForm.value;
      const socialLinkData: SocialLinkRequest = {
        platform: formValue.platform,
        url: formValue.url.trim(),
        username: formValue.username?.trim()
      };

      const operation = this.isEditMode && this.selectedSocialLink
        ? this.socialLinkService.updateSocialLink(this.selectedSocialLink.id, socialLinkData)
        : this.socialLinkService.createSocialLink(socialLinkData);

      operation.subscribe({
        next: () => {
          this.snackBar.open(
            `Rede social ${this.isEditMode ? 'atualizada' : 'criada'} com sucesso!`,
            'Fechar',
            { duration: 3000 }
          );
          this.dialog.closeAll();
          this.loadSocialLinks();
        },
        error: (error) => {
          console.error('Error saving social link:', error);
          this.snackBar.open(
            `Erro ao ${this.isEditMode ? 'atualizar' : 'criar'} rede social`,
            'Fechar',
            { duration: 5000 }
          );
        }
      });
    } else {
      this.markFormGroupTouched(this.socialLinkForm);
    }
  }

  confirmDelete(socialLink: SocialLink): void {
    const confirmation = confirm(`Tem certeza que deseja excluir o link do ${socialLink.platform}?`);
    
    if (confirmation) {
      this.socialLinkService.deleteSocialLink(socialLink.id).subscribe({
        next: () => {
          this.snackBar.open('Rede social excluída com sucesso!', 'Fechar', { duration: 3000 });
          this.loadSocialLinks();
        },
        error: (error) => {
          console.error('Error deleting social link:', error);
          this.snackBar.open('Erro ao excluir rede social', 'Fechar', { duration: 5000 });
        }
      });
    }
  }

  getPlatformIcon(platform: string): string {
    if (!platform) return 'public';
    
    const icons: { [key: string]: string } = {
      'GitHub': 'code',
      'LinkedIn': 'work',
      'Twitter': 'flutter_dash',
      'Instagram': 'photo_camera',
      'Facebook': 'thumb_up',
      'YouTube': 'play_circle',
      'Twitch': 'live_tv',
      'Discord': 'chat',
      'Stack Overflow': 'help',
      'GitLab': 'storage',
      'Bitbucket': 'cloud',
      'Dribbble': 'palette',
      'Behance': 'design_services',
      'Medium': 'article',
      'Dev.to': 'terminal',
      'Portfolio': 'person',
      'Site Pessoal': 'language',
      'Blog': 'rss_feed'
    };
    return icons[platform] || 'public';
  }

  getPlatformColor(platform: string): string {
    if (!platform) return '#667eea';
    
    const colors: { [key: string]: string } = {
      'GitHub': '#333333',
      'LinkedIn': '#0077B5',
      'Twitter': '#1DA1F2',
      'Instagram': '#E4405F',
      'Facebook': '#1877F2',
      'YouTube': '#FF0000',
      'Twitch': '#9146FF',
      'Discord': '#5865F2',
      'Stack Overflow': '#F48024',
      'GitLab': '#FC6D26',
      'Bitbucket': '#0052CC',
      'Dribbble': '#EA4C89',
      'Behance': '#1769FF',
      'Medium': '#000000',
      'Dev.to': '#0A0A0A',
      'Portfolio': '#667eea',
      'Site Pessoal': '#4CAF50',
      'Blog': '#FF9800'
    };
    return colors[platform] || '#667eea';
  }

  openSocialLink(url: string): void {
    if (url) {
      window.open(url, '_blank');
    }
  }

  getPlatformStats(): { platform: string, count: number }[] {
    const stats: { [key: string]: number } = {};
    
    this.platforms.forEach(platform => {
      stats[platform] = this.socialLinks.filter(link => link?.platform === platform).length;
    });

    return Object.entries(stats)
      .map(([platform, count]) => ({ platform, count }))
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