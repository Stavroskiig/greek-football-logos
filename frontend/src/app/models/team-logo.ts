import { League } from './league';

export interface TeamLogo {
    id: string;
    name: string;
    path: string;
    league?: League;
    tags?: string[];
  }