import { Annotation } from '../models/annotation.model';

export const annotations: Array<Annotation> = [
  {
    category: 'phase',
    description: 'Preparation',
    duration: 96,
    id: 1,
    videoId: 73,
    timestamp: 0,
    isOneShot: false,
  },
  {
    category: 'phase',
    description: 'Calot Triangle Dissection',
    duration: 629,
    id: 2,
    videoId: 73,
    timestamp: 97,
    isOneShot: false,
  },
  {
    category: 'action',
    description: 'Surgeon right hand using [Grasper]',
    duration: 29,
    id: 8,
    videoId: 73,
    timestamp: 43,
    isOneShot: false,
  },
  {
    category: 'action',
    description: 'Surgeon right hand using [Grasper]',
    duration: 2,
    id: 9,
    videoId: 73,
    timestamp: 74,
    isOneShot: false,
  },
  {
    id: 11,
    videoId: 4,
    category: 'svg',
    shape: {
      positions: {
        0: {
          x: 10,
          y: 10,
          width: 15,
          height: 15,
        },
        1000: {
          x: 20,
          y: 20,
          width: 20,
          height: 20,
        },
      },
    },
    label: {
      color: '#b31111',
      name: 'test',
      type: 'structure',
    },
    duration: 10000,
    timestamp: 0,
    isOneShot: false,
  },
];
