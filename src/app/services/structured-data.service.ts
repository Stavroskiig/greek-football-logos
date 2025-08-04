import { Injectable } from '@angular/core';
import { TeamLogo } from '../models/team-logo';

@Injectable({
  providedIn: 'root'
})
export class StructuredDataService {

  constructor() { }

  generateWebsiteStructuredData(): object {
    return {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Greek Football Logos",
      "alternateName": "Ελληνικά Λογότυπα Ποδοσφαίρου",
      "url": "https://greek-football-logos.site",
      "description": "Explore and discover Greek football team logos from all leagues. Browse logos by tags, search teams, and manage team tags.",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://greek-football-logos.site/misc?search={search_term_string}",
        "query-input": "required name=search_term_string"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Greek Football Logos",
        "url": "https://greek-football-logos.site"
      }
    };
  }

  generateOrganizationStructuredData(): object {
    return {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Greek Football Logos",
      "alternateName": "Ελληνικά Λογότυπα Ποδοσφαίρου",
      "url": "https://greek-football-logos.site",
      "description": "Complete collection of Greek football team logos from all leagues",
      "logo": "https://greek-football-logos.site/assets/images/logo.png",
      "sameAs": [
        "https://twitter.com/greekfootballlogos",
        "https://facebook.com/greekfootballlogos"
      ]
    };
  }

  generateTeamLogoStructuredData(team: TeamLogo): object {
    return {
      "@context": "https://schema.org",
      "@type": "SportsTeam",
      "name": team.name,
      "alternateName": team.name,
      "url": `https://greek-football-logos.site/team/${team.id}`,
      "logo": {
        "@type": "ImageObject",
        "url": `https://greek-football-logos.site/assets/logos/${team.id}.png`,
        "width": 200,
        "height": 200
      },
      "description": `Official logo of ${team.name}, Greek football team`,
      "sport": "Football",
      "league": team.league || "Greek Football League",
      "location": {
        "@type": "Place",
        "name": "Greece"
      }
    };
  }

  generateCollectionStructuredData(teams: TeamLogo[]): object {
    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": "Greek Football Team Logos",
      "description": "Complete collection of Greek football team logos",
      "numberOfItems": teams.length,
      "itemListElement": teams.map((team, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "SportsTeam",
          "name": team.name,
          "url": `https://greek-football-logos.site/team/${team.id}`,
          "logo": `https://greek-football-logos.site/assets/logos/${team.id}.png`
        }
      }))
    };
  }

  generateBreadcrumbStructuredData(breadcrumbs: Array<{name: string, url: string}>): object {
    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": breadcrumbs.map((crumb, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": crumb.name,
        "item": `https://greek-football-logos.site${crumb.url}`
      }))
    };
  }

  generateSearchPageStructuredData(): object {
    return {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Browse Logos by Tags - Greek Football Logos",
      "description": "Browse and filter Greek football team logos by tags. Search for specific teams and discover logos from all Greek football leagues.",
      "url": "https://greek-football-logos.site/misc",
      "mainEntity": {
        "@type": "ItemList",
        "name": "Greek Football Team Logos",
        "description": "Filterable collection of Greek football team logos"
      }
    };
  }

  generateTagManagerStructuredData(): object {
    return {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "Tag Manager - Greek Football Logos",
      "description": "Manage team tags and organize Greek football logos. Add, remove, and organize tags for better logo discovery.",
      "url": "https://greek-football-logos.site/tag-manager",
      "applicationCategory": "SportsApplication",
      "operatingSystem": "Web Browser"
    };
  }

  injectStructuredData(data: object): void {
    // Remove existing structured data
    const existingScript = document.querySelector('script[type="application/ld+json"]');
    if (existingScript) {
      existingScript.remove();
    }

    // Add new structured data
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
  }

  injectMultipleStructuredData(dataArray: object[]): void {
    // Remove existing structured data
    const existingScripts = document.querySelectorAll('script[type="application/ld+json"]');
    existingScripts.forEach(script => script.remove());

    // Add new structured data
    dataArray.forEach(data => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(data);
      document.head.appendChild(script);
    });
  }
} 