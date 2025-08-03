import { Injectable } from '@angular/core';
import { TagStorageService } from './tag-storage.service';

@Injectable({
  providedIn: 'root'
})
export class LocalFileEditorService {

  constructor(private tagStorage: TagStorageService) {}

  /**
   * Generate the content for a local tag data file
   * This file can be saved directly in your repository
   */
  generateLocalFileContent(): { filename: string; content: string } {
    const tagData = this.tagStorage.exportData();
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:]/g, '-');
    
    // Create a structured filename
    const filename = `greek-football-tags-${timestamp}.json`;
    
    // Create the file content with metadata
    const fileContent = {
      metadata: {
        generatedAt: new Date().toISOString(),
        version: '1.0',
        description: 'Greek Football Teams Tag Data',
        instructions: [
          'This file contains tag data for Greek football teams',
          'Save this file to your repository root or assets folder',
          'Commit manually: git add <filename> && git commit -m "Update tag data"',
          'Push manually: git push'
        ]
      },
      data: JSON.parse(tagData)
    };
    
    const content = JSON.stringify(fileContent, null, 2);
    
    return { filename, content };
  }

  /**
   * Create a backup file content
   */
  generateBackupContent(): { filename: string; content: string } {
    const tagData = this.tagStorage.exportData();
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:]/g, '-');
    const version = 'v1.0';
    
    const filename = `backup-greek-football-tags-${version}-${timestamp}.json`;
    
    const backupContent = {
      metadata: {
        type: 'backup',
        version: version,
        createdAt: new Date().toISOString(),
        description: 'Greek Football Teams Tag Data Backup',
        instructions: [
          'This is a backup file of tag data',
          'Save to your repository for version control',
          'Use this file to restore tag data if needed'
        ]
      },
      data: JSON.parse(tagData)
    };
    
    const content = JSON.stringify(backupContent, null, 2);
    
    return { filename, content };
  }

  /**
   * Generate a simple tag data file (without metadata)
   */
  generateSimpleFileContent(): { filename: string; content: string } {
    const tagData = this.tagStorage.exportData();
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:]/g, '-');
    
    const filename = `tags-${timestamp}.json`;
    const content = tagData; // Raw JSON data
    
    return { filename, content };
  }

  /**
   * Load tag data from a local file
   */
  async loadFromLocalFile(file: File): Promise<{ success: boolean; message: string }> {
    try {
      const text = await this.readFileAsText(file);
      const fileData = JSON.parse(text);
      
      // Handle both formats
      let tagData: string;
      if (fileData.metadata && fileData.data) {
        // New format with metadata
        tagData = JSON.stringify(fileData.data);
      } else {
        // Simple format - direct data
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
      console.error('Error loading from local file:', error);
      return {
        success: false,
        message: `❌ Error loading from file: ${error}`
      };
    }
  }

  /**
   * Generate Git commands for manual commit
   */
  generateGitCommands(filename: string): string {
    return `# Manual Git commands to commit your tag data:

# Add the file to staging
git add ${filename}

# Commit with a descriptive message
git commit -m "feat: update Greek football team tag classifications"

# Push to remote repository
git push origin main

# Alternative commit messages:
# git commit -m "Update tag data for Greek football teams"
# git commit -m "feat: add new team tags and categories"`;
  }

  /**
   * Generate instructions for manual file management
   */
  generateInstructions(filename: string): string {
    return `📁 File Management Instructions:

1. 📄 Copy the file content below
2. 💾 Create a new file named "${filename}" in your repository
3. 📝 Paste the content into the file
4. 💾 Save the file
5. 🔄 Commit manually using Git commands
6. 🚀 Push to your remote repository

💡 Tip: You can save this file in your repository root or in a 'data' folder for better organization.`;
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