import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Collection } from '../models/collection';
import { TeamLogo } from '../models/team-logo';
import { LogoService } from './logo.service';

@Injectable({
  providedIn: 'root'
})
export class CollectionService {
  private collectionsSubject = new BehaviorSubject<Collection[]>([]);
  private readonly STORAGE_KEY = 'logo_collections';

  constructor(private logoService: LogoService) {
    this.loadCollections();
  }

  private loadCollections(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const collections = JSON.parse(stored).map((collection: any) => ({
          ...collection,
          createdAt: new Date(collection.createdAt),
          updatedAt: new Date(collection.updatedAt)
        }));
        this.collectionsSubject.next(collections);
      } else {
        // Initialize with default collections if no stored data
        this.initializeDefaultCollections();
      }
    } catch (error) {
      console.error('Error loading collections:', error);
      this.initializeDefaultCollections();
    }
  }

  private saveCollections(collections: Collection[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(collections));
    } catch (error) {
      console.error('Error saving collections:', error);
    }
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
    return combineLatest([
      this.getCollectionById(id),
      this.logoService.getAllLogos()
    ]).pipe(
      map(([collection, allLogos]) => {
        if (!collection) return undefined;

        const logos = allLogos.filter(logo =>
          collection.logoIds.includes(logo.id)
        );

        return { collection, logos };
      })
    );
  }

  createCollection(collectionData: Omit<Collection, 'id' | 'createdAt' | 'updatedAt'>): Collection {
    const newCollection: Collection = {
      ...collectionData,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const currentCollections = this.collectionsSubject.value;
    const updatedCollections = [...currentCollections, newCollection];

    this.collectionsSubject.next(updatedCollections);
    this.saveCollections(updatedCollections);

    return newCollection;
  }

  updateCollection(id: string, updates: Partial<Omit<Collection, 'id' | 'createdAt'>>): boolean {
    const currentCollections = this.collectionsSubject.value;
    const index = currentCollections.findIndex(c => c.id === id);

    if (index === -1) return false;

    const updatedCollection: Collection = {
      ...currentCollections[index],
      ...updates,
      updatedAt: new Date()
    };

    const updatedCollections = [...currentCollections];
    updatedCollections[index] = updatedCollection;

    this.collectionsSubject.next(updatedCollections);
    this.saveCollections(updatedCollections);

    return true;
  }

  deleteCollection(id: string): boolean {
    const currentCollections = this.collectionsSubject.value;
    const filteredCollections = currentCollections.filter(c => c.id !== id);

    if (filteredCollections.length === currentCollections.length) {
      return false;
    }

    this.collectionsSubject.next(filteredCollections);
    this.saveCollections(filteredCollections);

    return true;
  }

  addLogoToCollection(collectionId: string, logoId: string): boolean {
    const currentCollections = this.collectionsSubject.value;
    const collection = currentCollections.find(c => c.id === collectionId);

    if (!collection || collection.logoIds.includes(logoId)) {
      return false;
    }

    const updatedCollection: Collection = {
      ...collection,
      logoIds: [...collection.logoIds, logoId],
      updatedAt: new Date()
    };

    const updatedCollections = currentCollections.map(c =>
      c.id === collectionId ? updatedCollection : c
    );

    this.collectionsSubject.next(updatedCollections);
    this.saveCollections(updatedCollections);

    return true;
  }

  removeLogoFromCollection(collectionId: string, logoId: string): boolean {
    const currentCollections = this.collectionsSubject.value;
    const collection = currentCollections.find(c => c.id === collectionId);

    if (!collection || !collection.logoIds.includes(logoId)) {
      return false;
    }

    const updatedCollection: Collection = {
      ...collection,
      logoIds: collection.logoIds.filter(id => id !== logoId),
      updatedAt: new Date()
    };

    const updatedCollections = currentCollections.map(c =>
      c.id === collectionId ? updatedCollection : c
    );

    this.collectionsSubject.next(updatedCollections);
    this.saveCollections(updatedCollections);

    return true;
  }

  searchCollections(searchTerm: string): Observable<Collection[]> {
    return this.collectionsSubject.pipe(
      map(collections => collections.filter(collection =>
        collection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        collection.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        collection.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      ))
    );
  }

  getCollectionsByTag(tag: string): Observable<Collection[]> {
    return this.collectionsSubject.pipe(
      map(collections => collections.filter(collection =>
        collection.tags.includes(tag)
      ))
    );
  }

  private generateId(): string {
    return 'collection_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Initialize with pre-defined collections
  private initializeDefaultCollections(): void {
    const defaultCollections: Collection[] = [
      {
        id: 'big-4-teams',
        name: 'Big 4 Teams',
        description: 'The four most successful teams in Greek football history - Panathinaikos, AEK Athens, PAOK, and Olympiacos. These teams have dominated Greek football for decades and have the largest fan bases in the country.',
        logoIds: ['panathinaikos', 'aek', 'paok', 'olympiakos'],
        tags: ['big-4', 'superleague', 'classic', 'major-teams'],
        isPublic: true,
        featured: true,
        coverImage: '/assets/logos/panathinaikos.png',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      },
      {
        id: 'athens-teams',
        name: 'Athens Teams',
        description: 'Football clubs based in Athens and surrounding areas. The capital city is home to many historic clubs including Panathinaikos, AEK Athens, and several other teams from the greater Athens area.',
        logoIds: ['panathinaikos', 'aek', 'atromitos', 'kallithea', 'panionios'],
        tags: ['athens', 'capital', 'central-greece', 'attica'],
        isPublic: true,
        featured: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      },
      {
        id: 'thessaloniki-teams',
        name: 'Thessaloniki Teams',
        description: 'Football clubs from Thessaloniki and northern Greece. The second largest city in Greece has a rich football tradition with teams like PAOK and Aris Thessaloniki.',
        logoIds: ['paok', 'aris', 'panserraikos'],
        tags: ['thessaloniki', 'northern-greece', 'macedonia'],
        isPublic: true,
        featured: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      },
      {
        id: 'superleague-classic',
        name: 'Super League Classic',
        description: 'Traditional teams that have been part of the Greek Super League for many years. These clubs represent the backbone of Greek football with rich histories and loyal fan bases.',
        logoIds: ['olympiakos', 'panathinaikos', 'aek', 'paok', 'aris', 'ofi'],
        tags: ['superleague', 'classic', 'traditional', 'historic'],
        isPublic: true,
        featured: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      },
      {
        id: 'cup-winners',
        name: 'Greek Cup Winners',
        description: 'Teams that have won the Greek Cup multiple times throughout their history. The Greek Cup is one of the most prestigious domestic competitions in Greek football.',
        logoIds: ['olympiakos', 'panathinaikos', 'aek', 'paok', 'aris'],
        tags: ['cup-winners', 'trophies', 'success', 'prestigious'],
        isPublic: true,
        featured: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      }
    ];

    this.collectionsSubject.next(defaultCollections);
    this.saveCollections(defaultCollections);
  }
} 