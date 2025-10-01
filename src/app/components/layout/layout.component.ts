import { Component } from '@angular/core';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent {
  sidenavOpened = false;

  onToggleSidenav(): void {
    this.sidenavOpened = !this.sidenavOpened;
  }

  onCloseSidenav(): void {
    this.sidenavOpened = false;
  }
}