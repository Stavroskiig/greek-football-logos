import { Injectable } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  private readonly defaultTitle = 'Greek Football Logos - Ελληνικά Λογότυπα Ποδοσφαίρου';
  private readonly defaultDescription = 'Explore and discover Greek football team logos from all leagues. Browse logos by tags, search teams, and manage team tags.';

  constructor(
    private titleService: Title,
    private metaService: Meta,
    private router: Router
  ) {
    this.setupRouteChangeListener();
  }

  private setupRouteChangeListener(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updatePageTitle();
    });
  }

  private updatePageTitle(): void {
    const currentUrl = this.router.url;
    let title = this.defaultTitle;
    let description = this.defaultDescription;

    switch (currentUrl) {
      case '/':
        title = 'Greek Football Logos - Ελληνικά Λογότυπα Ποδοσφαίρου';
        description = 'Explore and discover Greek football team logos from all leagues. Browse logos by tags, search teams, and manage team tags.';
        break;
      case '/misc':
        title = 'Browse Logos by Tags - Greek Football Logos';
        description = 'Browse and filter Greek football team logos by tags. Search for specific teams and discover logos from all Greek football leagues.';
        break;
      case '/tag-manager':
        title = 'Tag Manager - Greek Football Logos';
        description = 'Manage team tags and organize Greek football logos. Add, remove, and organize tags for better logo discovery.';
        break;
      default:
        if (currentUrl.startsWith('/team/')) {
          const teamName = this.extractTeamNameFromUrl(currentUrl);
          title = `${teamName} Logo - Greek Football Logos`;
          description = `View the official logo of ${teamName}. High-quality Greek football team logo.`;
        }
        break;
    }

    this.setTitle(title);
    this.setDescription(description);
  }

  private extractTeamNameFromUrl(url: string): string {
    const teamId = url.split('/').pop() || '';
    // Convert team ID to readable name (you can expand this mapping)
    const teamNameMap: { [key: string]: string } = {
      'panathinaikos': 'Panathinaikos',
      'olympiakos': 'Olympiacos',
      'aek': 'AEK Athens',
      'paok': 'PAOK',
      'aris': 'Aris Thessaloniki',
      'lamia': 'PAS Lamia',
      'ofi': 'OFI Crete',
      'volos': 'Volos NFC',
      'asteras-tripolis': 'Asteras Tripolis',
      'panetolikos': 'Panetolikos',
      'atromitos': 'Atromitos',
      'panserraikos': 'Panserraikos',
      'kallithea': 'Kallithea',
      'levadiakos': 'Levadiakos'
    };
    
    return teamNameMap[teamId] || teamId.charAt(0).toUpperCase() + teamId.slice(1);
  }

  setTitle(title: string): void {
    this.titleService.setTitle(title);
  }

  setDescription(description: string): void {
    this.metaService.updateTag({ name: 'description', content: description });
    this.metaService.updateTag({ property: 'og:description', content: description });
    this.metaService.updateTag({ name: 'twitter:description', content: description });
  }

  setKeywords(keywords: string): void {
    this.metaService.updateTag({ name: 'keywords', content: keywords });
  }

  setCanonicalUrl(url: string): void {
    const link: HTMLLinkElement = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    link.setAttribute('href', url);
    document.head.appendChild(link);
  }

  setOpenGraphTags(data: {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
    type?: string;
  }): void {
    if (data.title) {
      this.metaService.updateTag({ property: 'og:title', content: data.title });
    }
    if (data.description) {
      this.metaService.updateTag({ property: 'og:description', content: data.description });
    }
    if (data.image) {
      this.metaService.updateTag({ property: 'og:image', content: data.image });
    }
    if (data.url) {
      this.metaService.updateTag({ property: 'og:url', content: data.url });
    }
    if (data.type) {
      this.metaService.updateTag({ property: 'og:type', content: data.type });
    }
  }

  setTwitterCardTags(data: {
    title?: string;
    description?: string;
    image?: string;
  }): void {
    if (data.title) {
      this.metaService.updateTag({ name: 'twitter:title', content: data.title });
    }
    if (data.description) {
      this.metaService.updateTag({ name: 'twitter:description', content: data.description });
    }
    if (data.image) {
      this.metaService.updateTag({ name: 'twitter:image', content: data.image });
    }
  }

  // Method to update SEO for specific team pages
  updateTeamPageSeo(teamName: string, teamId: string): void {
    const title = `${teamName} Logo - Greek Football Logos`;
    const description = `View the official logo of ${teamName}. High-quality Greek football team logo from the Greek Super League.`;
    const keywords = `${teamName}, Greek football, football logo, Greek Super League, ${teamName} logo`;
    
    this.setTitle(title);
    this.setDescription(description);
    this.setKeywords(keywords);
    
    this.setOpenGraphTags({
      title,
      description,
      image: `https://greek-football-logos.site/assets/logos/${teamId}.png`,
      url: `https://greek-football-logos.site/team/${teamId}`,
      type: 'website'
    });
    
    this.setTwitterCardTags({
      title,
      description,
      image: `https://greek-football-logos.site/assets/logos/${teamId}.png`
    });
  }
} 