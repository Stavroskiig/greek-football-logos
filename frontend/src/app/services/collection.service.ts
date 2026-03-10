import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, firstValueFrom, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Collection } from '../models/collection';
import { TeamLogo } from '../models/team-logo';
import { LogoService, Page } from './logo.service';
import { CollectionFileService } from './collection-file.service';

@Injectable({
  providedIn: 'root'
})
export class CollectionService {
  private collectionsSubject = new BehaviorSubject<Collection[]>([]);
  private readonly STORAGE_KEY = 'logo_collections_temp';
  private readonly API_URL = 'http://localhost:8080/api/collections';

  constructor(
    private logoService: LogoService,
    private collectionFileService: CollectionFileService,
    private http: HttpClient
  ) {
    this.loadCollections();
  }

  private loadCollections(): void {
    // Only fetch first 10 for global state so standard UI won't fail
    this.getCollectionsPage(0, 10, '', false).subscribe({
      next: (page) => {
        if (page && page.content && page.content.length > 0) {
          this.collectionsSubject.next(page.content);
          console.log('Collections basic cache loaded from API:', page.content.length);
        } else {
          console.log('No collections found in API. Initializing empty.');
          this.collectionsSubject.next([]);
        }
      },
      error: (err) => console.error('Error loading collections from API:', err)
    });
  }

  getCollectionsPage(page: number, size: number, searchTerm?: string, publicOnly: boolean = false): Observable<Page<Collection>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('publicOnly', publicOnly.toString());

    if (searchTerm) {
      params = params.set('search', searchTerm);
    }

    return this.http.get<Page<Collection>>(this.API_URL, { params });
  }

  // --- MIGRATION SCRIPT ---
  public async migrateLocalStorageToBackend(): Promise<void> {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) {
      console.log('No local storage collections to migrate.');
      return;
    }

    const collections: any[] = JSON.parse(stored);
    console.log(`Starting migration of ${collections.length} collections...`);

    let successCount = 0;
    for (const collectionData of collections) {
      try {
        const payload = {
          ...collectionData,
          // Convert string iso dates back to backend format or just let backend handle dates
          createdAt: undefined,
          updatedAt: undefined
        };

        await firstValueFrom(this.http.post(this.API_URL, payload));
        console.log(`Migrated: ${collectionData.name}`);
        successCount++;
      } catch (err) {
        console.error(`Failed to migrate: ${collectionData.name}`, err);
      }
    }

    console.log(`Migration complete. ${successCount}/${collections.length} succeeded. Reloading from API...`);
    // Optional: clear local storage so we don't accidentally migrate again
    // localStorage.removeItem(this.STORAGE_KEY);
    this.loadCollections();
  }

  getCollections(): Observable<Collection[]> {
    return this.collectionsSubject.asObservable();
  }

  getPublicCollections(): Observable<Collection[]> {
    return this.collectionsSubject.pipe(
      map(collections => collections.filter(c => c.isPublic))
    );
  }

  getFeaturedCollections(): Observable<Collection[]> {
    return this.collectionsSubject.pipe(
      map(collections => collections.filter(c => c.featured && c.isPublic))
    );
  }

  getCollectionById(id: string): Observable<Collection | undefined> {
    return this.collectionsSubject.pipe(
      map(collections => collections.find(c => c.id === id))
    );
  }

  getCollectionWithLogos(id: string): Observable<{ collection: Collection; logos: TeamLogo[] } | undefined> {
    return this.getCollectionById(id).pipe(
      switchMap(collection => {
        if (!collection) return of(undefined);
        if (!collection.logoIds || collection.logoIds.length === 0) {
          return of({ collection, logos: [] });
        }

        return this.logoService.getLogosByIds(collection.logoIds, undefined, 0, Math.max(collection.logoIds.length, 500)).pipe(
          map(page => ({ collection, logos: page.content }))
        );
      })
    );
  }

  createCollection(collectionData: Omit<Collection, 'id' | 'createdAt' | 'updatedAt'>): Observable<Collection> {
    return this.http.post<Collection>(this.API_URL, collectionData).pipe(
      map((newCollection) => {
        const currentCollections = this.collectionsSubject.value;
        this.collectionsSubject.next([...currentCollections, newCollection]);
        return newCollection;
      })
    );
  }

  updateCollection(id: string, updates: Partial<Omit<Collection, 'id' | 'createdAt'>>): Observable<Collection> {
    const currentCollections = this.collectionsSubject.value;
    const existing = currentCollections.find(c => c.id === id);
    const payload = { ...existing, ...updates };

    return this.http.put<Collection>(`${this.API_URL}/${id}`, payload).pipe(
      map((updatedCollection) => {
        const updatedCollections = currentCollections.map(c => c.id === id ? updatedCollection : c);
        this.collectionsSubject.next(updatedCollections);
        return updatedCollection;
      })
    );
  }

  deleteCollection(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`).pipe(
      map(() => {
        const currentCollections = this.collectionsSubject.value;
        const filteredCollections = currentCollections.filter(c => c.id !== id);
        this.collectionsSubject.next(filteredCollections);
      })
    );
  }

  addLogoToCollection(collectionId: string, logoId: string): void {
    const currentCollections = this.collectionsSubject.value;
    const collection = currentCollections.find(c => c.id === collectionId);

    if (!collection || collection.logoIds.includes(logoId)) return;

    const payload = { ...collection, logoIds: [...collection.logoIds, logoId] };
    this.http.put<Collection>(`${this.API_URL}/${collectionId}`, payload).subscribe({
      next: (updatedCollection) => {
        const updatedCollections = currentCollections.map(c => c.id === collectionId ? updatedCollection : c);
        this.collectionsSubject.next(updatedCollections);
      },
      error: (err) => console.error('Failed to add logo', err)
    });
  }

  removeLogoFromCollection(collectionId: string, logoId: string): void {
    const currentCollections = this.collectionsSubject.value;
    const collection = currentCollections.find(c => c.id === collectionId);

    if (!collection || !collection.logoIds.includes(logoId)) return;

    const payload = { ...collection, logoIds: collection.logoIds.filter(id => id !== logoId) };
    this.http.put<Collection>(`${this.API_URL}/${collectionId}`, payload).subscribe({
      next: (updatedCollection) => {
        const updatedCollections = currentCollections.map(c => c.id === collectionId ? updatedCollection : c);
        this.collectionsSubject.next(updatedCollections);
      },
      error: (err) => console.error('Failed to remove logo', err)
    });
  }

  searchCollections(searchTerm: string): Observable<Collection[]> {
    return this.getCollectionsPage(0, 50, searchTerm).pipe(
      map(page => page.content)
    );
  }

  getCollectionLogos(collectionId: string): Observable<TeamLogo[]> {
    return this.getCollectionById(collectionId).pipe(
      switchMap(collection => {
        if (!collection || !collection.logoIds || collection.logoIds.length === 0) {
          return of([]);
        }
        return this.logoService.getLogosByIds(collection.logoIds, undefined, 0, Math.max(collection.logoIds.length, 500)).pipe(
          map(page => page.content)
        );
      })
    );
  }

  getCollectionsByTag(tag: string): Observable<Collection[]> {
    return this.collectionsSubject.pipe(
      map(collections => collections.filter(collection =>
        collection.tags.includes(tag)
      ))
    );
  }

  exportCurrentCollections(): void {
    const currentCollections = this.collectionsSubject.value;
    this.collectionFileService.exportCollectionsToFile(currentCollections);
  }

  getFileInstructions(): string {
    return this.collectionFileService.getCollectionsFileContent();
  }
}