import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Collection } from '../../models/collection';
import { CollectionService } from '../../services/collection.service';

@Component({
  selector: 'app-collections',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './collections.component.html',
  styleUrls: ['./collections.component.css']
})
export class CollectionsComponent implements OnInit {
  collections: Collection[] = [];
  filteredCollections: Collection[] = [];
  searchTerm = '';

  constructor(
    private collectionService: CollectionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCollections();
  }

  private loadCollections(): void {
    this.collectionService.getPublicCollections().subscribe(collections => {
      this.collections = collections;
      this.filterCollections();
    });
  }

  filterCollections(): void {
    if (!this.searchTerm.trim()) {
      this.filteredCollections = this.collections;
    } else {
      this.filteredCollections = this.collections.filter(collection =>
        collection.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        collection.description.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        collection.tags.some(tag => tag.toLowerCase().includes(this.searchTerm.toLowerCase()))
      );
    }
  }

  onSearchChange(): void {
    this.filterCollections();
  }

  viewCollection(collectionId: string): void {
    this.router.navigate(['/collections', collectionId]);
  }

  getCollectionPreview(collection: Collection): string {
    return collection.description.length > 100
      ? collection.description.substring(0, 100) + '...'
      : collection.description;
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
} 