import { Component, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/service/auth.service';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent {
  @Output() closeSidenav = new EventEmitter<void>();

  menuItems = [
    { path: '/dashboard', icon: 'dashboard', label: 'Dashboard', active: true },
    { path: '/profile', icon: 'person', label: 'Meu Perfil' },
    { path: '/experiences', icon: 'work', label: 'Experiências' },
    { path: '/skills', icon: 'code', label: 'Habilidades' },
    { path: '/education', icon: 'school', label: 'Formação' },
    { path: '/certifications', icon: 'card_membership', label: 'Certificações' },
    { path: '/languages', icon: 'language', label: 'Idiomas' },
    { path: '/social-links', icon: 'share', label: 'Redes Sociais' }
  ];

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  onNavigate(path: string): void {
    this.router.navigate([path]);
    this.closeSidenav.emit();
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
    this.closeSidenav.emit();
  }

  isActiveRoute(path: string): boolean {
    return this.router.url === path;
  }
}