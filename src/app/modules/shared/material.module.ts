import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Angular Material Components (apenas os que não estão no SharedModule)
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    MatToolbarModule,
    MatCardModule,
    MatProgressBarModule,
    MatTabsModule,
    MatSidenavModule,
    MatListModule,
    MatMenuModule,
    MatDividerModule
  ],
  exports: [
    MatToolbarModule,
    MatCardModule,
    MatProgressBarModule,
    MatTabsModule,
    MatSidenavModule,
    MatListModule,
    MatMenuModule,
    MatDividerModule
  ]
})
export class MaterialModule { }