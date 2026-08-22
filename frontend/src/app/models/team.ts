import { League } from './league';
import { Logo } from './logo';

export interface Stadium {
  id?: number;
  name?: string;
  capacity?: number;
  built?: number;
  location?: string;
  latitude?: number;
  longitude?: number;
  region?: string;
}

export interface Colors {
  primary?: string;
  secondary?: string;
}

export interface Achievements {
  championships?: number;
  cups?: number;
}

export interface SocialMedia {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  youtube?: string;
}

export interface Team {
  id: string;
  name: string;
  shortName?: string;
  founded?: number;
  historyEn?: string;
  historyEl?: string;
  website?: string;
  league?: League;
  primaryLogo?: Logo;
  historicalLogos?: Logo[];
  stadium?: Stadium;
  colors?: Colors;
  achievements?: Achievements;
  socialMedia?: SocialMedia;
  path?: string;
  tags?: string[];
}
