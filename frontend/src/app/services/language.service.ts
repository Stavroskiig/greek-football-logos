import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class LanguageService {
    private readonly LANG_KEY = 'preferredLang';
    public currentLang: string = 'el'; // Default to Greek

    constructor(
        private translate: TranslateService,
        @Inject(PLATFORM_ID) private platformId: Object
    ) {
        this.translate.addLangs(['en', 'el']);
        this.translate.setDefaultLang('el'); // Fallback language

        if (isPlatformBrowser(this.platformId)) {
            const savedLang = localStorage.getItem(this.LANG_KEY);
            if (savedLang && ['en', 'el'].includes(savedLang)) {
                this.currentLang = savedLang;
            }
        }

        this.setLanguage(this.currentLang);
    }

    public setLanguage(lang: string): void {
        if (['en', 'el'].includes(lang)) {
            this.currentLang = lang;
            this.translate.use(lang);
            if (isPlatformBrowser(this.platformId)) {
                localStorage.setItem(this.LANG_KEY, lang);
                document.documentElement.lang = lang; // Update html lang attribute for SEO
            }
        }
    }

    public toggleLanguage(): void {
        const nextLang = this.currentLang === 'el' ? 'en' : 'el';
        this.setLanguage(nextLang);
    }
}
