import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-image-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './image-modal.component.html'
})
export class ImageModalComponent {
  constructor(public modalService: ModalService) {}

  closeModal() {
    this.modalService.closeModal();
  }
} 