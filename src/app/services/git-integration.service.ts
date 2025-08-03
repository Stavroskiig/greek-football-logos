import { Injectable } from '@angular/core';
import { TagStorageService } from './tag-storage.service';

@Injectable({
  providedIn: 'root'
})
export class GitIntegrationService {

  constructor(private tagStorage: TagStorageService) {}

  /**
   * Save current tag data to repository and commit to Git
   */
  async saveToRepository(): Promise<{ success: boolean; message: string }> {
    try {
      // Export current tag data
      const tagData = this.tagStorage.exportData();
      
      // Create a timestamp for the filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `tag-data-${timestamp}.json`;
      
      // Create download link for the file
      const blob = new Blob([tagData], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);

      return {
        success: true,
        message: `Tag data exported to ${filename}. Please:\n\n1. Save this file to your repository\n2. Commit the changes: git add ${filename} && git commit -m "Update tag data"\n3. Push to remote: git push`
      };
    } catch (error) {
      console.error('Error saving to repository:', error);
      return {
        success: false,
        message: `Error saving to repository: ${error}`
      };
    }
  }

  /**
   * Load tag data from a file and import it
   */
  async loadFromRepository(file: File): Promise<{ success: boolean; message: string }> {
    try {
      const text = await this.readFileAsText(file);
      const success = this.tagStorage.importData(text);
      
      if (success) {
        return {
          success: true,
          message: 'Tag data imported successfully from repository file!'
        };
      } else {
        return {
          success: false,
          message: 'Failed to import tag data. Please check the file format.'
        };
      }
    } catch (error) {
      console.error('Error loading from repository:', error);
      return {
        success: false,
        message: `Error loading from repository: ${error}`
      };
    }
  }

  /**
   * Create a backup file in the assets folder
   */
  async createBackup(): Promise<{ success: boolean; message: string }> {
    try {
      const tagData = this.tagStorage.exportData();
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:]/g, '-');
      const filename = `tag-backup-${timestamp}.json`;
      
      const blob = new Blob([tagData], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);

      return {
        success: true,
        message: `Backup created: ${filename}. Save this file to your repository's assets folder.`
      };
    } catch (error) {
      console.error('Error creating backup:', error);
      return {
        success: false,
        message: `Error creating backup: ${error}`
      };
    }
  }

  private readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  }
} 