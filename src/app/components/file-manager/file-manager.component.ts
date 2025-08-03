import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TagStorageService } from '../../services/tag-storage.service';

@Component({
  selector: 'app-file-manager',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="file-manager">
      <h3>Team Tags File Manager</h3>
      <div class="actions">
        <button (click)="downloadTeamTags()" class="btn btn-primary">
          Download Team Tags File
        </button>
        <button (click)="copyToClipboard()" class="btn btn-info">
          Copy to Clipboard
        </button>
                 <button (click)="exportTagData()" class="btn btn-secondary">
           Export All Tag Data
         </button>
         <button (click)="clearAllTags()" class="btn btn-warning">
           🗑️ Clear All Tags
         </button>
      </div>
             <div class="info">
         <p><strong>Current Team Tags File:</strong> src/assets/data/team-tags.json</p>
         <p><strong>Server Status:</strong> <span [class]="serverStatus">{{ serverStatusText }}</span></p>
         <p><strong>Change Management:</strong> Changes are now batched. Use the floating Save/Discard buttons to commit changes.</p>
         <p><strong>Development:</strong> Use the buttons above to manage the team tags file.</p>
       </div>
    </div>
  `,
  styles: [`
    .file-manager {
      padding: 1rem;
      border: 1px solid #ddd;
      border-radius: 8px;
      margin: 1rem 0;
    }
    .actions {
      margin: 1rem 0;
    }
    .btn {
      padding: 0.5rem 1rem;
      margin-right: 0.5rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    .btn-primary {
      background-color: #007bff;
      color: white;
    }
    .btn-info {
      background-color: #17a2b8;
      color: white;
    }
    .btn-secondary {
      background-color: #6c757d;
      color: white;
    }
    .btn-warning {
      background-color: #ffc107;
      color: #212529;
    }
    .info {
      background-color: #f8f9fa;
      padding: 1rem;
      border-radius: 4px;
      margin-top: 1rem;
    }
    .info p {
      margin: 0.5rem 0;
    }
    .status-ok {
      color: #28a745;
      font-weight: bold;
    }
    .status-error {
      color: #dc3545;
      font-weight: bold;
    }
    .status-unknown {
      color: #ffc107;
      font-weight: bold;
    }
  `]
})
export class FileManagerComponent {
  serverStatus = 'status-unknown';
  serverStatusText = 'Checking...';

  constructor(private tagStorage: TagStorageService) {
    this.checkServerStatus();
  }

  downloadTeamTags(): void {
    this.tagStorage.downloadTeamTagsFile();
  }

  copyToClipboard(): void {
    const currentData = this.tagStorage.getCurrentTagData();
    const dataStr = JSON.stringify(currentData.teamTags, null, 2);
    navigator.clipboard.writeText(dataStr).then(() => {
      console.log('Team tags copied to clipboard. You can now paste into src/assets/data/team-tags.json');
    }).catch(err => {
      console.error('Failed to copy to clipboard:', err);
    });
  }

  exportTagData(): void {
    const data = this.tagStorage.exportData();
    const dataBlob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'tag-data.json';
    link.click();
    URL.revokeObjectURL(url);
  }

  private checkServerStatus(): void {
    fetch('http://localhost:3000/api/health')
      .then(response => response.json())
      .then(data => {
        this.serverStatus = 'status-ok';
        this.serverStatusText = 'Server Running';
      })
      .catch(error => {
        this.serverStatus = 'status-error';
        this.serverStatusText = 'Server Not Running';
      });
  }

  clearAllTags(): void {
    const confirmed = confirm('Are you sure you want to clear ALL tags from ALL teams? This action cannot be undone.');
    if (confirmed) {
      this.tagStorage.clearAllTeamTags();
    }
  }
} 