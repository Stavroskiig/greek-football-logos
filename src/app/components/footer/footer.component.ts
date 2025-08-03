import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="w-full mx-auto bg-white rounded-t-2xl shadow-sm border border-gray-200 p-6 mt-8 text-gray-500 text-sm text-center">
      <p class="leading-relaxed">
        Disclaimer: The logos displayed on this website are the property of their respective football clubs and
        organizations. They are used here for informational and non-commercial purposes only. All rights belong
        to their rightful owners.
      </p>
    </footer>
  `,
})
export class FooterComponent {}
