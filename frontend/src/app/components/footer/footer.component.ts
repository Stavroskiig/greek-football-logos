import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="w-full mx-auto bg-white dark:bg-gray-900 rounded-t-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 mt-8 text-gray-500 dark:text-gray-400 text-sm text-center transition-colors duration-200">
      <p class="leading-relaxed">
        Disclaimer: The logos displayed on this website are the property of their respective football clubs and
        organizations. They are used here for informational and non-commercial purposes only. All rights belong
        to their rightful owners.
      </p>
    </footer>
  `,
})
export class FooterComponent { }
