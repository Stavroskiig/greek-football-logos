import { League } from './league';

export interface Team {
    id: string;
    name: string;
    path: string;
    league?: League;
    tags?: string[];
  }
