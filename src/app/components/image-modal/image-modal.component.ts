import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-image-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-backdrop" (click)="closeModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <button class="close-button" (click)="closeModal()">✕</button>
        <ng-container *ngIf="modalService.modalData$ | async as data">
          <img [src]="data.logoPath" [alt]="data.teamInfo.name + ' logo'" class="full-size-logo">
        </ng-container>
      </div>
    </div>
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .modal-content {
      background: transparent;
      position: relative;
      padding: 0;
      max-width: 90vw;
      max-height: 90vh;
    }

    .close-button {
      position: absolute;
      top: -40px;
      right: -40px;
      background: none;
      border: none;
      font-size: 2rem;
      cursor: pointer;
      color: white;
      padding: 8px;
      z-index: 1001;
    }

    .full-size-logo {
      max-width: 90vw;
      max-height: 90vh;
      object-fit: contain;
    }
  `]
})
export class ImageModalComponent {
  constructor(public modalService: ModalService) {}

  closeModal() {
    this.modalService.closeModal();
  }
} 