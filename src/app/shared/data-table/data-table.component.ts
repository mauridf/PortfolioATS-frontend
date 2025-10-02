import { Component, Input, Output, EventEmitter, TemplateRef } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';

export interface ColumnDefinition {
  key: string;
  header: string;
  type?: 'text' | 'date' | 'boolean' | 'custom';
  sortable?: boolean;
  width?: string;
}

@Component({
  selector: 'app-data-table',
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss']
})
export class DataTableComponent {
  @Input() columns: ColumnDefinition[] = [];
  @Input() data: any[] = [];
  @Input() loading = false;
  @Input() pageSize = 10;
  @Input() pageIndex = 0;
  @Input() totalItems = 0;
  @Input() showActions = true;
  @Input() customCellTemplates: { [key: string]: TemplateRef<any> } = {};
  
  @Output() pageChange = new EventEmitter<PageEvent>();
  @Output() edit = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();
  @Output() rowClick = new EventEmitter<any>();

  get displayedColumns(): string[] {
    const baseColumns = this.columns.map(col => col.key);
    return this.showActions ? [...baseColumns, 'actions'] : baseColumns;
  }

  get paginatedData(): any[] {
    if (!this.data || this.data.length === 0) {
      return [];
    }
    const startIndex = this.pageIndex * this.pageSize;
    return this.data.slice(startIndex, startIndex + this.pageSize);
  }

  onPageChange(event: PageEvent): void {
    this.pageChange.emit(event);
  }

  onEdit(item: any): void {
    this.edit.emit(item);
  }

  onDelete(item: any): void {
    this.delete.emit(item);
  }

  onRowClick(item: any): void {
    this.rowClick.emit(item);
  }

  formatValue(value: any, type: string = 'text'): string {
    if (value === null || value === undefined) {
      return '-';
    }
    
    switch (type) {
      case 'date':
        try {
          return value ? new Date(value).toLocaleDateString('pt-BR') : '-';
        } catch {
          return '-';
        }
      case 'boolean':
        return value ? 'Sim' : 'Não';
      default:
        return value?.toString() || '-';
    }
  }
}