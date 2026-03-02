export interface Collection {
  id: string;
  name: string;
  description: string;
  logoIds: string[];
  tags: string[];
  isPublic: boolean;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
  coverImage?: string;
  featured?: boolean;
} 