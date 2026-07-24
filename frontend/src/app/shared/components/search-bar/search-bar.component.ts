import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [FormsModule, NgIf],
  template: `
    <div class="search-wrapper">
      <span class="search-icon">🔍</span>
      <input
        type="text"
        class="search-input"
        [placeholder]="placeholder"
        [(ngModel)]="searchTerm"
        (input)="onSearch()"
        (keyup.enter)="search.emit(searchTerm)"
      />
      <button *ngIf="searchTerm" class="search-clear" (click)="clear()">×</button>
    </div>
  `,
  styleUrls: ['./search-bar.component.scss'],
})
export class SearchBarComponent {
  @Input() placeholder = 'Search...';
  @Input() debounceMs = 300;
  @Output() search = new EventEmitter<string>();
  @Output() clearSearch = new EventEmitter<void>();

  searchTerm = '';
  private debounceTimer?: ReturnType<typeof setTimeout>;

  onSearch(): void {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.search.emit(this.searchTerm);
    }, this.debounceMs);
  }

  clear(): void {
    this.searchTerm = '';
    this.clearSearch.emit();
    this.search.emit('');
  }
}
