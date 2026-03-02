import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TeamInfo } from '../models/team-info';

export interface ModalData {
  teamInfo: TeamInfo;
  logoPath: string;
}

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private modalDataSubject = new BehaviorSubject<ModalData | null>(null);
  modalData$ = this.modalDataSubject.asObservable();

  openModal(data: ModalData) {
    this.modalDataSubject.next(data);
  }

  closeModal() {
    this.modalDataSubject.next(null);
  }
} 