export interface Mode {
  name: string;
  cursor: string;
  stroke: number;
}

export const NormalMode: Mode = {
  name: 'normal',
  cursor: 'default',
  stroke: 0,
};

export const DrawingMode: Mode = {
  name: 'draw',
  cursor: 'crosshair',
  stroke: 3,
};

export const EditMode: Mode = {
  name: 'edit',
  cursor: 'pointer',
  stroke: 0,
};

export const CreationMode: Mode = {
  name: 'create',
  cursor: 'default',
  stroke: 0,
};
