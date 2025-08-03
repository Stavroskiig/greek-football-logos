import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { CommonModule } from '@angular/common';
import { ModalService } from './services/modal.service';
import { ImageModalComponent } from './components/image-modal/image-modal.component';
import { FooterComponent } from "./components/footer/footer.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, CommonModule, ImageModalComponent, FooterComponent],
  template: `
    <app-header></app-header>
    <main class="main-content">
      <router-outlet></router-outlet>
    </main>
    <app-footer></app-footer>
    <app-image-modal *ngIf="modalService.modalData$ | async"></app-image-modal>
  `,
  styles: [`
    .main-content {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }
  `]
})
export class AppComponent {
  constructor(public modalService: ModalService) {}

  title = 'greek-football-logos';
}