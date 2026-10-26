import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LogoUploadService, LogoUploadResponse } from '../../services/logo-upload.service';
import { TeamService } from '../../services/team.service';
import { Team } from '../../models/team';

@Component({
  selector: 'app-admin-logo-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-logo-upload.component.html',
  styleUrls: ['./admin-logo-upload.component.css']
})
export class AdminLogoUploadComponent implements OnInit {
  selectedFile: File | null = null;
  imagePreviewUrl: string | null = null;
  imageDimensions: { width: number; height: number } | null = null;

  static readonly DEFAULT_FOLDERS: string[] = [
    'SUPERLEAGUE',
    'SUPERLEAGUE 2',
    'Γ ΕΘΝΙΚΗ',
    'history',
    'women',
    'ΕΠΣ ΑΘΗΝΩΝ',
    'ΕΠΣ ΑΙΤΩΛΟΑΚΑΡΝΑΝΙΑΣ',
    'ΕΠΣ ΑΝΑΤΟΛΙΚΗΣ ΑΤΤΙΚΗΣ',
    'ΕΠΣ ΑΡΓΟΛΙΔΑΣ',
    'ΕΠΣ ΑΡΚΑΔΙΑΣ',
    'ΕΠΣ ΑΡΤΑΣ',
    'ΕΠΣ ΑΧΑΪΑΣ',
    'ΕΠΣ ΒΟΙΩΤΙΑΣ',
    'ΕΠΣ ΓΡΕΒΕΝΩΝ',
    'ΕΠΣ ΔΡΑΜΑΣ',
    'ΕΠΣ ΔΥΤΙΚΗΣ ΑΤΤΙΚΗΣ',
    'ΕΠΣ ΔΩΔΕΚΑΝΗΣΟΥ',
    'ΕΠΣ ΕΒΡΟΥ',
    'ΕΠΣ ΕΥΒΟΙΑΣ',
    'ΕΠΣ ΕΥΡΥΤΑΝΙΑΣ',
    'ΕΠΣ ΖΑΚΥΝΘΟΥ',
    'ΕΠΣ ΗΛΕΙΑΣ',
    'ΕΠΣ ΗΜΑΘΙΑΣ',
    'ΕΠΣ ΗΠΕΙΡΟΥ',
    'ΕΠΣ ΗΡΑΚΛΕΙΟΥ',
    'ΕΠΣ ΘΕΣΠΡΩΤΙΑΣ',
    'ΕΠΣ ΘΕΣΣΑΛΙΑΣ',
    'ΕΠΣ ΘΡΑΚΗΣ',
    'ΕΠΣ ΚΑΒΑΛΑΣ',
    'ΕΠΣ ΚΑΡΔΙΤΣΑΣ',
    'ΕΠΣ ΚΑΣΤΟΡΙΑΣ',
    'ΕΠΣ ΚΕΡΚΥΡΑΣ',
    'ΕΠΣ ΚΕΦΑΛΛΗΝΙΑΣ-ΙΘΑΚΗΣ',
    'ΕΠΣ ΚΙΛΚΙΣ',
    'ΕΠΣ ΚΟΖΑΝΗΣ',
    'ΕΠΣ ΚΟΡΙΝΘΙΑΣ',
    'ΕΠΣ ΚΥΚΛΑΔΩΝ',
    'ΕΠΣ ΛΑΚΩΝΙΑΣ',
    'ΕΠΣ ΛΑΡΙΣΑΣ',
    'ΕΠΣ ΛΑΣΙΘΙΟΥ',
    'ΕΠΣ ΛΕΣΒΟΥ-ΛΗΜΝΟΥ',
    'ΕΠΣ ΜΑΚΕΔΟΝΙΑΣ',
    'ΕΠΣ ΜΕΣΣΗΝΙΑΣ',
    'ΕΠΣ ΞΑΝΘΗΣ',
    'ΕΠΣ ΠΕΙΡΑΙΑ',
    'ΕΠΣ ΠΕΛΛΑΣ',
    'ΕΠΣ ΠΙΕΡΙΑΣ',
    'ΕΠΣ ΠΡΕΒΕΖΑΣ-ΛΕΥΚΑΔΑΣ',
    'ΕΠΣ ΡΕΘΥΜΝΟΥ',
    'ΕΠΣ ΣΑΜΟΥ',
    'ΕΠΣ ΣΕΡΡΩΝ',
    'ΕΠΣ ΤΡΙΚΑΛΩΝ',
    'ΕΠΣ ΦΘΙΩΤΙΔΑΣ',
    'ΕΠΣ ΦΛΩΡΙΝΑΣ',
    'ΕΠΣ ΦΩΚΙΔΑΣ',
    'ΕΠΣ ΧΑΛΚΙΔΙΚΗΣ',
    'ΕΠΣ ΧΑΝΙΩΝ',
    'ΕΠΣ ΧΙΟΥ'
  ];

  availableFolders: string[] = [...AdminLogoUploadComponent.DEFAULT_FOLDERS];
  selectedFolder: string = 'SUPERLEAGUE';
  customFolder: string = '';
  isCustomFolder: boolean = false;

  filename: string = '';
  
  // Team assignment
  linkToTeam: boolean = false;
  teams: Team[] = [];
  filteredTeams: Team[] = [];
  selectedTeamId: string = '';
  teamSearchTerm: string = '';
  isHistorical: boolean = false;
  startYear: number | null = null;
  endYear: number | null = null;

  // Status
  isUploading: boolean = false;
  uploadSuccess: boolean = false;
  uploadResult: LogoUploadResponse | null = null;
  errorMessage: string | null = null;
  isDragging: boolean = false;

  constructor(
    private logoUploadService: LogoUploadService,
    private teamService: TeamService
  ) {}

  ngOnInit(): void {
    this.loadFolders();
    this.loadTeams();
  }

  loadFolders(): void {
    this.logoUploadService.getAvailableFolders().subscribe({
      next: (folders: string[]) => {
        if (folders && folders.length > 0) {
          // Merge unique folders from server with default list
          const set = new Set<string>([...folders, ...AdminLogoUploadComponent.DEFAULT_FOLDERS]);
          this.availableFolders = Array.from(set);
        }
      },
      error: (err: any) => {
        console.warn('Could not load dynamic folders from API, keeping full default list', err);
      }
    });
  }

  loadTeams(): void {
    this.teamService.getAllTeams(0, 1000).subscribe({
      next: (page: any) => {
        this.teams = (page.content || []).sort((a: Team, b: Team) => a.name.localeCompare(b.name));
        this.filteredTeams = [...this.teams];
      },
      error: (err: any) => console.error('Could not load teams', err)
    });
  }

  onTeamSearch(term: string): void {
    this.teamSearchTerm = term;
    if (!term.trim()) {
      this.filteredTeams = [...this.teams];
    } else {
      const lower = term.toLowerCase();
      this.filteredTeams = this.teams.filter(t => 
        t.name.toLowerCase().includes(lower) || (t.shortName && t.shortName.toLowerCase().includes(lower))
      );
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.processFile(input.files[0]);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      this.processFile(event.dataTransfer.files[0]);
    }
  }

  private processFile(file: File): void {
    if (!file.type.startsWith('image/')) {
      this.errorMessage = 'Please select a valid image file (.png, .svg, .webp, .jpg).';
      return;
    }

    this.selectedFile = file;
    this.errorMessage = null;
    this.uploadSuccess = false;
    this.uploadResult = null;

    // Auto populate clean filename without extension
    const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    this.filename = nameWithoutExt;

    // Detect year range if historical filename pattern is used (e.g. team-1980_1995)
    const yearMatch = nameWithoutExt.match(/-(\d{4})_(\d{4})$/);
    if (yearMatch) {
      this.isHistorical = true;
      this.startYear = parseInt(yearMatch[1], 10);
      this.endYear = parseInt(yearMatch[2], 10);
    }

    // Read and create preview URL
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.imagePreviewUrl = e.target.result;
      const img = new Image();
      img.onload = () => {
        this.imageDimensions = { width: img.width, height: img.height };
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  removeFile(): void {
    this.selectedFile = null;
    this.imagePreviewUrl = null;
    this.imageDimensions = null;
    this.filename = '';
    this.uploadSuccess = false;
    this.uploadResult = null;
    this.errorMessage = null;
  }

  onFolderChange(value: string): void {
    if (value === '__custom__') {
      this.isCustomFolder = true;
    } else {
      this.isCustomFolder = false;
      this.selectedFolder = value;
    }
  }

  uploadLogo(): void {
    if (!this.selectedFile) {
      this.errorMessage = 'Please choose an image file first.';
      return;
    }

    const folder = this.isCustomFolder ? this.customFolder.trim() : this.selectedFolder;
    if (!folder) {
      this.errorMessage = 'Please specify a target league / folder.';
      return;
    }

    this.isUploading = true;
    this.errorMessage = null;

    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('league', folder);
    
    if (this.filename.trim()) {
      formData.append('filename', this.filename.trim());
    }

    if (this.linkToTeam && this.selectedTeamId) {
      formData.append('teamId', this.selectedTeamId);
      formData.append('isHistorical', this.isHistorical.toString());
      if (this.startYear) formData.append('startYear', this.startYear.toString());
      if (this.endYear) formData.append('endYear', this.endYear.toString());
    }

    this.logoUploadService.uploadLogo(formData).subscribe({
      next: (res: LogoUploadResponse) => {
        this.isUploading = false;
        if (res.success) {
          this.uploadSuccess = true;
          this.uploadResult = res;
        } else {
          this.errorMessage = res.message || 'Upload failed.';
        }
      },
      error: (err: any) => {
        this.isUploading = false;
        console.error('Upload error', err);
        const serverError = err.error?.message || err.message || 'Error uploading logo to GitHub';
        this.errorMessage = serverError;
      }
    });
  }

  resetForm(): void {
    this.removeFile();
    this.linkToTeam = false;
    this.selectedTeamId = '';
    this.isHistorical = false;
    this.startYear = null;
    this.endYear = null;
  }
}
