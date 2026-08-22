import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Collection } from '../../models/collection';
import { CollectionService } from '../../services/collection.service';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-collections',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './collections.component.html',
  styleUrls: ['./collections.component.css']
})
export class CollectionsComponent implements OnInit, OnDestroy {
  collections: Collection[] = [];
  searchTerm = '';

  // Pagination state
  currentPage = 0;
  pageSize = 12;
  totalElements = 0;
  totalPages = 0;

  private searchSubject = new Subject<string>();
  private searchSubscription: Subscription | undefined;

  constructor(
    private collectionService: CollectionService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadCollectionPage(this.currentPage);

    // Setup search debounce
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => {
      this.searchTerm = term;
      this.currentPage = 0; // Reset to first page on search
      this.loadCollectionPage(this.currentPage);
    });
  }

  ngOnDestroy(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  loadCollectionPage(pageIndex: number): void {
    this.collectionService.getCollectionsPage(pageIndex, this.pageSize, this.searchTerm, true)
      .subscribe({
        next: (page) => {
          this.collections = page.content;
          this.currentPage = page.number;
          this.totalPages = page.totalPages;
          this.totalElements = page.totalElements;
        },
        error: (err) => console.error('Failed to load collections', err)
      });
  }

  onSearchChange(): void {
    this.searchSubject.next(this.searchTerm);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.loadCollectionPage(this.currentPage + 1);
    }
  }

  previousPage(): void {
    if (this.currentPage > 0) {
      this.loadCollectionPage(this.currentPage - 1);
    }
  }

  get filteredCollections(): Collection[] {
    return this.collections;
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
