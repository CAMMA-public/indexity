import { SurgShape } from './surg-shape.interface';

export interface AnnotationInterface {
  id?: number;
  category: string;
  createdAt: Date;
  updatedAt: Date;
  shape?: SurgShape;
  description?: string;
  duration: number;
  timestamp: number;
  ipAdress?: string;
  videoId: number;
  label: any;
  isOneShot: boolean;
}
