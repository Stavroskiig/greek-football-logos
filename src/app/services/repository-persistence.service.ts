import { Injectable } from '@angular/core';
import { TagStorageService } from './tag-storage.service';

@Injectable({
  providedIn: 'root'
})
export class RepositoryPersistenceService {

  constructor(private tagStorage: TagStorageService) {}

  /**
   * Save tag data to a specific file in the repository
   * This creates a file that can be committed to Git
   */
  async saveToRepositoryFile(): Promise<{ success: boolean; message: string }> {
    try {
      const tagData = this.tagStorage.exportData();
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:]/g, '-');
      
      // Create a structured filename
      const filename = `greek-football-tags-${timestamp}.json`;
      
      // Create the file content with metadata
      const fileContent = {
        metadata: {
          generatedAt: new Date().toISOString(),
          version: '1.0',
          description: 'Greek Football Teams Tag Data'
        },
        data: JSON.parse(tagData)
      };
      
      // Create download
      const blob = new Blob([JSON.stringify(fileContent, null, 2)], { 
        type: 'application/json' 
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);

      return {
        success: true,
        message: `✅ Tag data saved to ${filename}\n\n📁 Save this file to your repository\n💾 Commit: git add ${filename} && git commit -m "Update tag data"\n🚀 Push: git push`
      };
    } catch (error) {
      console.error('Error saving to repository file:', error);
      return {
        success: false,
        message: `❌ Error saving to repository: ${error}`
      };
    }
  }

  /**
   * Load tag data from a repository file
   */
  async loadFromRepositoryFile(file: File): Promise<{ success: boolean; message: string }> {
    try {
      const text = await this.readFileAsText(file);
      const fileData = JSON.parse(text);
      
      // Handle both old format (direct data) and new format (with metadata)
      let tagData: string;
      if (fileData.metadata && fileData.data) {
        // New format with metadata
        tagData = JSON.stringify(fileData.data);
      } else {
        // Old format - direct data
        tagData = text;
      }
      
      const success = this.tagStorage.importData(tagData);
      
      if (success) {
        return {
          success: true,
          message: `✅ Tag data loaded successfully from ${file.name}!`
        };
      } else {
        return {
          success: false,
          message: '❌ Failed to import tag data. Please check the file format.'
        };
      }
    } catch (error) {
      console.error('Error loading from repository file:', error);
      return {
        success: false,
        message: `❌ Error loading from repository: ${error}`
      };
    }
  }

  /**
   * Create a backup with versioning
   */
  async createVersionedBackup(): Promise<{ success: boolean; message: string }> {
    try {
      const tagData = this.tagStorage.exportData();
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:]/g, '-');
      const version = 'v1.0';
      
      const filename = `backup-greek-football-tags-${version}-${timestamp}.json`;
      
      // Create backup with metadata
      const backupContent = {
        metadata: {
          type: 'backup',
          version: version,
          createdAt: new Date().toISOString(),
          description: 'Greek Football Teams Tag Data Backup'
        },
        data: JSON.parse(tagData)
      };
      
      const blob = new Blob([JSON.stringify(backupContent, null, 2)], { 
        type: 'application/json' 
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);

      return {
        success: true,
        message: `✅ Backup created: ${filename}\n\n💾 Save this file to your repository's assets folder\n📝 This creates a versioned backup of your tag data`
      };
    } catch (error) {
      console.error('Error creating backup:', error);
      return {
        success: false,
        message: `❌ Error creating backup: ${error}`
      };
    }
  }

  /**
   * Generate Git commands for the user
   */
  generateGitCommands(filename: string): string {
    return `# Git commands to commit your tag data:
git add ${filename}
git commit -m "Update Greek football team tag data"
git push origin main

# Or if you want to be more descriptive:
git add ${filename}
git commit -m "feat: update Greek football team tag classifications"
git push origin main`;
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