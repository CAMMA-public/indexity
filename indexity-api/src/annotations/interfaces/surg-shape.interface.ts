export interface SurgShape {
  positions: {
    [timestamp: number]: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  };
}
