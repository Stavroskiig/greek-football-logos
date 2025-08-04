import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TagStorageService } from '../../services/tag-storage.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-server-status',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="serverOnline$ | async as isOnline" 
         class="fixed bottom-4 right-4 z-50">
      <div [class]="isOnline ? 'bg-green-50 border-green-200 text-green-700' : 'bg-yellow-50 border-yellow-200 text-yellow-700'"
           class="px-4 py-2 rounded-lg border shadow-sm flex items-center gap-2">
        <div [class]="isOnline ? 'bg-green-500' : 'bg-yellow-500'"
             class="w-2 h-2 rounded-full"></div>
        <span class="text-sm font-medium">
          {{ isOnline ? 'Server Online' : 'Server Offline' }}
        </span>
      </div>
      <div *ngIf="!isOnline" 
           class="mt-2 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-xs max-w-xs">
        {{ getServerStatusMessage() }}
      </div>
    </div>
  `
})
export class ServerStatusComponent implements OnInit {
  serverOnline$: Observable<boolean>;

  constructor(private tagStorage: TagStorageService) {
    this.serverOnline$ = this.tagStorage.isServerOnline();
  }

  ngOnInit() {
    // Check server status every 30 seconds
    setInterval(() => {
      this.serverOnline$ = this.tagStorage.isServerOnline();
    }, 30000);
  }

  getServerStatusMessage(): string {
    return this.tagStorage.getServerStatusMessage();
  }
} 