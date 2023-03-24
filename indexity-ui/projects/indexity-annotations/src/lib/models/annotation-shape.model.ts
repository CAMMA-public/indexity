export interface AnnotationShape {
  positions: {
    [timestamp: number]: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  };
}
