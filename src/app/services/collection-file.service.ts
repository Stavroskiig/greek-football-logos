import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Collection } from '../models/collection';

export interface CollectionsData {
  collections: Collection[];
}

@Injectable({
  providedIn: 'root'
})
export class CollectionFileService {
  private readonly COLLECTIONS_FILE_PATH = 'assets/data/collections.json';

  constructor(private http: HttpClient) {}

  loadCollectionsFromFile(): Observable<Collection[]> {
    return this.http.get<CollectionsData>(this.COLLECTIONS_FILE_PATH).pipe(
      map(data => data.collections.map(collection => ({
        ...collection,
        createdAt: new Date(collection.createdAt),
        updatedAt: new Date(collection.updatedAt)
      }))),
      catchError(error => {
        console.error('Error loading collections from file:', error);
        return of([]);
      })
    );
  }

  exportCollectionsToFile(collections: Collection[]): void {
    const data: CollectionsData = { collections };
    const jsonString = JSON.stringify(data, null, 2);
    
    // Create a blob and download link
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'collections.json';
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    window.URL.revokeObjectURL(url);
    
    console.log('Collections exported to collections.json');
    console.log('Please replace the content of src/assets/data/collections.json with the downloaded file');
  }

  getCollectionsFileContent(): string {
    return `To update the collections file:

1. Go to Admin > Collection Management
2. Make your changes to collections
3. Click "Export Collections" button
4. Replace the content of src/assets/data/collections.json with the downloaded file
5. Commit and push the changes to your repository

The collections will be loaded from the file on the next application restart.`;
  }
} 