import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { CommonModule } from '@angular/common';
import { ModalService } from './services/modal.service';
import { ImageModalComponent } from './components/image-modal/image-modal.component';
import { FooterComponent } from "./components/footer/footer.component";
import { ChangeManagerComponent } from './components/change-manager/change-manager.component';
import { ServerStatusComponent } from './components/server-status/server-status.component';
import { SeoService } from './services/seo.service';
import { StructuredDataService } from './services/structured-data.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, CommonModule, ImageModalComponent, FooterComponent, ChangeManagerComponent, ServerStatusComponent],
  template: `
    <app-header></app-header>
    <main class="main-content">
      <router-outlet></router-outlet>
    </main>
    <app-footer></app-footer>
    <app-image-modal *ngIf="modalService.modalData$ | async"></app-image-modal>
    <app-change-manager></app-change-manager>
    <app-server-status></app-server-status>
  `,
  styles: [`
    .main-content {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
      min-height: calc(100vh - 200px);
    }
  `]
})
export class AppComponent {
  constructor(
    public modalService: ModalService,
    private seoService: SeoService,
    private structuredDataService: StructuredDataService
  ) {}

  title = 'greek-football-logos';
}