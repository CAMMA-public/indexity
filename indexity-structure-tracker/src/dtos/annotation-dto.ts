export class AnnotationDto {
  id: number;
  createdAt: string;
  updatedAt: string;
  category: string;
  description: string;
  duration: number;
  timestamp: number;
  userId: number;
  videoId: number;
  labelName: string;
  isOneShot: boolean;
  instance: string;
  isFalsePositive: false;

  shape: {
    positions: {
      [timestamp: string]: {
        x: number;
        y: number;
        width: number;
        height: number;
      };
    };
  };
  label: {
    name: string;
    color: string;
    type: string;
  };
  video: AnnotationVideoDto;
}

export class AnnotationVideoDto {
  id: number;
  createdAt: string;
  updatedAt: string;
  url: string;
  description: string;
  name: string;
  fileName: string;
  thumbnailUrl: string;
  userId: number;
  isOriginal: boolean;
  height: number;
  width: number;
  parentId: number;
  groupsIds: number[];
  childrenIds: number[];
  format: string;
}
