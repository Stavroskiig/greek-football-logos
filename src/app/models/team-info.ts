export interface TeamInfo {
  id: string;
  name: string;
  fullName: string;
  path: string;  // Logo path
  founded: number;
  stadium: {
    name: string;
    capacity: number;
    location: string;
    image?: string;
  };
  colors: {
    primary: string;
    secondary: string;
  };
  history: string;
  achievements: {
    leagueTitles: number;
    cupTitles: number;
    otherTitles?: { [key: string]: number };
  };
  website?: string;
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
  };
} 