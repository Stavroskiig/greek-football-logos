import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LocalFileEditorService } from '../../services/local-file-editor.service';

@Component({
  selector: 'app-local-file-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './local-file-editor.component.html'
})
export class LocalFileEditorComponent {
  selectedFileType: 'full' | 'backup' | 'simple' = 'full';
  showFileContent = false;
  currentFile: { filename: string; content: string } | null = null;
  showGitCommands = false;

  constructor(private localFileEditor: LocalFileEditorService) {}

  generateFile() {
    let fileData: { filename: string; content: string };

    switch (this.selectedFileType) {
      case 'full':
        fileData = this.localFileEditor.generateLocalFileContent();
        break;
      case 'backup':
        fileData = this.localFileEditor.generateBackupContent();
        break;
      case 'simple':
        fileData = this.localFileEditor.generateSimpleFileContent();
        break;
      default:
        fileData = this.localFileEditor.generateLocalFileContent();
    }

    this.currentFile = fileData;
    this.showFileContent = true;
    this.showGitCommands = false;
  }

  showGitCommandsForFile() {
    if (this.currentFile) {
      this.showGitCommands = true;
    }
  }

  getGitCommands(): string {
    if (this.currentFile) {
      return this.localFileEditor.generateGitCommands(this.currentFile.filename);
    }
    return '';
  }

  getInstructions(): string {
    if (this.currentFile) {
      return this.localFileEditor.generateInstructions(this.currentFile.filename);
    }
    return '';
  }

  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      // You could add a toast notification here
      console.log('Copied to clipboard');
    });
  }

  downloadFile() {
    if (this.currentFile) {
      const blob = new Blob([this.currentFile.content], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = this.currentFile.filename;
      a.click();
      window.URL.revokeObjectURL(url);
    }
  }

  loadFromFile(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.localFileEditor.loadFromLocalFile(file).then(result => {
        if (result.success) {
          alert(result.message);
        } else {
          alert('Error: ' + result.message);
        }
      });
    }
  }
} 