import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Collection } from '../models/collection';
import { NotificationService } from './notification.service';

export interface CollectionsData {
  collections: Collection[];
}

@Injectable({
  providedIn: 'root'
})
export class CollectionFileService {
  private readonly COLLECTIONS_FILE_PATH = 'assets/data/collections.json';

  constructor(
    private http: HttpClient,
    private notificationService: NotificationService
  ) {}

  loadCollectionsFromFile(): Observable<Collection[]> {
    return this.http.get<CollectionsData>(this.COLLECTIONS_FILE_PATH).pipe(
      map(data => data.collections.map(collection => ({
        ...collection,
        createdAt: new Date(collection.createdAt),
        updatedAt: new Date(collection.updatedAt)
      }))),
      catchError(error => {
        console.error('Error loading collections from file:', error);
        return of([]);
      })
    );
  }

  getUpdatedFileContent(collections: Collection[]): string {
    const data: CollectionsData = { collections };
    return JSON.stringify(data, null, 2);
  }

    showUpdatedFileContent(collections: Collection[], isAutoSave: boolean = false): void {
    const jsonContent = this.getUpdatedFileContent(collections);
    
    // Create modal to show the updated content
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      padding: 20px;
    `;
    
    modal.innerHTML = `
      <div style="
        background: white;
        border-radius: 12px;
        padding: 2rem;
        max-width: 90%;
        max-height: 90%;
        overflow: auto;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
      ">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <h3 style="margin: 0; color: #1f2937; font-size: 1.25rem;">
            ${isAutoSave ? '✅ Collections Updated!' : '📥 Updated Collections File'}
          </h3>
          <button id="closeModal" style="
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: #6b7280;
            padding: 0;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
          ">×</button>
        </div>
        
        <div style="margin-bottom: 1rem; padding: 1rem; background: #f3f4f6; border-radius: 8px; border-left: 4px solid #10b981;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem;">
            <div style="flex: 1;">
              <p style="margin: 0; color: #374151; font-size: 0.9rem;">
                <strong>📝 Instructions:</strong><br>
                1. Copy the JSON content below<br>
                2. Open <code>src/assets/data/collections.json</code> in your editor<br>
                3. Replace the entire content with the copied JSON<br>
                4. Save the file and commit to your repository
              </p>
            </div>
            <button id="copyFromInstructions" style="
              background: #3b82f6;
              color: white;
              border: none;
              padding: 0.5rem 1rem;
              border-radius: 6px;
              cursor: pointer;
              font-size: 0.8rem;
              font-weight: 500;
              white-space: nowrap;
              flex-shrink: 0;
            ">📋 Copy JSON</button>
          </div>
        </div>
        
        <div style="
          background: #1f2937;
          color: #f9fafb;
          padding: 1rem;
          border-radius: 8px;
          font-family: 'Courier New', monospace;
          font-size: 0.875rem;
          line-height: 1.5;
          overflow-x: auto;
          white-space: pre-wrap;
          max-height: 400px;
          overflow-y: auto;
        ">${jsonContent}</div>
        
        <div style="display: flex; gap: 1rem; margin-top: 1rem;">
          <button id="copyFromBottom" style="
            background: #3b82f6;
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            cursor: pointer;
            font-size: 0.9rem;
            font-weight: 500;
          ">📋 Copy JSON</button>
          
          <button id="downloadFile" style="
            background: #10b981;
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            cursor: pointer;
            font-size: 0.9rem;
            font-weight: 500;
          ">💾 Download File</button>
          
          <button id="closeModalBottom" style="
            background: #6b7280;
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            cursor: pointer;
            font-size: 0.9rem;
            font-weight: 500;
          ">Close</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners after the modal is added to DOM
    const copyFromInstructions = modal.querySelector('#copyFromInstructions') as HTMLButtonElement;
    const copyFromBottom = modal.querySelector('#copyFromBottom') as HTMLButtonElement;
    const downloadFile = modal.querySelector('#downloadFile') as HTMLButtonElement;
    const closeModal = modal.querySelector('#closeModal') as HTMLButtonElement;
    const closeModalBottom = modal.querySelector('#closeModalBottom') as HTMLButtonElement;
    
    const copyToClipboard = (button: HTMLButtonElement) => {
      navigator.clipboard.writeText(jsonContent).then(() => {
        button.textContent = '✅ Copied!';
        button.style.background = '#10b981';
        setTimeout(() => {
          button.textContent = '📋 Copy JSON';
          button.style.background = '#3b82f6';
        }, 2000);
      });
    };
    
    const closeModalFunction = () => {
      modal.remove();
    };
    
    copyFromInstructions?.addEventListener('click', () => copyToClipboard(copyFromInstructions));
    copyFromBottom?.addEventListener('click', () => copyToClipboard(copyFromBottom));
    downloadFile?.addEventListener('click', () => {
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'collections.json';
      a.click();
      URL.revokeObjectURL(url);
    });
    closeModal?.addEventListener('click', closeModalFunction);
    closeModalBottom?.addEventListener('click', closeModalFunction);
    
    // Show notification
    if (isAutoSave) {
      this.notificationService.showNotification(
        '✅ Collections updated! Check the modal for the updated file content.',
        'success'
      );
    } else {
      this.notificationService.showNotification(
        '📥 Collections exported! Check the modal for the file content.',
        'info'
      );
    }
  }

  exportCollectionsToFile(collections: Collection[], isAutoSave: boolean = false): void {
    this.showUpdatedFileContent(collections, isAutoSave);
  }

  getCollectionsFileContent(): string {
    return `To update the collections file:

1. Go to Admin > Collection Management
2. Make your changes to collections
3. Click "Save Changes" or "Create Collection"
4. Copy the JSON content from the modal
5. Replace the content of src/assets/data/collections.json
6. Commit and push the changes to your repository

The collections will be loaded from the file on the next application restart.`;
  }
} 