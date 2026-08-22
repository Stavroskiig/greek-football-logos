import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Collection } from '../../models/collection';
import { Team } from '../../models/team';
import { CollectionService } from '../../services/collection.service';
import { TeamService } from '../../services/team.service';

@Component({
  selector: 'app-admin-collection-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-collection-manager.component.html',
  styleUrls: ['./admin-collection-manager.component.css']
})
export class AdminCollectionManagerComponent implements OnInit {
  collections: Collection[] = [];
  allLogos: Team[] = [];
  isLoading = true;

  // Form states
  showCreateForm = false;
  editingCollection: Collection | null = null;

  // Create form
  newCollection = {
    name: '',
    description: '',
    logoIds: [] as string[],
    tags: [] as string[],
    isPublic: true,
    featured: false
  };

  // Edit form
  editForm = {
    name: '',
    description: '',
    logoIds: [] as string[],
    tags: [] as string[],
    isPublic: true,
    featured: false
  };

  // Form helpers
  newTag = '';
  editTag = '';
  searchTerm = '';
  selectedLeague = '';
  availableLeagues: string[] = [];
  filteredLogos: Team[] = [];

  constructor(
    private collectionService: CollectionService,
    private TeamService: TeamService
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.isLoading = true;

    // Load collections
    this.collectionService.getCollections().subscribe(collections => {
      this.collections = collections;
      this.isLoading = false;
    });

    // Load all logos
    this.TeamService.getTeamsManifest().subscribe(logos => {
      this.allLogos = logos;
      this.populateAvailableLeagues();
      this.filterLogos();
    });
  }

  private populateAvailableLeagues(): void {
    const leagues = new Set<string>();
    this.allLogos.forEach(logo => {
      if (logo.league) {
        leagues.add(logo.league.name);
      }
    });
    this.availableLeagues = Array.from(leagues).sort();
  }

  filterLogos(): void {
    let filtered = this.allLogos;

    // Filter by search term
    if (this.searchTerm.trim()) {
      filtered = filtered.filter(logo =>
        logo.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        logo.league?.name.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    // Filter by selected league
    if (this.selectedLeague) {
      filtered = filtered.filter(logo => logo.league?.name === this.selectedLeague);
    }

    this.filteredLogos = filtered;
  }

  onSearchChange(): void {
    this.filterLogos();
  }

  onLeagueChange(): void {
    this.filterLogos();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedLeague = '';
    this.filterLogos();
  }

  // Create collection methods
  showCreateCollection(): void {
    this.showCreateForm = true;
    this.editingCollection = null;
    this.resetCreateForm();
  }

  cancelCreate(): void {
    this.showCreateForm = false;
    this.resetCreateForm();
  }

  resetCreateForm(): void {
    this.newCollection = {
      name: '',
      description: '',
      logoIds: [],
      tags: [],
      isPublic: true,
      featured: false
    };
    this.newTag = '';
  }

  addTagToCreate(): void {
    if (this.newTag.trim() && !this.newCollection.tags.includes(this.newTag.trim())) {
      this.newCollection.tags.push(this.newTag.trim());
      this.newTag = '';
    }
  }

  removeTagFromCreate(tag: string): void {
    this.newCollection.tags = this.newCollection.tags.filter(t => t !== tag);
  }

  addLogoToCreate(logoId: string): void {
    if (!this.newCollection.logoIds.includes(logoId)) {
      this.newCollection.logoIds.push(logoId);
    }
  }

  removeLogoFromCreate(logoId: string): void {
    this.newCollection.logoIds = this.newCollection.logoIds.filter(id => id !== logoId);
  }

  createCollection(): void {
    if (!this.newCollection.name.trim()) return;

    const collectionData = {
      name: this.newCollection.name.trim(),
      description: this.newCollection.description.trim(),
      logoIds: this.newCollection.logoIds,
      tags: this.newCollection.tags,
      isPublic: this.newCollection.isPublic,
      featured: this.newCollection.featured
    };

    this.collectionService.createCollection(collectionData).subscribe({
      next: () => {
        this.showCreateForm = false;
        this.resetCreateForm();
        // this.loadData(); // Not needed if subject auto-updates, but safe to call
      },
      error: (err) => console.error('Error creating collection:', err)
    });
  }

  // Edit collection methods
  editCollection(collection: Collection): void {
    this.editingCollection = collection;
    this.showCreateForm = false;
    this.editForm = {
      name: collection.name,
      description: collection.description,
      logoIds: [...collection.logoIds],
      tags: [...collection.tags],
      isPublic: collection.isPublic,
      featured: collection.featured ?? false
    };
    this.editTag = '';
  }

  cancelEdit(): void {
    this.editingCollection = null;
    this.editForm = {
      name: '',
      description: '',
      logoIds: [],
      tags: [],
      isPublic: true,
      featured: false
    };
    this.editTag = '';
  }

  addTagToEdit(): void {
    if (this.editTag.trim() && !this.editForm.tags.includes(this.editTag.trim())) {
      this.editForm.tags.push(this.editTag.trim());
      this.editTag = '';
    }
  }

  removeTagFromEdit(tag: string): void {
    this.editForm.tags = this.editForm.tags.filter(t => t !== tag);
  }

  addLogoToEdit(logoId: string): void {
    if (!this.editForm.logoIds.includes(logoId)) {
      this.editForm.logoIds.push(logoId);
    }
  }

  removeLogoFromEdit(logoId: string): void {
    this.editForm.logoIds = this.editForm.logoIds.filter(id => id !== logoId);
  }

  saveCollection(): void {
    if (!this.editingCollection || !this.editForm.name.trim()) return;

    const updates = {
      name: this.editForm.name.trim(),
      description: this.editForm.description.trim(),
      logoIds: this.editForm.logoIds,
      tags: this.editForm.tags,
      isPublic: this.editForm.isPublic,
      featured: this.editForm.featured
    };

    this.collectionService.updateCollection(this.editingCollection.id, updates).subscribe({
      next: () => {
        this.editingCollection = null;
      },
      error: (err) => console.error('Error updating collection:', err)
    });
  }

  deleteCollection(collection: Collection): void {
    if (confirm(`Are you sure you want to delete the collection "${collection.name}"?`)) {
      this.collectionService.deleteCollection(collection.id).subscribe({
        error: (err) => console.error('Error deleting collection:', err)
      });
    }
  }

  // Helper methods
  getCollectionLogos(logoIds: string[]): Team[] {
    return this.allLogos.filter(logo => logoIds.includes(logo.id));
  }

  getTagClass(tag: string): string {
    const tagClasses: { [key: string]: string } = {
      'big-4': 'tag-primary',
      'superleague': 'tag-success',
      'athens': 'tag-info',
      'thessaloniki': 'tag-warning',
      'classic': 'tag-secondary',
      'capital': 'tag-dark',
      'northern-greece': 'tag-primary',
      'macedonia': 'tag-info'
    };
    return tagClasses[tag] || 'tag-light';
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString();
  }

  exportCollections(): void {
    this.collectionService.exportCurrentCollections();
  }

  async migrateCollections(): Promise<void> {
    if (confirm('This will migrate your local storage collections to the backend API. Proceed?')) {
      this.isLoading = true;
      try {
        await this.collectionService.migrateLocalStorageToBackend();
        alert('Migration complete! Refreshing data.');
        this.loadData();
      } catch (err) {
        console.error('Migration failed:', err);
        alert('Migration encountered an error. Check console.');
        this.isLoading = false;
      }
    }
  }
} 
