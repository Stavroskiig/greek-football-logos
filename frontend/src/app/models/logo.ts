import { League } from './league';

export interface Logo {
  id: string;
  name: string;
  path: string;
  league?: League;
}