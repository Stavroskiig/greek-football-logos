import { League } from './league';
import { Logo } from './logo';

export interface Stadium {
  name?: string;
  capacity?: number;
  built?: number;
  location?: string;
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
  fullName?: string;
  founded?: number;
  history?: string;
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
