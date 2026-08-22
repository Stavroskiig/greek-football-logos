import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Collection } from '../../models/collection';
import { Team } from '../../models/team';
import { CollectionService } from '../../services/collection.service';
import { TeamService } from '../../services/team.service';

@Component({
  selector: 'app-collection-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './collection-detail.component.html',
  styleUrls: ['./collection-detail.component.css']
})
export class CollectionDetailComponent implements OnInit {
  collection: Collection | undefined;
  logos: Team[] = [];
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private collectionService: CollectionService
  ) { }

  ngOnInit(): void {
    const collectionId = this.route.snapshot.paramMap.get('id');
    if (collectionId) {
      this.loadCollection(collectionId);
    }
  }

  private loadCollection(collectionId: string): void {
    this.collectionService.getCollectionWithLogos(collectionId).subscribe(result => {
      if (result) {
        this.collection = result.collection;
        this.logos = result.logos;
      } else {
        this.router.navigate(['/collections']);
      }
      this.isLoading = false;
    });
  }

  goBack(): void {
    this.router.navigate(['/collections']);
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
} 
