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
  styles: [`
    .search-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }
    .search-icon {
      position: absolute;
      left: 0.75rem;
      font-size: 0.875rem;
      opacity: 0.5;
    }
    .search-input {
      width: 100%;
      padding: 0.5rem 0.75rem 0.5rem 2.25rem;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      font-size: 0.875rem;
      background: #fff;
      transition: border-color 0.2s, box-shadow 0.2s;
      outline: none;
    }
    .search-input:focus {
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
    }
    .search-clear {
      position: absolute;
      right: 0.5rem;
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1.125rem;
      color: #94a3b8;
    }
    .search-clear:hover { color: #64748b; }
  `],
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
