import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TagService } from '../../services/tag.service';

@Component({
  selector: 'app-tag-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tag-selector.component.html'
})
export class TagSelectorComponent implements OnInit {
  @Output() tagsChange = new EventEmitter<string[]>();
  
  availableTags: string[] = [];
  selectedTags: string[] = [];
  showDropdown = false;

  constructor(private tagService: TagService) {}

  ngOnInit() {
    this.tagService.getAvailableTags().subscribe(tags => {
      this.availableTags = tags;
    });
  }

  toggleTag(tag: string) {
    const index = this.selectedTags.indexOf(tag);
    if (index > -1) {
      this.selectedTags.splice(index, 1);
    } else {
      this.selectedTags.push(tag);
    }
    this.tagsChange.emit([...this.selectedTags]);
  }

  isTagSelected(tag: string): boolean {
    return this.selectedTags.includes(tag);
  }

  clearAllTags() {
    this.selectedTags = [];
    this.tagsChange.emit([]);
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  getSelectedTagsText(): string {
    if (this.selectedTags.length === 0) {
      return 'Select tags...';
    }
    if (this.selectedTags.length <= 2) {
      return this.selectedTags.join(', ');
    }
    return `${this.selectedTags.length} tags selected`;
  }
} 