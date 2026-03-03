import { Injectable, Inject, PLATFORM_ID, signal, computed } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type Theme = 'light' | 'dark' | 'system';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    private readonly THEME_KEY = 'gfl-theme-preference';

    // Signal to hold the current theme preference (light, dark, or system)
    private themePref = signal<Theme>('system');

    // Computed signal to determine the actual active theme (light or dark)
    readonly isDarkMode = computed(() => {
        const pref = this.themePref();
        if (pref === 'dark') return true;
        if (pref === 'light') return false;

        // System preference fallback
        if (isPlatformBrowser(this.platformId)) {
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        return false;
    });

    constructor(@Inject(PLATFORM_ID) private platformId: Object) {
        this.initTheme();
        this.setupSystemThemeListener();
    }

    private initTheme(): void {
        if (isPlatformBrowser(this.platformId)) {
            const savedTheme = localStorage.getItem(this.THEME_KEY) as Theme;
            if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
                this.themePref.set(savedTheme);
            } else {
                this.themePref.set('system');
            }
            this.applyTheme();
        }
    }

    private setupSystemThemeListener(): void {
        if (isPlatformBrowser(this.platformId)) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            mediaQuery.addEventListener('change', () => {
                if (this.themePref() === 'system') {
                    this.applyTheme();
                }
            });
        }
    }

    private applyTheme(): void {
        if (isPlatformBrowser(this.platformId)) {
            if (this.isDarkMode()) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        }
    }

    setTheme(theme: Theme): void {
        this.themePref.set(theme);
        if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem(this.THEME_KEY, theme);
            this.applyTheme();
        }
    }

    toggleTheme(): void {
        // Simple toggle between light and dark (ignoring system for explicit toggle)
        const newTheme = this.isDarkMode() ? 'light' : 'dark';
        this.setTheme(newTheme);
    }
}
