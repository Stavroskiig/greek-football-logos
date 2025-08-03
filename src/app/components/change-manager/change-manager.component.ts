import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TagStorageService } from '../../services/tag-storage.service';

@Component({
  selector: 'app-change-manager',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="change-manager" *ngIf="hasChanges">
      <div class="change-info">
        <span class="change-count">{{ pendingChangesCount }} pending change(s)</span>
        <span class="change-status">Changes not saved</span>
      </div>
      <div class="change-actions">
        <button (click)="saveChanges()" class="btn btn-success">
          💾 Save Changes
        </button>
        <button (click)="discardChanges()" class="btn btn-danger">
          ❌ Discard Changes
        </button>
      </div>
    </div>
  `,
  styles: [`
    .change-manager {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: white;
      border: 2px solid #007bff;
      border-radius: 8px;
      padding: 1rem;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 1000;
      min-width: 300px;
    }
    .change-info {
      margin-bottom: 1rem;
    }
    .change-count {
      display: block;
      font-weight: bold;
      color: #007bff;
      margin-bottom: 0.5rem;
    }
    .change-status {
      display: block;
      color: #dc3545;
      font-size: 0.9rem;
    }
    .change-actions {
      display: flex;
      gap: 0.5rem;
    }
    .btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.9rem;
    }
    .btn-success {
      background-color: #28a745;
      color: white;
    }
    .btn-success:hover {
      background-color: #218838;
    }
    .btn-danger {
      background-color: #dc3545;
      color: white;
    }
    .btn-danger:hover {
      background-color: #c82333;
    }
  `]
})
export class ChangeManagerComponent {
  hasChanges = false;
  pendingChangesCount = 0;

  constructor(private tagStorage: TagStorageService) {
    // Subscribe to changes
    this.tagStorage.getTagData().subscribe(() => {
      this.updateChangeStatus();
    });
  }

  private updateChangeStatus(): void {
    this.hasChanges = this.tagStorage.hasChanges();
    this.pendingChangesCount = this.tagStorage.getPendingChangesCount();
  }

  saveChanges(): void {
    this.tagStorage.savePendingChanges();
    this.updateChangeStatus();
  }

  discardChanges(): void {
    this.tagStorage.discardPendingChanges();
    this.updateChangeStatus();
  }


} 