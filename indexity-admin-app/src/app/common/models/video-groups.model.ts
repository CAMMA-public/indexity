import { Video } from './video.model';

export interface VideoGroup {
  id?: number;
  name: string;
  userId: number;
  description?: string;
  videoIds?: number[];
  videos?: Video[];
}
